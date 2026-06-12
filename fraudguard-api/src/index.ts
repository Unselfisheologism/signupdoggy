import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

// ─── Type Definitions ───────────────────────────────────────────────────────────

export type Env = {
  DISPOSABLE_EMAILS: KVNamespace;
  DISPOSABLE_PHONE_NUMBERS: KVNamespace;
  TOR_EXIT_NODES: KVNamespace;
  HOSTING_IP_RANGES: KVNamespace;
  API_KEYS: KVNamespace;
  USAGE_LOG: KVNamespace;
  USER_BLACKLISTS: KVNamespace;
  USERS: KVNamespace;
  SYNC_LOGS: KVNamespace;
  PRICE_PER_REQUEST: string;
  MAXMIND_LICENSE_KEY: string;
  FOUNDER_EMAILS: string;
};

export type ApiKeyRecord = {
  user_id: string;
  created: string;
  metadata?: { stripe_customer_id: string | null };
};

export type CheckRequest = {
  email?: string;
  ip?: string;
  phone?: string;
};

export type UserBlacklist = {
  emails: string[];
  ips: string[];
  phones: string[];
};

export type CheckResponse = {
  email: {
    is_disposable: boolean;
    domain: string;
    risk_score: number;
  } | null;
  phone: {
    is_disposable: boolean;
    number: string;
    risk_score: number;
  } | null;
  ip: {
    is_tor: boolean;
    is_proxy: boolean;
    is_hosting: boolean;
    asn: string | null;
    risk_score: number;
  } | null;
  overall_risk: 'low' | 'medium' | 'high';
  recommendation: 'allow' | 'review' | 'block';
};

export type StatsResponse = {
  period: string;
  total_requests: number;
  blocked_count: number;
  blocked_by_reason: {
    disposable_email: number;
    tor_exit: number;
    proxy: number;
    custom_blacklist: number;
    disposable_phone: number;
  };
  estimated_cost_usd: number;
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const HOSTING_ASNS = new Set([
  'AS14618', // Amazon AWS
  'AS16509', // Amazon AWS (us-east-1)
  'AS7224',  // Amazon AWS (us-west-1)
  'AS9057',  // Amazon AWS (EU)
  'AS39111', // Amazon AWS (APAC)
  'AS15169', // Google Cloud
  'AS396982', // Google Cloud
  'AS36384', // Google Cloud
  'AS8075',  // Microsoft Azure
  'AS12076', // Microsoft Azure
  'AS8068',  // Microsoft Azure
  'AS20341', // Microsoft Azure
  'AS62567', // DigitalOcean
  'AS14061', // DigitalOcean
  'AS6128',  // DigitalOcean (AMS)
  'AS200130', // DigitalOcean (FRA)
  'AS20473', // Vultr
  'AS21559', // Vultr
  'AS16276', // OVH
  'AS35540', // OVH
  'AS213373', // OVH
  'AS24940', // Hetzner
  'AS213230', // Hetzner
  'AS3223',  // Voxility
  'AS36352', // ColoCrossing
  'AS8100',  // QuadraNet
  'AS30083', // GoDaddy
  'AS26496', // GoDaddy
  'AS46606', // Unified Layer
  'AS22611', // InMotion
  'AS15003', // SoftLayer/IBM
  'AS36351', // SoftLayer/IBM
  'AS36492', // Linode
  'AS63949', // Linode (London)
  'AS23468', // Linode (Fremont)
  'AS213230', // Linode
  'AS55286', // B2 Net Solutions
  'AS7979',  // Servers.com
  'AS53831', // Leaseweb
  'AS28753', // Leaseweb (DE)
  'AS23609', // Leaseweb (NL)
  'AS213035', // IONOS
  'AS8560',  // IONOS
  'AS21499', // IONOS
  'AS45028', // IONOS
  'AS213304', // Contabo
  'AS51167', // Contabo
  'AS15817', // Dedicated.com
  'AS23352', // Server Central
  'AS46844', // Staminus
  'AS53824', // Psychz Networks
  'AS394711', // Oracle Cloud
  'AS31898', // Oracle Cloud
  'AS61098', // Oracle Cloud
  'AS395959', // Scaleway
  'AS12876', // Scaleway
  'AS54113', // Fastly
  'AS13335', // Cloudflare (WARP/VPN)
  'AS20940', // Akamai / Linode
  'AS63949', // Akamai Connected Cloud (Linode)
  'AS3842',	 // RamNode
  'AS36352', // ColoCrossing / Hostwinds
  'AS11878', // tzulo
  'AS22612', // Namecheap
  'AS397086', // Namecheap
  'AS32780', // KnownHost
  'AS394380', // Layered Insight
  'AS54641', // 100TB/M247
  'AS9009',  // M247
  'AS60068', // CDN77 / DataCamp
  'AS210755', // STACKIT
  'AS59253', // Clouvider
  'AS25184', // Afranet/Iran
  'AS23947', // MivoCloud
  'AS49581', // Tube-Hosting
  'AS44863', // Nexeon
  'AS216246', // Itcom Hosting
  'AS211224', // Oracle
  'AS57304', // Prodvuz
  'AS393218', // JetWeb
  'AS41040', // HostRoyale
  'AS210078', // Cloudsigma
  'AS29159', // Ikor
  'AS203071', // VDSina
  'AS49143', // Cherry Servers
  'AS208364', // M247 Ltd
  'AS48460', // ITL LLC
  'AS197655', // G-Core Labs
  'AS202596', // G-Core Labs
  'AS16276',  // OVH
  'AS35540',  // OVH
  'AS201729', // Snel.com
  'AS394711', // Oracle Cloud
  'AS49505',  // Selectel
  'AS44042',  // Cubo Network
  'AS64485',  // 1GServers
  'AS62240',  // ColoUp
  'AS12225',  // Prometeus
  'AS200651', // Flokinet
  'AS207083', // Flokinet
  'AS210509', // ServaArs
  'AS211619', // Hostiger
  'AS21163',  // Hostiger
  'AS208738', // VEXXHOST
  'AS203391', // Clouding
  'AS198385', // Netcup
  'AS197540', // Netcup
  'AS41762',  // Netcup
  'AS45014',  // VDS
  'AS20860',  // Iomart
  'AS197071', // Active 1 A/S
  'AS208179', // LuneCloud
  'AS205275', // MISI Co
  'AS208046', // HostUS
  'AS203323', // Tcloud
  'AS204957', // HostSailor
  'AS206264', // AMD
  'AS395855', // Navigate
  'AS397423', // Elit-Enet
  'AS394953', // DataIdeas
  'AS55081',  // Fiber State
  'AS13879',  // Speedbone
  'AS201287', // myLoc
  'AS21412',  // Prolocation
  'AS207990', // Feral.io
  'AS205274', // MojoHost
  'AS395851', // Hydro66
  'AS200593', // Voxility
  'AS174',    // Cogent
  'AS6453',   // TATA
  'AS1299',   // Telia
  'AS1239',   // Sprint
  'AS3491',   // PCCW
  'AS2914',   // NTT
  'AS5511',   // Orange
  'AS3320',   // DTAG
  'AS3257',   // GTT
  'AS34984',  // Tellme
  'AS47869',  // Feral Hosting
  'AS207083', // Flokinet
  'AS208046', // HostUS
  'AS202206', // Nihon
  'AS211619', // Hostiger
  'AS394711', // Oracle Cloud
  'AS45102',  // Alibaba Cloud
  'AS37963',  // Alibaba Cloud
  'AS45090',  // Tencent Cloud
  'AS132203', // Tencent Cloud
  'AS58593',  // Tencent Cloud
  'AS55967',  // Baidu Cloud
  'AS38365',  // Baidu Cloud
  'AS4134',   // China Telecom
  'AS4809',   // China Telecom
  'AS4837',   // China Unicom
  'AS9929',   // China Unicom
  'AS9808',   // China Mobile
  'AS24400',  // China Mobile
  'AS56048',  // China Mobile
  'AS36678',  // UpCloud
  'AS61337',  // HostHatch
  'AS59795',  // HostHatch
  'AS394711', // Oracle Cloud (all)
  'AS174',    // Cogent (transit, sometimes used by hosters)
  'AS6453',   // Tata (transit)
  'AS12956',  // Telxius
  'AS6762',   // Telecom Italia Sparkle
  'AS5511',   // Orange
  'AS1239',   // Sprint
  'AS3491',   // PCCW
  'AS2914',   // NTT
  'AS3257',   // GTT
  'AS3320',   // Deutsche Telekom
  'AS55824',  // NKN Core
  'AS7506',   // GMO Internet
  'AS9370',   // SAKURA
  'AS2516',   // KDDI
  'AS2527',   // Sony Network
  'AS9607',   // BBTower
  'AS47869',  // Feral Hosting
  'AS209371', // Hivane
  'AS208046', // HostUS
  'AS393218', // JetWeb
]);

// ─── Helper Functions ───────────────────────────────────────────────────────────

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase().trim() || '';
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^\./, '').replace(/\.$/, '');
}

