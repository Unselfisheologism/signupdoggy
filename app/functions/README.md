# Cloudflare Pages Functions — `/api/playground`

The `/api/playground` function is a server-side proxy that lets
visitors hit the real SignupDoggy `/v1/check` endpoint without
needing an API key, signup, or login.

**Rate limit:** one free call per browser per UTC day. Implemented via
a signed cookie (`sd_pg_used`) — clearing cookies resets the limit.

## Required environment variables

Set these in **Cloudflare Pages dashboard → Settings → Environment variables**
(both Production and Preview):

| Variable | Required | Description |
|---|---|---|
| `SIGNUPDOGGY_DEMO_KEY` | **Yes** | The real SignupDoggy API key used to forward playground calls. Get one at `/dashboard` → API Keys, or use the founder's master key for a low-traffic playground. |
| `COOKIE_SECRET` | Recommended | A random 32+ character string used to HMAC-sign the rate-limit cookie. Without it set, the function falls back to a hardcoded dev secret (insecure for production). |

### How to set them

1. Go to https://dash.cloudflare.com/ → Pages → `signupdoggy`
2. Click **Settings** → **Environment variables**
3. Add:
   - Variable name: `SIGNUPDOGGY_DEMO_KEY`
   - Value: your SignupDoggy API key (starts with `SD_...`)
   - Environment: **Production** (and **Preview** if you want playground on preview deploys)
4. Repeat for `COOKIE_SECRET` (any random string, e.g. `openssl rand -hex 32`)
5. **Important**: redeploy after adding env vars (Cloudflare does not
   automatically inject new env vars into existing deployments).

Generate a secret locally with:
```bash
openssl rand -hex 32
```

## Verifying the function works

After deploy + env var setup, test the function directly:

```bash
curl -X POST https://signupdoggy.pages.dev/api/playground \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tempmail.com","ip":"8.8.8.8"}'
```

Expected response (success):
```json
{
  "result": {
    "email": { "is_disposable": true, "domain": "tempmail.com", "risk_score": 95 },
    "ip": { "is_tor": false, "is_proxy": false, "is_hosting": false, "asn": "AS15169", "risk_score": 0 },
    "phone": null,
    "overall_risk": "high",
    "recommendation": "block"
  },
  "upstream_ms": 47
}
```

Expected response (limit reached — call this twice in a row):
```json
{
  "error": "free_limit_reached",
  "message": "You used your free playground call today. Get an API key for unlimited checks — credits start at $5 and never expire.",
  "next_available": "2026-06-21T00:00:00.000Z"
}
```

## How it works

```
Browser
  │ POST /api/playground { email, ip, phone }
  ▼
Cloudflare Pages Function
  ├─ 1. Read cookie `sd_pg_used` (HMAC-signed with COOKIE_SECRET)
  │     → if valid for today's UTC date, return 429
  ├─ 2. POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check
  │     with x-api-key: SIGNUPDOGGY_DEMO_KEY
  ├─ 3. Set `sd_pg_used` cookie (HttpOnly, SameSite=Lax, 24h TTL)
  └─ 4. Return upstream response
```

## Tightening the limit (optional)

The cookie-based limit is the simplest possible. Clearing cookies resets
it. For production-grade per-IP enforcement, swap to Cloudflare KV:

1. Create a KV namespace in the Cloudflare dashboard (Workers → KV).
2. Bind it to the Pages Function: dashboard → Pages → Settings →
   Functions → KV namespace bindings → Variable name `PLAYGROUND_KV`.
3. Replace the cookie check in `playground.ts` with a KV counter.

The comment block at the bottom of `playground.ts` shows the diff.

## Local development

Pages Functions don't run in `vite preview`. To test locally:

```bash
npx wrangler pages dev ./dist --port 8788
```

You'll need:
- `dist/` (already built via `npm run build`)
- A `wrangler.toml` or `.dev.vars` file with `SIGNUPDOGGY_DEMO_KEY` set

Create `app/.dev.vars`:
```
SIGNUPDOGGY_DEMO_KEY=SD_your_test_key_here
COOKIE_SECRET=any-random-string-for-local-dev
```

(`.dev.vars` is gitignored — see `.gitignore`.)

## Files

- `functions/api/playground.ts` — the function itself
- `app/.gitignore` should include `.dev.vars`
- The React playground UI lives at `app/src/pages/Landing.tsx` in the
  `PlaygroundSection` component, rendered just below the hero.