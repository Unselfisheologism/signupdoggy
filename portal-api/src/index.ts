import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Env = {
  API_KEYS: KVNamespace;
  USAGE_LOG: KVNamespace;
  USER_BLACKLISTS: KVNamespace;
  USERS: KVNamespace;
  JWT_SECRET: string;
  PRICE_PER_REQUEST: string;
};

export type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created: string;
  stripe_customer_id: string | null;
};

export type ApiKeyRecord = {
  user_id: string;
  created: string;
  metadata?: { stripe_customer_id: string | null };
};

export type JWTPayload = {
  user_id: string;
  email: string;
  exp: number;
};

// ─── Auth Helpers ───────────────────────────────────────────────────────────────

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function createJWT(payload: Omit<JWTPayload, 'exp'>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days
  const body = btoa(JSON.stringify({ ...payload, exp }));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${header}.${body}.${sigB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC', key, Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0)),
      enc.encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    const payload: JWTPayload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 24; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'rg_';
  for (let i = 0; i < 48; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── App ────────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-Token'],
}));

// ─── Auth Middleware ────────────────────────────────────────────────────────────

async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Not authenticated' }, 401);
  const payload = await verifyJWT(auth.slice(7), c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401);
  c.set('user', payload);
  await next();
}

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────

app.post('/api/auth/signup', async (c) => {
  const body: { email?: string; password?: string; name?: string } = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }
  if (body.password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  const email = body.email.toLowerCase().trim();
  const existing = await c.env.USERS.get(email);
  if (existing) return c.json({ error: 'Email already registered' }, 409);

  const salt = generateId();
  const password_hash = await hashPassword(body.password, salt);
  const userId = `usr_${generateId()}`;

  const record: UserRecord = {
    id: userId,
    email,
    password_hash: `${salt}:${password_hash}`,
    name: body.name || email.split('@')[0],
    created: new Date().toISOString().split('T')[0],
    stripe_customer_id: null,
  };

  await c.env.USERS.put(email, JSON.stringify(record));

  // Auto-create an API key for the new user
  const apiKey = generateApiKey();
  const keyRecord: ApiKeyRecord = {
    user_id: userId,
    created: record.created,
    metadata: { stripe_customer_id: null },
  };
  await c.env.API_KEYS.put(apiKey, JSON.stringify(keyRecord));

  // Index the key for this user
  await c.env.USERS.put(`keys:${userId}`, JSON.stringify([apiKey]));

  const token = await createJWT({ user_id: userId, email }, c.env.JWT_SECRET);

  return c.json({
    user: { id: userId, email, name: record.name, created: record.created },
    api_key: { key: apiKey, created: record.created },
    token,
  }, 201);
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

app.post('/api/auth/login', async (c) => {
  const body: { email?: string; password?: string } = await c.req.json();
  if (!body.email || !body.password) return c.json({ error: 'Email and password required' }, 400);

  const email = body.email.toLowerCase().trim();
  const existing = await c.env.USERS.get(email);
  if (!existing) return c.json({ error: 'Invalid email or password' }, 401);

  const record: UserRecord = JSON.parse(existing);
  const [salt, storedHash] = record.password_hash.split(':');
  const hash = await hashPassword(body.password, salt);

  if (hash !== storedHash) return c.json({ error: 'Invalid email or password' }, 401);

  const token = await createJWT({ user_id: record.id, email }, c.env.JWT_SECRET);

  return c.json({
    user: { id: record.id, email: record.email, name: record.name, created: record.created },
    token,
  });
});

// ─── GET /api/me ────────────────────────────────────────────────────────────────

app.get('/api/me', authMiddleware, async (c) => {
  const user = c.get('user') as JWTPayload;
  const existing = await c.env.USERS.get(user.email);
  if (!existing) return c.json({ error: 'User not found' }, 404);
  const record: UserRecord = JSON.parse(existing);
  return c.json({ id: record.id, email: record.email, name: record.name, created: record.created });
});

// ─── GET /api/keys — List API keys ─────────────────────────────────────────────

app.get('/api/keys', authMiddleware, async (c) => {
  const user = c.get('user') as JWTPayload;
  const keys: { key: string; created: string; usage_today: number }[] = [];

  // List all keys from API_KEYS namespace that belong to this user
  // KV doesn't support listing by value, so we maintain a user→keys index
  const userKeysIndex = await c.env.USERS.get(`keys:${user.user_id}`);
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
  const user = c.get('user') as JWTPayload;
  const apiKey = generateApiKey();
  const today = new Date().toISOString().split('T')[0];

  const record: ApiKeyRecord = {
    user_id: user.user_id,
    created: today,
    metadata: { stripe_customer_id: null },
  };

  await c.env.API_KEYS.put(apiKey, JSON.stringify(record));

  // Update user→keys index
  const existingIndex = await c.env.USERS.get(`keys:${user.user_id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];
  keyList.push(apiKey);
  await c.env.USERS.put(`keys:${user.user_id}`, JSON.stringify(keyList));

  return c.json({ key: apiKey, created: today, message: 'Save this key — it will not be shown again.' }, 201);
});

// ─── DELETE /api/keys/:prefix — Revoke API key ─────────────────────────────────

app.delete('/api/keys/:prefix', authMiddleware, async (c) => {
  const user = c.get('user') as JWTPayload;
  const prefix = c.req.param('prefix');

  const existingIndex = await c.env.USERS.get(`keys:${user.user_id}`);
  if (!existingIndex) return c.json({ error: 'No keys found' }, 404);

  const keyList: string[] = JSON.parse(existingIndex);
  const match = keyList.find(k => k.startsWith(prefix));
  if (!match) return c.json({ error: 'Key not found' }, 404);

  await c.env.API_KEYS.delete(match);
  const updated = keyList.filter(k => k !== match);
  await c.env.USERS.put(`keys:${user.user_id}`, JSON.stringify(updated));

  return c.json({ message: 'Key revoked' });
});

// ─── GET /api/usage — Usage analytics ──────────────────────────────────────────

app.get('/api/usage', authMiddleware, async (c) => {
  const user = c.get('user') as JWTPayload;

  // Get last 30 days of usage
  const days: { date: string; requests: number; blocked: number; cost: number }[] = [];
  const today = new Date();
  const price = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');

  // Get user's keys
  const existingIndex = await c.env.USERS.get(`keys:${user.user_id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let totalRequests = 0;
    let totalBlocked = 0;

    // Sum across all keys
    for (const key of keyList) {
      const usageStr = await c.env.USAGE_LOG.get(`usage:${key}:${dateStr}`);
      if (usageStr) totalRequests += parseInt(usageStr, 10);
    }

    // Blocked total (tracked per-day, not per-key)
    const blockedStr = await c.env.USAGE_LOG.get(`blocked:${dateStr}:total`);
    if (blockedStr) totalBlocked = parseInt(blockedStr, 10);

    days.push({
      date: dateStr,
      requests: totalRequests,
      blocked: totalBlocked,
      cost: parseFloat((totalRequests * price).toFixed(2)),
    });
  }

  // Totals
  const totalRequests = days.reduce((s, d) => s + d.requests, 0);
  const totalBlocked = days.reduce((s, d) => s + d.blocked, 0);
  const totalCost = parseFloat((totalRequests * price).toFixed(2));

  return c.json({ days, totals: { total_requests: totalRequests, total_blocked: totalBlocked, total_cost_usd: totalCost } });
});

// ─── GET /api/billing — Billing history ────────────────────────────────────────

app.get('/api/billing', authMiddleware, async (c) => {
  const user = c.get('user') as JWTPayload;

  // Calculate monthly billing history from daily usage
  const today = new Date();
  const price = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');
  const months: { month: string; requests: number; cost: number }[] = [];

  // Get user's keys
  const existingIndex = await c.env.USERS.get(`keys:${user.user_id}`);
  const keyList: string[] = existingIndex ? JSON.parse(existingIndex) : [];

  if (keyList.length === 0) {
    return c.json({ months: [], total_all_time: 0 });
  }

  // Look back 6 months
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

// ─── GET / — Health ────────────────────────────────────────────────────────────

app.get('/', (c) => c.json({ service: 'RegisterGuardian Portal API', version: '1.0.0' }));

// ─── Export ─────────────────────────────────────────────────────────────────────

export default app;