function isWildcardDomain(domain: string): boolean {
  return domain.startsWith('*.');
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns true if the supplied email matches one in the comma-separated
// FOUNDER_EMAILS env var (case-insensitive, trimmed). Used to grant the
// founder unrestricted API access for testing/QA without consuming credits.
function isFounderEmail(email: string | null | undefined, env: Env): boolean {
  if (!email || !env.FOUNDER_EMAILS) return false;
  const founders = env.FOUNDER_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return founders.includes(email.toLowerCase());
}

// Returns the set of domains the founder has manually added to the
// disposable-email blocklist. Stored in DISPOSABLE_EMAILS KV under
// the "manual_overrides" key as a JSON array of domain strings.
// Use wrangler to seed/update:
//   npx wrangler kv:key put --binding DISPOSABLE_EMAILS \
//     "manual_overrides" '["aratrin.com", "another.com"]'
async function getManualOverrides(env: Env): Promise<Set<string>> {
  const data = await env.DISPOSABLE_EMAILS.get('manual_overrides');
  if (!data) return new Set();
  try {
    const arr = JSON.parse(data);
    return new Set(Array.isArray(arr) ? arr.filter(d => typeof d === 'string') : []);
  } catch {
    return new Set();
  }
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sd_';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function computeOverallRisk(riskScores: number[]): 'low' | 'medium' | 'high' {
  const max = Math.max(...riskScores, 0);
  if (max >= 70) return 'high';
  if (max >= 30) return 'medium';
  return 'low';
}

function computeRecommendation(riskScores: number[], overall: 'low' | 'medium' | 'high'): 'allow' | 'review' | 'block' {
  const max = Math.max(...riskScores, 0);
  if (max >= 80) return 'block';
  if (overall === 'high') return 'block';
  if (max >= 50) return 'review';
  if (overall === 'medium') return 'review';
  return 'allow';
}

// ── Phone Number Helpers ──

function normalizePhone(phone: string): string {
  return phone.replace(/[^+\d]/g, '');
}

function phoneMatchesMask(phone: string, candidate: string): boolean {
  return phone === candidate;
}

async function checkDisposablePhone(env: Env, phone: string): Promise<boolean> {
  try {
    const raw = await env.DISPOSABLE_PHONE_NUMBERS.get('_all');
    if (!raw) return false;
    const numbers: string[] = JSON.parse(raw);
    // iP1SMS format is plain digits (no +), so strip + for matching
    const normalized = normalizePhone(phone).replace(/^\+/, '');
    // Binary search or Set would be faster but KV serves 118k numbers as one blob
    // so we iterate — still < 10ms for 118k string comparisons
    for (const num of numbers) {
      if (normalized === num) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Usage Tracking ────────────────────────────────────────────────────────────

async function incrementUsage(env: Env, apiKey: string, today: string): Promise<void> {
  const usageKey = `usage:${apiKey}:${today}`;
  let current = await env.USAGE_LOG.get(usageKey);
  let val = current ? parseInt(current, 10) : 0;
  await env.USAGE_LOG.put(usageKey, String(val + 1));
}

// ─── Hono App ───────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'x-api-key'],
  exposeHeaders: ['X-Fraud-Blocked-Today', 'X-Fraud-Blocked-Reason', 'X-Estimated-Cost'],
}));
app.use('*', secureHeaders());

// ─── GET / — Health Check ───────────────────────────────────────────────────────

app.get('/', (c) => {
  return c.json({
    service: 'SignupDoggy API',
    version: '1.0.0',
    docs: '/docs',
    spec: '/openapi.json',
  });
});

// ─── POST /v1/keys — Create API Key ─────────────────────────────────────────────

app.post('/v1/keys', async (c) => {
  const apiKey = generateApiKey();
  const userId = `user_${Date.now()}`;
  const record: ApiKeyRecord = {
    user_id: userId,
    created: new Date().toISOString().split('T')[0],
    metadata: { stripe_customer_id: null },
  };
  await c.env.API_KEYS.put(apiKey, JSON.stringify(record));
  return c.json({
    api_key: apiKey,
    user_id: userId,
    created: record.created,
    message: 'Save this API key — it will not be shown again.',
  }, 201);
});

// ─── POST /v1/blacklist — Manage User Blacklists ────────────────────────────────

app.post('/v1/blacklist', async (c) => {
  const apiKey = c.req.header('x-api-key');
  if (!apiKey) return c.json({ error: 'Missing x-api-key header' }, 401);

  const keyRecord = await c.env.API_KEYS.get(apiKey);
  if (!keyRecord) return c.json({ error: 'Invalid API key' }, 401);

  const body: { type?: string; value?: string; action?: string } = await c.req.json();
  if (!body.type || !body.value || !body.action) {
    return c.json({ error: 'Required fields: type (email|ip|phone), value, action (add|remove)' }, 400);
  }
  if (!['email', 'ip', 'phone'].includes(body.type)) {
    return c.json({ error: 'type must be "email", "ip", or "phone"' }, 400);
  }
  if (!['add', 'remove'].includes(body.action)) {
    return c.json({ error: 'action must be "add" or "remove"' }, 400);
  }

  const blacklistKey = `blacklist:${apiKey}`;
  const existing = await c.env.USER_BLACKLISTS.get(blacklistKey);
  const blacklist: UserBlacklist = existing ? JSON.parse(existing) : { emails: [], ips: [], phones: [] };

  const typeToList: Record<string, keyof UserBlacklist> = { email: 'emails', ip: 'ips', phone: 'phones' };
  const targetList = typeToList[body.type] || 'emails';

  if (body.action === 'add') {
    if (!blacklist[targetList].includes(body.value.toLowerCase())) {
      blacklist[targetList].push(body.value.toLowerCase());
    }
  } else {
    blacklist[targetList] = blacklist[targetList].filter((v: string) => v !== body.value!.toLowerCase());
  }

  await c.env.USER_BLACKLISTS.put(blacklistKey, JSON.stringify(blacklist));

  return c.json({
    message: `${body.type} ${body.action === 'add' ? 'added to' : 'removed from'} blacklist`,
    type: body.type,
    value: body.value.toLowerCase(),
    current_count: {
      emails: blacklist.emails.length,
      ips: blacklist.ips.length,
      phones: blacklist.phones.length,
    },
  });
});

// ─── POST /v1/check — Main Fraud Check Endpoint ────────────────────────────────

app.post('/v1/check', async (c) => {
  const apiKey = c.req.header('x-api-key');
  if (!apiKey) return c.json({ error: 'Missing x-api-key header' }, 401);

  const keyRecord = await c.env.API_KEYS.get(apiKey);
  if (!keyRecord) return c.json({ error: 'Invalid API key' }, 401);

  // ── Credit check — verify user has balance (skipped for founders) ──
  const parsedRecord: ApiKeyRecord = JSON.parse(keyRecord);
  const userId = parsedRecord.user_id;
  const userEmail = await c.env.USERS.get(`user_email:${userId}`);
  const founderBypass = isFounderEmail(userEmail, c.env);

  let creditsBalance = 0;
  if (!founderBypass) {
    creditsBalance = parseInt(await c.env.USERS.get(`credits:${userId}`) || '0', 10);
    if (creditsBalance <= 0) {
      return c.json({
        error: 'Insufficient credits — top up at https://signupdoggy.pages.dev/billing',
        code: 'insufficient_credits',
      }, 402);
    }
  }

  const today = getToday();

  // Parse request body
  let body: CheckRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.email && !body.ip && !body.phone) {
    return c.json({ error: 'At least one of "email", "ip", or "phone" is required' }, 400);
  }

  // Increment usage counter
  await incrementUsage(c.env, apiKey, today);

  // Build response
  const response: CheckResponse = {
    email: null,
    phone: null,
    ip: null,
    overall_risk: 'low',
    recommendation: 'allow',
  };

  const riskScores: number[] = [];
  let blocked = false;
  let blockedReason = '';

  // ── Check Email ──
  if (body.email) {
    const domain = extractDomain(body.email);
    const normalizedDomain = normalizeDomain(domain);
    let isDisposable = false;
    let emailRisk = 0;

    // Check if the user's personal blacklist has this email or domain
    const blacklistKey = `blacklist:${apiKey}`;
    const existingBlacklist = await c.env.USER_BLACKLISTS.get(blacklistKey);
    if (existingBlacklist) {
      const blacklist: UserBlacklist = JSON.parse(existingBlacklist);
      if (
        blacklist.emails.includes(body.email.toLowerCase()) ||
        blacklist.emails.includes(normalizedDomain)
      ) {
        isDisposable = true;
        emailRisk = 100;
        blocked = true;
        blockedReason = 'custom_blacklist';
      }
    }

    // Check global disposable email list
    if (!isDisposable && normalizedDomain) {
      const allData = await c.env.DISPOSABLE_EMAILS.get('_all');
      if (allData) {
        const domains: string[] = JSON.parse(allData);
        const domainSet = new Set(domains);

        if (domainSet.has(normalizedDomain)) {
          isDisposable = true;
          emailRisk = 85;
          blocked = true;
          blockedReason = 'disposable_email';
        }

        // Wildcard check
        if (!isDisposable && normalizedDomain.includes('.')) {
          const parts = normalizedDomain.split('.');
          for (let i = 1; i < parts.length; i++) {
            const parent = parts.slice(i).join('.');
            if (domainSet.has(parent) || domainSet.has('*.' + parent)) {
              isDisposable = true;
              emailRisk = 85;
              blocked = true;
              blockedReason = 'disposable_email';
              break;
            }
          }
        }
      }

      // Check founder-curated manual override list (long-tail domains
      // the public blocklists miss — e.g. aratrin.com from temp-mail.org).
      // Seed via: npx wrangler kv:key put --binding DISPOSABLE_EMAILS \
      //   "manual_overrides" '["aratrin.com", "another.com"]'
      if (!isDisposable && normalizedDomain) {
        const overrides = await getManualOverrides(c.env);
        if (overrides.has(normalizedDomain)) {
          isDisposable = true;
          emailRisk = 85;
          blocked = true;
          blockedReason = 'disposable_email';
        }
      }
    }

    response.email = {
      is_disposable: isDisposable,
      domain: normalizedDomain || domain,
      risk_score: emailRisk,
    };
    riskScores.push(emailRisk);
  }

  // ── Check IP ──
  if (body.ip) {
    let isTor = false;
    let isHosting = false;
    let asn: string | null = null;
    let ipRisk = 0;
    let ipChecked = false;

    // Check Tor exit nodes
    const allTorData = await c.env.TOR_EXIT_NODES.get('_all');
    if (allTorData) {
      const torIps: string[] = JSON.parse(allTorData);
      if (torIps.includes(body.ip)) {
        isTor = true;
        ipRisk = 90;
        blocked = true;
        blockedReason = 'tor_exit';
        ipChecked = true;
      }
    }

    // Check hosting/VPN IP ranges (heuristic)
    if (!ipChecked && body.ip) {
      const ipOctets = body.ip.split('.').map(Number);
      if (ipOctets.length === 4 && !ipOctets.some(n => isNaN(n))) {
        if (
          (ipOctets[0] === 3) || // AWS
          (ipOctets[0] === 35) || // GCP/AWS
          (ipOctets[0] === 13) || // AWS
          (ipOctets[0] === 52) || // AWS
          (ipOctets[0] === 54) || // AWS
          (ipOctets[0] === 34) || // GCP
          (ipOctets[0] === 15) || // AWS
          (ipOctets[0] === 18) || // AWS
          (ipOctets[0] === 44) || // AWS
          (ipOctets[0] === 20) || // Azure
          (ipOctets[0] === 40 && ipOctets[1] >= 74) || // Azure
          (ipOctets[0] === 65 && ipOctets[1] >= 52 && ipOctets[1] <= 63) || // Azure
          (ipOctets[0] === 157 && ipOctets[1] >= 55 && ipOctets[1] <= 59) || // Azure
          (ipOctets[0] === 104 && ipOctets[1] >= 208 && ipOctets[1] <= 211) || // DigitalOcean
          (ipOctets[0] === 138 && ipOctets[1] === 197) || // DigitalOcean
          (ipOctets[0] === 138 && ipOctets[1] === 68) || // DigitalOcean
          (ipOctets[0] === 159 && ipOctets[1] === 89) || // Hetzner
          (ipOctets[0] === 167 && ipOctets[1] >= 235) || // Hetzner
          (ipOctets[0] === 23 && ipOctets[1] >= 88 && ipOctets[1] <= 90) || // Linode
          (ipOctets[0] === 45 && ipOctets[1] >= 33 && ipOctets[1] <= 34) || // Linode
          (ipOctets[0] === 95 && ipOctets[1] === 179) || // Vultr
          (ipOctets[0] === 108 && ipOctets[1] === 61) || // Vultr
          (ipOctets[0] === 149 && ipOctets[1] >= 28 && ipOctets[1] <= 31) || // Vultr
          (ipOctets[0] === 51 && ipOctets[1] >= 15 && ipOctets[1] <= 82) || // OVH
          (ipOctets[0] === 141 && ipOctets[1] >= 94 && ipOctets[1] <= 97) || // OVH
          (ipOctets[0] === 145 && ipOctets[1] >= 239 && ipOctets[1] <= 242) // OVH
        ) {
          isHosting = true;
          ipRisk = 60;
          if (!blocked) {
            blocked = true;
            blockedReason = 'proxy';
          }
        }
      }
    }

    response.ip = {
      is_tor: isTor,
      is_proxy: isHosting,
      is_hosting: isHosting || isTor,
      asn: asn,
      risk_score: ipRisk,
    };
    riskScores.push(ipRisk);
  }

  // ── Phone Check ──
  if (body.phone) {
    const normalizedPhone = normalizePhone(body.phone);
    let phoneRisk = 0;
    const isDisposablePhone = await checkDisposablePhone(c.env, normalizedPhone);

    if (isDisposablePhone) {
      phoneRisk = 85;
      if (!blocked) {
        blocked = true;
        blockedReason = 'disposable_phone';
      }
    }

    // Check user blacklist for phone
    const blacklistKey = `blacklist:${apiKey}`;
    const existingBlacklist = await c.env.USER_BLACKLISTS.get(blacklistKey);
    if (existingBlacklist) {
      const blacklist: UserBlacklist = JSON.parse(existingBlacklist);
      if (blacklist.phones && blacklist.phones.includes(normalizedPhone)) {
        phoneRisk = 100;
        blocked = true;
        blockedReason = 'custom_blacklist';
      }
    }

    response.phone = {
      is_disposable: isDisposablePhone || (phoneRisk >= 100),
      number: normalizedPhone,
      risk_score: phoneRisk,
    };
    riskScores.push(phoneRisk);
  }

  // ── Calculate overall risk ──
  response.overall_risk = computeOverallRisk(riskScores);
  response.recommendation = computeRecommendation(riskScores, response.overall_risk);

  // ── Response Headers ──
  // Track blocked count
  const blockedTodayKey = `blocked:${today}:total`;
  const blockedTodayStr = await c.env.USAGE_LOG.get(blockedTodayKey);
  const blockedToday = blockedTodayStr ? parseInt(blockedTodayStr, 10) : 0;
  if (blocked) {
    await c.env.USAGE_LOG.put(blockedTodayKey, String(blockedToday + 1));
    const reasonKey = `blocked:${today}:${blockedReason}`;
    const reasonCount = await c.env.USAGE_LOG.get(reasonKey);
    await c.env.USAGE_LOG.put(reasonKey, String(reasonCount ? parseInt(reasonCount, 10) + 1 : 1));
  }

  // Calculate estimated cost
  const usageKey = `usage:${apiKey}:${today}`;
  const usageStr = await c.env.USAGE_LOG.get(usageKey);
  const totalUsage = usageStr ? parseInt(usageStr, 10) : 0;
  const pricePerRequest = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');
  const cost = totalUsage * pricePerRequest;

  c.header('X-Founder-Bypass', String(founderBypass));
  c.header('X-Fraud-Blocked-Today', String(blockedToday + (blocked ? 1 : 0)));
  c.header('X-Fraud-Blocked-Reason', blockedReason || 'none');
  c.header('X-Estimated-Cost', cost.toFixed(2));
  c.header('X-Credit-Balance', String(Math.max(0, creditsBalance - 1)));

  // Deduct one credit for this request (skipped for founders)
  if (!founderBypass) {
    await c.env.USERS.put(`credits:${userId}`, String(creditsBalance - 1));
  }

  return c.json(response);
});

