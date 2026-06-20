// Cloudflare Pages Function — /api/playground
//
// Public-facing free endpoint for the homepage playground.
// No API key, no signup, no login. Rate-limited to ONE call per
// browser per UTC day via a signed cookie.
//
// Architecture:
//   1. Browser POSTs { email, ip, phone } to /api/playground
//   2. We check the signed cookie — if it exists for today's date,
//      return 429 with a "come back tomorrow" message.
//   3. Otherwise we forward the request to the real /v1/check
//      endpoint with SIGNUPDOGGY_DEMO_KEY (server-side only).
//   4. We set the cookie so the next request returns 429.
//
// The cookie is signed with HMAC-SHA256 using COOKIE_SECRET. A user
// who clears their cookies can bypass — that's the simplest possible
// limit and matches the user's "one free call" requirement. For a
// tighter limit, swap to Cloudflare KV (see the comment at the bottom).
//
// Deployment:
//   Add env vars in Cloudflare Pages dashboard → Settings → Environment variables:
//     SIGNUPDOGGY_DEMO_KEY  — the real API key to use for playground calls
//     COOKIE_SECRET        — random 32+ char string (defaults to a fallback
//                            but you should set this in production)

interface Env {
  SIGNUPDOGGY_DEMO_KEY?: string;
  COOKIE_SECRET?: string;
}

const API_BASE = 'https://signupdoggy-api.jeffrinjames99.workers.dev';
const COOKIE_NAME = 'sd_pg_used';
const COOKIE_TTL_HOURS = 24;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // ── Parse request ─────────────────────────────────────────────────────────
  let body: { email?: string; ip?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const email = (body.email || '').trim();
  const ip = (body.ip || '').trim();
  const phone = (body.phone || '').trim();

  // At least one signal required by the API.
  if (!email && !ip && !phone) {
    return new Response(
      JSON.stringify({ error: 'Provide at least one of email, IP, or phone.' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  // ── Rate-limit check ─────────────────────────────────────────────────────
  const cookieHeader = request.headers.get('Cookie') || '';
  const usedCookie = parseCookie(cookieHeader)[COOKIE_NAME];
  const today = utcDate();
  const secret = env.COOKIE_SECRET || 'sd-playground-dev-secret-change-me-in-production';

  if (usedCookie) {
    const expected = await sign(`${today}|used`, secret);
    if (usedCookie === expected) {
      return new Response(
        JSON.stringify({
          error: 'free_limit_reached',
          message: 'You used your free playground call today. Get an API key for unlimited checks — credits start at $5 and never expire.',
          next_available: nextUtcMidnightIso(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(secondsUntilUtcMidnight()),
            ...CORS,
          },
        }
      );
    }
    // Cookie is stale (different day) — fall through and re-issue.
  }

  // ── Validate API key is configured ──────────────────────────────────────
  const apiKey = env.SIGNUPDOGGY_DEMO_KEY;
  if (!apiKey) {
    // In production this is a hard 500. In dev we still return a
    // meaningful error so the user knows what to do.
    return new Response(
      JSON.stringify({
        error: 'playground_not_configured',
        message: 'The free playground is not configured on this deployment. Set SIGNUPDOGGY_DEMO_KEY in the Cloudflare Pages dashboard.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  // ── Forward to real API ──────────────────────────────────────────────────
  const t0 = Date.now();
  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_BASE}/v1/check`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(email ? { email } : {}),
        ...(ip ? { ip } : {}),
        ...(phone ? { phone } : {}),
      }),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'upstream_unreachable', message: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const apiBody = await apiRes.text();
  const upstreamMs = Date.now() - t0;

  // ── Set the rate-limit cookie and return ─────────────────────────────────
  const signed = await sign(`${today}|used`, secret);
  const cookieValue = [
    `${COOKIE_NAME}=${signed}`,
    `Path=/`,
    `Max-Age=${COOKIE_TTL_HOURS * 3600}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ].join('; ');

  // If upstream returned an error, surface it but DON'T burn the cookie —
  // the user can retry with different inputs.
  if (!apiRes.ok) {
    return new Response(
      JSON.stringify({
        error: 'upstream_error',
        status: apiRes.status,
        message: apiBody.slice(0, 500),
      }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  return new Response(
    JSON.stringify({
      result: safeJsonParse(apiBody),
      upstream_ms: upstreamMs,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieValue,
        ...CORS,
      },
    }
  );
};

// CORS preflight.
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// ── Helpers ────────────────────────────────────────────────────────────────

function parseCookie(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = rest.join('=');
  }
  return out;
}

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextUtcMidnightIso(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

function secondsUntilUtcMidnight(): number {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((d.getTime() - Date.now()) / 1000));
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

// HMAC-SHA256 → hex (works in both Workers runtime and Pages Functions runtime).
async function sign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Future: KV-backed rate limit ────────────────────────────────────────────
//
// If you want a tighter limit that survives cookie clears, add a KV
// namespace binding to this Pages Function and replace the cookie
// check above with a KV counter:
//
//   const kv = env.PLAYGROUND_KV; // KVNamespace binding
//   const key = `used:${cfConnectingIp}:${utcDate()}`;
//   const prior = await kv.get(key);
//   if (prior) return new Response('...', { status: 429 });
//   await kv.put(key, '1', { expirationTtl: 86400 });
//
// KV gives you per-IP daily limiting that's robust to cookie clearing.
// Pages Functions support KV bindings via the dashboard.
// ───────────────────────────────────────────────────────────────────────────