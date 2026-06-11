import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Env = {
  API_KEYS: KVNamespace;
  USAGE_LOG: KVNamespace;
  USER_BLACKLISTS: KVNamespace;
  USERS: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PRICE_PER_REQUEST: string;
  DODO_API_KEY: string;
  DODO_WEBHOOK_KEY?: string;
  DODO_BASE_URL?: string;
  DODO_CREDIT_ENTITLEMENT_ID: string;
  DODO_METER_EVENT_NAME: string;
  DODO_AUTOPAY_PRODUCT_ID: string;
  DODO_AUTOPAY_THRESHOLD: string;
  DODO_BRAND_ID: string;
};

export type ApiKeyRecord = {
  user_id: string;
  created: string;
  metadata?: { stripe_customer_id: string | null };
};

export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: { name?: string };
  created_at: string;
};

export type Products = {
  starter: { id: string; price: number; credits: number };
  growth: { id: string; price: number; credits: number };
  pro: { id: string; price: number; credits: number };
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sd_';
  for (let i = 0; i < 48; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Dodo Payments API helper ──────────────────────────────────────────────────

async function dodoFetch<T>(env: Env, method: string, path: string, body?: unknown): Promise<T> {
  const base = env.DODO_BASE_URL || 'https://live.dodopayments.com';
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${env.DODO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dodo API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

const PRODUCTS: Products = {
  starter: { id: 'pdt_0NgohFQN7SnJHnXa1wxYE', price: 1000, credits: 1000 },
  growth: { id: 'pdt_0NgohFU8YXlsLQL1HPqMb', price: 5000, credits: 5000 },
  pro: { id: 'pdt_0NgohFXieflgTTjr1UUGv', price: 10000, credits: 10000 },
};

// ─── Validate Supabase JWT via REST API ────────────────────────────────────────

async function validateSupabaseSession(token: string, env: Env): Promise<SupabaseUser | null> {
  try {
    const resp = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_ANON_KEY,
      },
    });
    if (!resp.ok) return null;
    return await resp.json() as SupabaseUser;
  } catch {
    return null;
  }
}

// ─── App ────────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env; Variables: { user: SupabaseUser } }>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-Token'],
}));

// ─── Auth Middleware ────────────────────────────────────────────────────────────

async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Not authenticated' }, 401);

  const env: Env = c.env as Env;
  const user = await validateSupabaseSession(auth.slice(7), env);
  if (!user) return c.json({ error: 'Invalid or expired session' }, 401);

  c.set('user', user);
  await next();
}

// ─── POST /api/auth/signup (proxies to Supabase Auth) ─────────────────────────

app.post('/api/auth/signup', async (c) => {
  const body: { email?: string; password?: string; name?: string } = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const resp = await fetch(`${c.env.SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': c.env.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: body.email.toLowerCase().trim(),
      password: body.password,
      data: { name: body.name || body.email.split('@')[0] },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    let err;
    try { err = JSON.parse(text); } catch { err = { error: text }; }
    if (err.msg?.includes('already registered') || err.error?.includes('duplicate') || err.message?.includes('already exists')) {
      return c.json({ error: 'Email already registered' }, 409);
    }
    return c.json({ error: err.msg || err.error || err.message || `Signup failed (${resp.status})` }, resp.status);
  }

  const authData = await resp.json() as any;

  // Auto-create an API key for the new user
  const apiKey = generateApiKey();
  const created = getToday();
  const userId = authData.user?.id || authData.id;
  const keyRecord: ApiKeyRecord = {
    user_id: userId,
    created,
    metadata: { stripe_customer_id: null },
  };

  await c.env.API_KEYS.put(apiKey, JSON.stringify(keyRecord));
  await c.env.USERS.put(`keys:${userId}`, JSON.stringify([apiKey]));

  return c.json({
    user: {
      id: userId,
      email: authData.user?.email || body.email,
      name: body.name || body.email.split('@')[0],
      created: authData.user?.created_at || created,
    },
    api_key: { key: apiKey, created },
    token: authData.access_token,
  }, 201);
});

// ─── POST /api/auth/login (proxies to Supabase Auth) ──────────────────────────

app.post('/api/auth/login', async (c) => {
  const body: { email?: string; password?: string } = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const resp = await fetch(`${c.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': c.env.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: body.email.toLowerCase().trim(),
      password: body.password,
    }),
  });

  if (!resp.ok) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const authData = await resp.json() as any;

  return c.json({
    user: {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0],
      created: authData.user.created_at,
    },
    token: authData.access_token,
    refresh_token: authData.refresh_token,
  });
});