// ─── GET /v1/stats — Usage Statistics ──────────────────────────────────────────

app.get('/v1/stats', async (c) => {
  const apiKey = c.req.header('x-api-key');
  if (!apiKey) return c.json({ error: 'Missing x-api-key header' }, 401);

  const keyRecord = await c.env.API_KEYS.get(apiKey);
  if (!keyRecord) return c.json({ error: 'Invalid API key' }, 401);

  const today = getToday();
  const usageKey = `usage:${apiKey}:${today}`;
  const usageStr = await c.env.USAGE_LOG.get(usageKey);
  const totalRequests = usageStr ? parseInt(usageStr, 10) : 0;

  // Get blocked counts by reason
  const blockedEmail = await c.env.USAGE_LOG.get(`blocked:${today}:disposable_email`);
  const blockedTor = await c.env.USAGE_LOG.get(`blocked:${today}:tor_exit`);
  const blockedProxy = await c.env.USAGE_LOG.get(`blocked:${today}:proxy`);
  const blockedBlacklist = await c.env.USAGE_LOG.get(`blocked:${today}:custom_blacklist`);
  const blockedPhone = await c.env.USAGE_LOG.get(`blocked:${today}:disposable_phone`);
  const blockedTotalStr = await c.env.USAGE_LOG.get(`blocked:${today}:total`);

  const disposableCount = blockedEmail ? parseInt(blockedEmail, 10) : 0;
  const torCount = blockedTor ? parseInt(blockedTor, 10) : 0;
  const proxyCount = blockedProxy ? parseInt(blockedProxy, 10) : 0;
  const blacklistCount = blockedBlacklist ? parseInt(blockedBlacklist, 10) : 0;
  const phoneCount = blockedPhone ? parseInt(blockedPhone, 10) : 0;
  const blockedTotal = blockedTotalStr ? parseInt(blockedTotalStr, 10) : 0;

  const pricePerRequest = parseFloat(c.env.PRICE_PER_REQUEST || '0.01');
  const estimatedCost = totalRequests * pricePerRequest;

  const stats: StatsResponse = {
    period: today,
    total_requests: totalRequests,
    blocked_count: blockedTotal,
    blocked_by_reason: {
      disposable_email: disposableCount,
      tor_exit: torCount,
      proxy: proxyCount,
      custom_blacklist: blacklistCount,
      disposable_phone: phoneCount,
    },
    estimated_cost_usd: estimatedCost,
  };

  return c.json(stats);
});