// ─── GET /api/me ────────────────────────────────────────────────────────────────

app.get('/api/me', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0],
    created: user.created_at,
  });
});

// ─── GET /api/keys — List API keys ─────────────────────────────────────────────

app.get('/api/keys', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const keys: { key: string; created: string; usage_today: number }[] = [];

  const userKeysIndex = await c.env.USERS.get(`keys:${user.id}`);
  if (!userKeysIndex) return c.json({ keys: [] });

  const keyList: string[] = JSON.parse(userKeysIndex);
  const today = getToday();

  for (const key of keyList) {
    const recordStr = await c.env.API_KEYS.get(key);
    if (!recordStr) continue;
    const record: ApiKeyRecord = JSON.parse(recordStr);
    const usageStr = await c.env.USAGE_LOG.get(`usage:${key}:${today}`);
    const usage = usageStr ? parseInt(usageStr, 10) : 0;
    keys.push({ key: key.slice(0, 12) + '...', created: record.created, usage_today: usage });
  }

  return c.json({ keys });
});

// ─── POST /api/keys — Create new API key ───────────────────────────────────────

app.post('/api/keys', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const apiKey = generateApiKey();
  const today = getToday();

  const record: ApiKeyRecord = {
    user_id: user.id,
    created: today,
    metadata: { stripe_customer_id: null },
  };

  await c.env.API_KEYS.put(apiKey, JSON.stringify(record));

  const existingIndex = await c.env.USERS.get(`keys:${user.id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];
  keyList.push(apiKey);
  await c.env.USERS.put(`keys:${user.id}`, JSON.stringify(keyList));

  return c.json({ key: apiKey, created: today, message: 'Save this key — it will not be shown again.' }, 201);
});

// ─── DELETE /api/keys/:prefix — Revoke API key ─────────────────────────────────

app.delete('/api/keys/:prefix', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const prefix = c.req.param('prefix');

  const existingIndex = await c.env.USERS.get(`keys:${user.id}`);
  if (!existingIndex) return c.json({ error: 'No keys found' }, 404);

  const keyList: string[] = JSON.parse(existingIndex);
  const match = keyList.find(k => k.startsWith(prefix));
  if (!match) return c.json({ error: 'Key not found' }, 404);

  await c.env.API_KEYS.delete(match);
  const updated = keyList.filter(k => k !== match);
  await c.env.USERS.put(`keys:${user.id}`, JSON.stringify(updated));

  return c.json({ message: 'Key revoked' });
});

// ─── GET /api/usage — Usage analytics ──────────────────────────────────────────

app.get('/api/usage', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;

  const days: { date: string; requests: number; blocked: number; cost: number }[] = [];
  const today = new Date();
  const price = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');

  const existingIndex = await c.env.USERS.get(`keys:${user.id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let totalRequests = 0;
    let totalBlocked = 0;

    for (const key of keyList) {
      const usageStr = await c.env.USAGE_LOG.get(`usage:${key}:${dateStr}`);
      if (usageStr) totalRequests += parseInt(usageStr, 10);
    }

    const blockedStr = await c.env.USAGE_LOG.get(`blocked:${dateStr}:total`);
    if (blockedStr) totalBlocked = parseInt(blockedStr, 10);

    days.push({
      date: dateStr,
      requests: totalRequests,
      blocked: totalBlocked,
      cost: parseFloat((totalRequests * price).toFixed(2)),
    });
  }

  const totalRequests = days.reduce((s, d) => s + d.requests, 0);
  const totalBlocked = days.reduce((s, d) => s + d.blocked, 0);
  const totalCost = parseFloat((totalRequests * price).toFixed(2));

  return c.json({ days, totals: { total_requests: totalRequests, total_blocked: totalBlocked, total_cost_usd: totalCost } });
});

// ─── GET /api/billing — Billing history ────────────────────────────────────────

app.get('/api/billing', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const today = new Date();
  const price = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');

  const existingIndex = await c.env.USERS.get(`keys:${user.id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];

  if (keyList.length === 0) {
    return c.json({ months: [], total_all_time: 0 });
  }

  const months: { month: string; requests: number; cost: number }[] = [];

  for (let m = 5; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    let totalRequests = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
      for (const key of keyList) {
        const usageStr = await c.env.USAGE_LOG.get(`usage:${key}:${dateStr}`);
        if (usageStr) totalRequests += parseInt(usageStr, 10);
      }
    }

    months.push({
      month: monthStr,
      requests: totalRequests,
      cost: parseFloat((totalRequests * price).toFixed(2)),
    });
  }

  const totalAllTime = months.reduce((s, m) => s + m.cost, 0);

  return c.json({ months, total_all_time: parseFloat(totalAllTime.toFixed(2)) });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  DODO PAYMENTS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POST /api/checkout — Create checkout session ──────────────────────────────

app.post('/api/checkout', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const body: { pack?: string; return_url?: string } = await c.req.json();
  const pack = body.pack || 'starter';

  const product = (PRODUCTS as any)[pack];
  if (!product) return c.json({ error: 'Invalid pack. Choose: starter, growth, pro' }, 400);

  try {
    // First, create or retrieve the Dodo customer for this user
    const dodoCustomerId = await getOrCreateDodoCustomer(c.env, user);

    // Create checkout session
    const session = await dodoFetch<any>(c.env, 'POST', '/checkouts', {
      product_cart: [{ product_id: product.id, quantity: 1 }],
      customer: { customer_id: dodoCustomerId },
      return_url: body.return_url || 'https://signupdoggy.pages.dev/dashboard',
      metadata: {
        user_id: user.id,
        pack: pack,
        credits: String(product.credits),
        price: String(product.price),
      },
    });

    return c.json({
      session_id: session.session_id,
      checkout_url: session.checkout_url,
      client_secret: session.client_secret,
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create checkout' }, 500);
  }
});

// ─── GET /api/products — List available packs ──────────────────────────────────

app.get('/api/products', authMiddleware, async (c) => {
  return c.json({
    products: [
      { id: 'starter', name: 'Starter Pack', price: 10, credits: 1000, description: '1,000 API requests' },
      { id: 'growth', name: 'Growth Pack', price: 50, credits: 5000, description: '5,000 API requests' },
      { id: 'pro', name: 'Pro Pack', price: 100, credits: 10000, description: '10,000 API requests' },
    ],
  });
});

// ─── POST /api/webhook/dodopayments — Handle payment events ────────────────────

app.post('/api/webhook/dodopayments', async (c) => {
  const signature = c.req.header('x-webhook-signature');
  const body = await c.req.json() as any;
  const eventType = body.type || body.event_type;

  // Verify webhook signature if key is configured
  if (c.env.DODO_WEBHOOK_KEY && !signature) {
    return c.json({ error: 'Missing webhook signature' }, 401);
  }

  console.log(`[Webhook] Received: ${eventType}`, JSON.stringify(body).slice(0, 300));

  if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
    const paymentData = body.data || body;
    const metadata = paymentData.metadata || {};
    const userId = metadata.user_id;
    const packName = metadata.pack;
    const creditsStr = metadata.credits;

    if (!userId || !creditsStr) {
      return c.json({ error: 'Missing user_id or credits in metadata' }, 200); // acknowledge but don't process
    }

    const credits = parseInt(creditsStr, 10);

    // Record payment in KV
    const paymentKey = `payments:${userId}`;
    const existing = await c.env.USERS.get(paymentKey);
    const payments: any[] = existing ? JSON.parse(existing) : [];
    payments.push({
      id: paymentData.id || paymentData.payment_id,
      pack: packName,
      credits,
      amount: paymentData.amount_paid || paymentData.amount || 0,
      date: getToday(),
    });
    await c.env.USERS.put(paymentKey, JSON.stringify(payments));

    // Add credits to user's balance
    const balanceKey = `credits:${userId}`;
    const currentBalance = parseInt(await c.env.USERS.get(balanceKey) || '0', 10);
    await c.env.USERS.put(balanceKey, String(currentBalance + credits));

    console.log(`[Webhook] Credited ${credits} to user ${userId}. New balance: ${currentBalance + credits}`);

    return c.json({ received: true, credited: credits, balance: currentBalance + credits });
  }

  return c.json({ received: true, event: eventType });
});

// ─── GET /api/credits — Check credit balance ──────────────────────────────────

app.get('/api/credits', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const balanceKey = `credits:${user.id}`;
  const balance = parseInt(await c.env.USERS.get(balanceKey) || '0', 10);

  const paymentKey = `payments:${user.id}`;
  const existing = await c.env.USERS.get(paymentKey);
  const payments: any[] = existing ? JSON.parse(existing) : [];

  return c.json({
    balance,
    total_purchased: payments.reduce((s: number, p: any) => s + (p.credits || 0), 0),
    total_spent: payments.reduce((s: number, p: any) => s + (p.amount || 0), 0),
    payments: payments.slice(-10).reverse(),
  });
});

// ─── POST /api/autopay — Configure or trigger autopay ─────────────────────────

app.post('/api/autopay', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const body: { enabled?: boolean; threshold?: number; top_up_product?: string } = await c.req.json();

  const autopayKey = `autopay:${user.id}`;
  const existing = await c.env.USERS.get(autopayKey);
  const config = existing ? JSON.parse(existing) : { enabled: false, threshold: 500, top_up_product: 'growth' };

  if (body.enabled !== undefined) config.enabled = body.enabled;
  if (body.threshold) config.threshold = body.threshold;
  if (body.top_up_product) config.top_up_product = body.top_up_product;

  await c.env.USERS.put(autopayKey, JSON.stringify(config));

  return c.json({ autopay: config });
});

// ─── GET /api/autopay — Get autopay config ────────────────────────────────────

app.get('/api/autopay', authMiddleware, async (c) => {
  const user = c.get('user') as SupabaseUser;
  const autopayKey = `autopay:${user.id}`;
  const existing = await c.env.USERS.get(autopayKey);
  const config = existing ? JSON.parse(existing) : { enabled: false, threshold: 500, top_up_product: 'growth' };

  return c.json({ autopay: config });
});

// ─── Helper: Get or create Dodo customer ─────────────────────────────────────

async function getOrCreateDodoCustomer(env: Env, user: SupabaseUser): Promise<string> {
  const customerKey = `dodo_customer:${user.id}`;
  const existing = await env.USERS.get(customerKey);
  if (existing) return existing;

  // Create a new customer in Dodo Payments
  const customer: any = await dodoFetch(env, 'POST', '/customers', {
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0],
    metadata: { supabase_user_id: user.id },
  });

  const customerId = customer.id || customer.customer_id;
  await env.USERS.put(customerKey, customerId);
  return customerId;
}

// ─── GET / — Health ────────────────────────────────────────────────────────────

app.get('/', (c) => c.json({ service: 'SignupDoggy Portal API', version: '3.0.0', auth: 'supabase', payments: 'dodopayments' }));

// ─── Export ─────────────────────────────────────────────────────────────────────

export default app;