// ─── GET /openapi.json — OpenAPI 3.0 Spec ──────────────────────────────────────

app.get('/openapi.json', (c) => {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'SignupDoggy API',
      description: 'Stop fake signups in 5 minutes. One API call. $0.01/request. Built for builders. Priced for startups. Powered by open data.',
      version: '1.0.0',
      contact: { url: 'https://signupdoggy.dev' },
    },
    servers: [
      { url: 'https://signupdoggy-api.jeffrinjames99.workers.dev', description: 'Production' },
      { url: 'https://signupdoggy.dev', description: 'Production' },
    ],
    paths: {
      '/v1/check': {
        post: {
          summary: 'Check an email and/or IP address for fraud signals',
          operationId: 'checkFraud',
          parameters: [
            {
              name: 'x-api-key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
              description: 'Your API key (starts with sd_)',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', description: 'Email address to check' },
                    ip: { type: 'string', format: 'ipv4', description: 'IP address to check' },
                    phone: { type: 'string', description: 'Phone number to check (E.164 format)' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Fraud check result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          is_disposable: { type: 'boolean' },
                          domain: { type: 'string' },
                          risk_score: { type: 'integer', minimum: 0, maximum: 100 },
                        },
                      },
                      ip: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          is_tor: { type: 'boolean' },
                          is_proxy: { type: 'boolean' },
                          is_hosting: { type: 'boolean' },
                          asn: { type: 'string', nullable: true },
                          risk_score: { type: 'integer', minimum: 0, maximum: 100 },
                        },
                      },
                      phone: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          is_disposable: { type: 'boolean' },
                          number: { type: 'string' },
                          risk_score: { type: 'integer', minimum: 0, maximum: 100 },
                        },
                      },
                      overall_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
                      recommendation: { type: 'string', enum: ['allow', 'review', 'block'] },
                    },
                  },
                },
              },
            },
            '400': { description: 'Invalid request body' },
            '401': { description: 'Missing or invalid API key' },
          },
          'x-codeSamples': [
            {
              lang: 'cURL',
              source: `curl -X POST https://signupdoggy.dev/v1/check \\\n  -H "x-api-key: sd_your_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`,
            },
            {
              lang: 'Node.js',
              source: `const res = await fetch('https://signupdoggy.dev/v1/check', {\n  method: 'POST',\n  headers: {\n    'x-api-key': 'sd_your_key_here',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({ email: 'user@example.com', ip: '1.2.3.4' }),\n});\nconst data = await res.json();`,
            },
            {
              lang: 'Python',
              source: `import requests\n\nres = requests.post(\n    'https://signupdoggy.dev/v1/check',\n    headers={'x-api-key': 'sd_your_key_here'},\n    json={'email': 'user@example.com', 'ip': '1.2.3.4'}\n)\ndata = res.json()`,
            },
          ],
        },
      },
      '/v1/keys': {
        post: {
          summary: 'Create a new API key',
          operationId: 'createApiKey',
          responses: {
            '201': {
              description: 'API key created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      api_key: { type: 'string' },
                      user_id: { type: 'string' },
                      created: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/blacklist': {
        post: {
          summary: 'Add or remove an email or IP from your personal blacklist',
          operationId: 'manageBlacklist',
          parameters: [
            {
              name: 'x-api-key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['email', 'ip', 'phone'] },
                    value: { type: 'string' },
                    action: { type: 'string', enum: ['add', 'remove'] },
                  },
                  required: ['type', 'value', 'action'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Blacklist updated' },
            '400': { description: 'Invalid request' },
            '401': { description: 'Missing or invalid API key' },
          },
        },
      },
      '/v1/stats': {
        get: {
          summary: "Retrieve today's usage statistics",
          operationId: 'getStats',
          parameters: [
            {
              name: 'x-api-key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: "Today's usage statistics including request count, blocked count by reason, and estimated cost.",
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      period: { type: 'string' },
                      total_requests: { type: 'integer' },
                      blocked_count: { type: 'integer' },
                      blocked_by_reason: {
                        type: 'object',
                        properties: {
                          disposable_email: { type: 'integer' },
                          tor_exit: { type: 'integer' },
                          proxy: { type: 'integer' },
                          custom_blacklist: { type: 'integer' },
                          disposable_phone: { type: 'integer' },
                        },
                      },
                      estimated_cost_usd: { type: 'number' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Missing or invalid API key' },
          },
        },
      },
    },
  };
  return c.json(spec);
});

// ─── GET /docs — Human-readable Documentation ──────────────────────────────────

app.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SignupDoggy API — Docs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; color: #facc15; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #f4f4f5; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
    h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; color: #a1a1aa; }
    p { margin-bottom: 1rem; color: #a1a1aa; }
    a { color: #facc15; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .tagline { font-size: 1.2rem; color: #71717a; margin-bottom: 2rem; }
    pre { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; position: relative; }
    code { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.9rem; color: #e4e4e7; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: #27272a; border: 1px solid #3f3f46; color: #a1a1aa; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    .copy-btn:hover { background: #3f3f46; color: #f4f4f5; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #27272a; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }
    th { background: #18181b; color: #f4f4f5; font-weight: 600; }
    td { color: #a1a1aa; }
    .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1rem 0; }
    .pricing-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1.5rem; text-align: center; }
    .pricing-card.featured { border-color: #facc15; }
    .pricing-card h3 { color: #f4f4f5; margin: 0 0 0.5rem; }
    .price { font-size: 2.5rem; font-weight: 800; color: #facc15; margin: 0.5rem 0; }
    .price span { font-size: 1rem; color: #71717a; font-weight: 400; }
    .pricing-card ul { list-style: none; padding: 0; }
    .pricing-card ul li { padding: 0.3rem 0; color: #a1a1aa; }
    .badge { display: inline-block; background: #27272a; color: #facc15; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem; }
    .endpoint { background: #18181b; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0; border-left: 3px solid #facc15; }
    .endpoint h3 { margin: 0 0 0.25rem; color: #facc15; }
    .endpoint p { margin: 0; color: #a1a1aa; font-size: 0.9rem; }
    .endpoint .method { display: inline-block; background: #facc15; color: #0a0a0f; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
    .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #27272a; text-align: center; color: #52525b; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ SignupDoggy API</h1>
    <p class="tagline">Stop fake signups in <strong>5 minutes</strong>. One API call. <strong>$0.01/request</strong>. No minimum. No contract.</p>

    <div class="section">
      <h2>⚡ Quick Start</h2>
      <p>Get your API key and check a signup in under 30 seconds:</p>
      <pre><code id="key-code">curl -X POST https://signupdoggy.dev/v1/keys</code><button class="copy-btn" onclick="copy('key-code')">Copy</button></pre>
      <pre><code id="check-code">curl -X POST https://signupdoggy.dev/v1/check \\
  -H "x-api-key: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'</code><button class="copy-btn" onclick="copy('check-code')">Copy</button></pre>
    </div>

    <div class="section">
      <h2>📡 API Endpoints</h2>

      <div class="endpoint">
        <span class="method">POST</span> <code>/v1/check</code>
        <p>Check an email address and/or IP address for fraud signals. Returns risk scores and a block/allow/review recommendation.</p>
      </div>

      <div class="endpoint">
        <span class="method">POST</span> <code>/v1/keys</code>
        <p>Generate a new API key. No authentication required. Keys are shown once.</p>
      </div>

      <div class="endpoint">
        <span class="method">POST</span> <code>/v1/blacklist</code>
        <p>Add/remove emails or IPs to your personal blacklist. Requires API key authentication.</p>
      </div>

      <div class="endpoint">
        <span class="method">GET</span> <code>/v1/stats</code>
        <p>View today's usage stats: total requests, blocked count by reason, and estimated cost.</p>
      </div>

      <div class="endpoint">
        <span class="method">GET</span> <code>/openapi.json</code>
        <p>Download the OpenAPI 3.0 specification for tooling and code generation.</p>
      </div>
    </div>

    <div class="section">
      <h2>📋 Authentication</h2>
      <p>All endpoints except <code>/v1/keys</code> require an API key sent via the <code>x-api-key</code> header.</p>
      <pre><code>curl -H "x-api-key: sd_your_key_here" https://signupdoggy.dev/v1/check</code></pre>
    </div>

    <div class="section">
      <h2>📊 Response Headers</h2>
      <table>
        <tr><th>Header</th><th>Description</th></tr>
        <tr><td><code>X-Fraud-Blocked-Today</code></td><td>Total requests blocked today on your account</td></tr>
        <tr><td><code>X-Fraud-Blocked-Reason</code></td><td>Why this request was blocked</td></tr>
        <tr><td><code>X-Estimated-Cost</code></td><td>Estimated cost of today's usage</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>💰 Pricing</h2>
      <div class="pricing-grid">
        <div class="pricing-card featured">
          <h3>Pay-as-you-go</h3>
          <div class="price">$0.01<span>/ request</span></div>
          <ul>
            <li>✅ No minimum — pay for what you use</li>
            <li>✅ No tiers — every request is $0.01</li>
            <li>✅ No commitment — cancel anytime</li>
            <li>✅ No rate limits — your key works for 1 or 1M requests</li>
          </ul>
        </div>
      </div>
      <p><strong>Why this is cheaper than SignupGate:</strong> SignupGate charges $29/month minimum even if you only need 100 requests. SignupDoggy charges a flat $0.01/request — at 1k requests that's $10. No minimum, no commitment, no tiers. Built on Cloudflare's global edge network with zero egress fees.</p>
    </div>

    <div class="section">
      <h2>🛠️ SDK Code Snippets</h2>

      <h3>Node.js / TypeScript</h3>
      <pre><code id="node-code">const SignupDoggy = {
  async check(apiKey: string, data: { email?: string; ip?: string }) {
    const res = await fetch('https://signupdoggy.dev/v1/check', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

const result = await SignupDoggy.check('sd_your_key_here', {
  email: 'user@example.com',
  ip: '1.2.3.4',
});</code><button class="copy-btn" onclick="copy('node-code')">Copy</button></pre>

      <h3>Python</h3>
      <pre><code id="py-code">import requests

def check_signup(api_key: str, email: str = None, ip: str = None):
    res = requests.post(
        'https://signupdoggy.dev/v1/check',
        headers={'x-api-key': api_key},
        json={'email': email, 'ip': ip}
    )
    return res.json()

data = check_signup('sd_your_key_here', email='user@example.com', ip='1.2.3.4')</code><button class="copy-btn" onclick="copy('py-code')">Copy</button></pre>

      <h3>cURL</h3>
      <pre><code id="curl-code">curl -X POST https://signupdoggy.dev/v1/check \\
  -H "x-api-key: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'</code><button class="copy-btn" onclick="copy('curl-code')">Copy</button></pre>
    </div>

    <div class="section">
      <h2>🔢 HTTP Status Codes</h2>
      <table>
        <tr><th>Code</th><th>Description</th></tr>
        <tr><td>200</td><td>Success</td></tr>
        <tr><td>201</td><td>Resource created (API key)</td></tr>
        <tr><td>400</td><td>Bad request — check request body</td></tr>
        <tr><td>401</td><td>Missing or invalid API key</td></tr>
      </table>
    </div>

    <div class="footer">
      <p>SignupDoggy API — Powered by open data. Built on Cloudflare Workers.</p>
    </div>
  </div>

  <script>
    function copy(id) {
      const el = document.getElementById(id);
      const text = el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = el.nextElementSibling;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    }
  </script>
</body>
</html>`;
  return c.html(html);
});

// ─── GET /__cron/run — Cron Sync Handler ───────────────────────────────────────

async function syncDisposableEmails(env: Env): Promise<string> {
  const urls = [
    'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
    'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
  ];

  const allDomains = new Set<string>();

  for (const url of urls) {
    try {
      const resp = await fetch(url, { cf: { cacheTtl: 0 } });
      if (!resp.ok) continue;
      const text = await resp.text();

      if (url.endsWith('.conf')) {
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            allDomains.add(trimmed.toLowerCase());
          }
        }
      } else if (url.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            for (const d of json) {
              if (typeof d === 'string') allDomains.add(d.toLowerCase());
            }
          }
        } catch { /* skip malformed json */ }
      }
    } catch { /* skip failed url */ }
  }

  const domainsArray = Array.from(allDomains);
  await env.DISPOSABLE_EMAILS.put('_all', JSON.stringify(domainsArray));
  await env.SYNC_LOGS.put(`disposable:${getToday()}`, `Synced ${domainsArray.length} domains`);
  return `Synced ${domainsArray.length} disposable email domains`;
}

async function syncTorExitNodes(env: Env): Promise<string> {
  try {
    const resp = await fetch('https://check.torproject.org/exit-addresses', { cf: { cacheTtl: 0 } });
    const text = await resp.text();
    const ips: string[] = [];

    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('ExitAddress ')) {
        const ip = line.split(' ')[1];
        if (ip) ips.push(ip);
      }
    }

    await env.TOR_EXIT_NODES.put('_all', JSON.stringify(ips));
    await env.SYNC_LOGS.put(`tor:${getToday()}`, `Synced ${ips.length} exit nodes`);
    return `Synced ${ips.length} Tor exit nodes`;
  } catch (e) {
    return `Tor sync failed: ${e instanceof Error ? e.message : 'unknown error'}`;
  }
}

async function syncDisposablePhoneNumbers(env: Env): Promise<string> {
  try {
    const resp = await fetch(
      'https://raw.githubusercontent.com/iP1SMS/disposable-phone-numbers/master/number-list.json',
      { cf: { cacheTtl: 0 } }
    );
    if (!resp.ok) return `Phone sync failed: HTTP ${resp.status}`;
    const json = await resp.json() as Record<string, string>;
    const numbers = Object.keys(json).filter(k => /^\d{5,15}$/.test(k));

    await env.DISPOSABLE_PHONE_NUMBERS.put('_all', JSON.stringify(numbers));
    await env.SYNC_LOGS.put(`phone:${getToday()}`, `Synced ${numbers.length} disposable phone numbers`);
    return `Synced ${numbers.length} disposable phone numbers`;
  } catch (e: any) {
    return `Phone sync error: ${e.message}`;
  }
}

app.get('/__cron/run', async (c) => {
  const results: string[] = [];

  const emailResult = await syncDisposableEmails(c.env);
  results.push(emailResult);

  const torResult = await syncTorExitNodes(c.env);
  results.push(torResult);

  const phoneResult = await syncDisposablePhoneNumbers(c.env);
  results.push(phoneResult);

  return c.json({ status: 'ok', results });
});

// ─── Export ─────────────────────────────────────────────────────────────────────

export default app;
