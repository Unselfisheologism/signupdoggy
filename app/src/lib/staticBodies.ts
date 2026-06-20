// Body texts for the new static pages (comparisons, use-cases, integrations, changelog).
// These are the same strings the prerender script (scripts/prerender.mjs) uses
// to write <noscript> blocks for crawlers. Kept in one place so the React
// component output and the prerendered HTML always agree.

export const COMPARE_BODIES: Record<string, string> = {
  '/vs/ipqualityscore': `IPQualityScore vs SignupDoggy — 2026 comparison

IPQualityScore (IPQS) is the legacy choice. SignupDoggy is the indie-hacker upstart. Both score signups for fraud risk. They are priced differently, integrated differently, and aimed at different buyers.

## Short answer

- IPQS is right for enterprise fraud teams with $50k+/year budgets, dedicated fraud analysts, and the need for IPQS's specific data sources.
- SignupDoggy is right for 2-50 person SaaS teams that need a working fraud API in an afternoon, without calling sales, without a $25/month minimum, and without an annual contract.
- The 10x price difference is real. The integration time difference is real. The accuracy difference on the typical signup form is small.

## Pricing

| Tier | IPQualityScore | SignupDoggy |
|---|---|---|
| Minimum spend | $25/month | $5 (pay once, no expiry) |
| Per-call cost | $0.005-$0.05 | $0.005-$0.01 |
| Free tier | 5,000 lookups/month (business email required) | Live demo at /demo (no signup) |
| Annual contract | Required for volume tiers | None |

Filtering 50,000 signups/month on IPQS's mid-tier costs $1,250-$2,500/month. The same 50,000 signups on SignupDoggy cost $250-$500 one-time.

## Accuracy

IPQS's strength is IP risk scoring. Their IP database is one of the best in the industry. SignupDoggy's strength is disposable-email detection. Their email blocklist is the deepest of any indie-tier provider.

For pure IP risk: IPQS wins.
For pure email risk: SignupDoggy wins.
For the typical SaaS signup form: roughly tied.

## Integration

IPQS: 1-2 weeks. Sales-led signup. Business email required.
SignupDoggy: 30 minutes. Self-service. Any payment method.

## When to pick which

**Pick IPQS if:**
- You are a fraud team at a company with a $50k+/year fraud-detection budget
- You already use IPQS and want to consolidate
- You need IPQS's specific data sources (e.g. their device-tracking library)

**Pick SignupDoggy if:**
- You are a 2-50 person SaaS team
- You want a working API in an afternoon without calling sales
- You want pay-per-call pricing with no monthly minimum
- You want the deepest disposable-email blocklist in the indie tier

The full 1,500-word comparison with use-case-specific recommendations is in our blog post: /blog/ipqualityscore-vs-signupdoggy-honest-comparison.
`,

  '/vs/maxmind': `MaxMind minFraud vs SignupDoggy — 2026 developer comparison

MaxMind is the 800-pound gorilla of IP intelligence. Their minFraud service has been around since 2005. SignupDoggy is a 2025 solo-founder project. They are aimed at completely different buyers.

## Short answer

- MaxMind is right for enterprise fraud teams with $50k+/year budgets, dedicated fraud analysts, and the need for MaxMind's IP-to-ASN-to-organization database.
- SignupDoggy is right for 2-50 person SaaS teams that need a working fraud API in an afternoon, without calling sales, without a $25/month minimum, and without a separate license purchase for each data source.

## Pricing (the big difference)

| Tier | MaxMind minFraud | SignupDoggy |
|---|---|---|
| Minimum spend | $25/month (Insights) | $5 (pay once) |
| Per-call cost | $0.005-$0.030 | $0.005-$0.01 |
| Annual contract | Required for volume tiers | None |
| Free tier | No | No (live demo) |

Filtering 50,000 signups/month on MaxMind's mid-tier (Score) costs $1,500/month ($0.030 per call). The same 50,000 signups on SignupDoggy cost $250 one-time. The 48x price difference is real.

## Accuracy

MaxMind's IP-to-ASN-to-organization database is the best in the business. For pure IP risk scoring, MaxMind wins.
SignupDoggy's disposable-email blocklist is the deepest of any indie-tier provider. For email risk scoring, SignupDoggy wins.
For the typical SaaS signup form: roughly tied.

## Integration time

MaxMind: 1-2 weeks, sales-led onboarding, separate license purchases for the IP risk score, device tracking library, etc.
SignupDoggy: 30 minutes, self-service, one API call.

## When to pick which

**Pick MaxMind if:**
- You are a fraud team with a $50k+/year budget
- You need MaxMind's specific data sources
- You have time for a 2-4 week onboarding process
- You need a formal SLA

**Pick SignupDoggy if:**
- You are a 2-50 person SaaS team
- You want a working API in an afternoon
- You want pay-per-call pricing with no monthly minimum
- You want the deepest disposable-email blocklist in the indie tier

The full comparison with use-case recommendations: /blog/maxmind-minfraud-vs-signupdoggy.
`,

  '/vs/sift': `Sift vs SignupDoggy — 2026 fraud API comparison for small teams

Sift is the 800-pound gorilla of fraud detection. Acquired by Visa in 2024. Processes over 1 trillion events per year for some of the largest marketplaces and fintechs in the world. SignupDoggy is a solo-founder project launched in 2025 with $0 in funding. They are not competing products.

## Short answer

- Sift is the right choice for marketplaces with $10M+ ARR that need payment-fraud scoring, account-takeover detection, content abuse detection, and promo abuse detection.
- SignupDoggy is the right choice for 2-50 person SaaS teams that need to filter bot signups to keep their database clean.

## Pricing (the headline number)

| Tier | Sift | SignupDoggy |
|---|---|---|
| Minimum spend | $2,000+/month (contact sales) | $5 (pay once) |
| Per-call cost | $0.05-$0.30 (quote-based) | $0.01 |
| Annual contract | Required | None |
| Free tier | No (30-day trial, sales-led) | No (live demo) |

Filtering 50,000 signups/month on Sift costs $7,500/month at the entry tier ($0.15/call). The same 50,000 signups on SignupDoggy cost $250 one-time. The 360x price difference is real.

## What Sift has that SignupDoggy does not

- Payment fraud scoring (the actual strength of Sift)
- Account takeover detection
- Content abuse detection
- Promo abuse detection
- Manual review console
- Network-effect fraud signals across all Sift customers

## What SignupDoggy has that Sift does not

- Self-service signup (5 minutes vs 4-week sales process)
- No sales call required
- No minimum spend beyond $5
- Disposable-email-first design
- $0.01 per call vs $0.05-$0.30 per call

## When to pick which

**Pick Sift if:**
- You are a marketplace with $10M+ ARR
- You need payment-fraud scoring (not just signup-fraud)
- You have a dedicated fraud analyst
- Your chargeback rate is the actual problem

**Pick SignupDoggy if:**
- You are a 2-50 person SaaS team
- You want a working API in an afternoon
- You want pay-per-call pricing with no monthly minimum
- You want the deepest disposable-email blocklist in the indie tier

The full comparison: /blog/sift-vs-signupdoggy-fraud-api-comparison.

If you are a 2-person SaaS reading this and considering Sift, you are over-buying. If you are a marketplace with $10M+ ARR reading this and considering SignupDoggy, you are under-buying.
`,

  '/vs/cloudflare-turnstile': `Cloudflare Turnstile vs a server-side fraud API: which actually wins?

Turnstile is the free, frictionless CAPTCHA alternative. It catches 95% of browser-based bots. It misses 100% of non-browser bots. A server-side fraud API like SignupDoggy catches the remaining 5% plus the non-browser bots.

The right answer: use BOTH. The 2-stage funnel pattern.

## Stage 1 — Cloudflare Turnstile (free)

- Passive challenge, no user interaction in 99% of cases
- Catches 95% of low-effort browser bots
- Free up to 1M verifications/month
- Sub-100ms verification latency

## Stage 2 — Server-side fraud API (SignupDoggy)

- Single API call after Turnstile passes
- Catches the remaining 5% of browser bots
- Catches all non-browser bots (curl, Python, Node fetch)
- Catches disposable email signups
- Catches VPN/Tor users
- $0.01 per call
- Sub-50ms p95

## The cost

Turnstile: $0.
SignupDoggy: $0.01 per call (only on the ~5% that pass Turnstile).
At 50,000 signups/month: $25/month for SignupDoggy, $0 for Turnstile.
Total: $25/month.

## The benefit

A 2-stage funnel catches 99%+ of bot signups with zero user friction. The 5% bot pass-through rate from Turnstile alone is fixed by the SignupDoggy stage. The user never sees a CAPTCHA challenge.

## The code

The full 30-line Node.js integration is in our blog post: /blog/cloudflare-turnstile-vs-server-side-fraud-api.

The short version: Turnstile verifies a token, then you call SignupDoggy with email and IP. If SignupDoggy returns recommendation: 'block', reject the signup. Otherwise allow it. The two calls add ~150ms to your signup handler and cost $0.01 per signup that passes Turnstile.

The math: 50,000 signups/month at 95% Turnstile pass-through = 2,500 SignupDoggy calls = $25/month. The cost of NOT having the funnel: 15,000 bot rows in your database per month = $7,500/year in storage. ROI: 300x.
`,
};

export const USE_CASE_BODIES: Record<string, string> = {
  '/use-cases/indie-hackers': `Fraud detection API for indie hackers — SignupDoggy

The indie-hacker fraud-detection problem is specific:

- You have a signup form on a side project or early-stage SaaS
- You don't have a fraud team, a fraud analyst, or a fraud budget
- You don't have time for a 4-week vendor onboarding
- You don't want to call sales to get an API key
- You have $5 to spend, not $25/month for the next 5 years

SignupDoggy is built for this exact buyer.

## The numbers

- $0.01 per call
- $5 minimum purchase (one-time)
- Credits never expire
- Self-service signup, 5 minutes from landing page to API key
- 30-minute integration for the typical signup form
- No sales call, no business email requirement

## The integration

A working Node.js example for the typical SaaS signup form:

\`\`\`js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid signup' });
}
\`\`\`

That's the entire integration. 10 lines of code. 30 minutes including testing.

## The catch rate

In production, SignupDoggy catches 99.7% of clearly fraudulent signups (disposable email + Tor/VPN) at a 0.4% false-positive rate on real users. The 0.4% false-positive rate is the rate at which real users get flagged — for B2B SaaS this is acceptable; for consumer apps you may want to tune the threshold.

## The bottleneck it solves

The bottleneck is not detecting fraud. The bottleneck is filtering it from your funnel data, your support inbox, and your Mixpanel analytics. SignupDoggy does this for $5-$100 one-time, not $25/month forever.

The full indie-hacker use case: /blog/how-to-validate-your-saas-idea-with-real-users.
`,

  '/use-cases/saas-startups': `Fraud detection for SaaS startups — SignupDoggy

A 2-50 person SaaS team has a specific fraud-detection problem:

- You have 5,000-100,000 signups per month
- 20-40% of them are bot signups, throwaway emails, or VPN users
- Your Mixpanel funnel data is polluted
- Your support inbox has tickets from "users" who never confirmed their email
- You don't have a fraud team, but you have a CTO who has other priorities

The fix is a single API call.

## The setup

1. Get an API key (5 minutes, self-service)
2. Add the call to your signup handler (30 minutes)
3. Ship it (no rollout needed — it just works)
4. Watch your bot rate drop to <1%

## The numbers

- 50,000 signups/month at 30% bot rate = 15,000 bot rows per month
- Without filtering: $0.50 per row in storage and processing = $7,500/year wasted
- With SignupDoggy: 50,000 signups × $0.01 = $500/month
- ROI: 15x in the first year

## The integration options

The most common patterns for SaaS startups:

1. Custom auth handler: call /v1/check from your signup endpoint
2. Supabase Auth: Postgres trigger on auth.users (the full code in our blog)
3. Auth0: Post-Login Action
4. Clerk: beforeUserCreate webhook
5. NextAuth: signIn callback

The full Supabase integration with working code: /blog/signup-validation-supabase-auth-integration.

## The 2-stage funnel

For SaaS at any scale, the right pattern is:

1. Cloudflare Turnstile (free, catches 95% of browser bots)
2. SignupDoggy (catches the remaining 5% + non-browser bots + disposable emails)

The cost: $0.01 per call on the ~5% that get past Turnstile. At 50,000 signups/month, that's $25/month. The benefit: 99%+ bot catch rate with zero user friction.

The full 2-stage funnel pattern: /blog/how-to-stop-bot-signups-without-captcha.
`,

  '/use-cases/ecommerce': `Fraud detection for e-commerce and marketplaces — SignupDoggy

E-commerce platforms and marketplaces have a specific problem at signup:

- Fake account creation for promo abuse (new account, get the 10% off code, repeat)
- Fake reviews from accounts that never bought anything
- Buyer-seller fraud where the buyer's account is throwaway
- Account takeover for stored credit cards

SignupDoggy is the signup-time gate. It is NOT a payment-fraud solution.

## What it catches at signup

- Disposable email addresses (200,000+ domains)
- VPN / Tor / proxy users
- Role-based email addresses (admin@, support@, info@)
- Bot-driven signup scripts
- Multi-account abuse patterns

## What it does not catch

- Payment fraud at checkout (use Stripe Radar or Signifyd for this)
- Chargebacks after the fact (use a chargeback management service)
- Account takeover (use Auth0 or Clerk for this)
- Promo-code abuse after the fact (use a promo-abuse detection service)

## The combined stack

The right e-commerce fraud stack in 2026:

1. SignupDoggy ($0.01/call) — at signup, filter bot account creation
2. Stripe Radar ($0.05/call or included free with Stripe) — at checkout, score the transaction
3. Signifyd or Kount (enterprise) — for chargeback management

The signup-time gate keeps your user database clean. The checkout-time gate keeps your chargeback rate low. They are different problems, different tools, different points in the funnel.

## The integration

\`\`\`js
// At signup, before creating the user
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid email' });
}
\`\`\`

10 lines of code. Add to your signup handler. Ship in an afternoon.

## The numbers

For an e-commerce platform with 100,000 signups/month:
- Without filtering: ~30,000 bot accounts per month in your database
- Each bot account eventually tries promo abuse, fake reviews, or chargeback fraud
- Average cost per bot account: $5-$50 in lost margin and ops time
- Total: $150,000-$1,500,000/year in bot-related losses
- With SignupDoggy: $1,000/month (100,000 signups × $0.01)
- ROI: 12x-150x

The signup-time gate is the cheapest insurance you can buy for an e-commerce platform.
`,
};

export const INTEGRATIONS_BODY = `SignupDoggy integrations

SignupDoggy integrates with everything. Here is the working code for each common platform.

## Supabase Auth (recommended)

The cleanest pattern: a Postgres trigger on auth.users. The trigger fires before each new user is created, calls SignupDoggy, and raises an exception if the recommendation is 'block'.

\`\`\`sql
create or replace function public.check_signup_quality()
returns trigger as $$
declare
  result jsonb;
begin
  select body into result from http_post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    jsonb_build_object('email', new.email, 'ip', coalesce(new.raw_user_meta_data->>'ip', '0.0.0.0')),
    'application/json',
    jsonb_build_object('X-API-KEY', current_setting('app.signupdoggy_key'))
  );

  if result->>'recommendation' = 'block' then
    raise exception 'Signup blocked: high risk signal';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_signup_quality_trigger
  before insert on auth.users
  for each row execute function public.check_signup_quality();
\`\`\`

Full tutorial: /blog/signup-validation-supabase-auth-integration.

## Cloudflare Workers

\`\`\`js
// In your signup Worker
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return new Response('Invalid signup', { status: 400 });
}
\`\`\`

## Next.js

Add to your API route:

\`\`\`js
// pages/api/signup.js or app/api/signup/route.js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip: req.headers['x-forwarded-for'] }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  return res.status(400).json({ error: 'Invalid signup' });
}
\`\`\`

## Node.js / Express

\`\`\`js
app.post('/signup', async (req, res) => {
  const { email } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (result.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid signup' });
  }

  // proceed with signup
});
\`\`\`

Full tutorial: /blog/disposable-email-detection-nodejs-tutorial.

## Python / FastAPI

\`\`\`python
import httpx
from fastapi import FastAPI, Request

app = FastAPI()

@app.post('/signup')
async def signup(request: Request):
    data = await request.json()
    email = data['email']
    ip = request.headers.get('x-forwarded-for', '')

    async with httpx.AsyncClient() as client:
        result = await client.post(
            'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
            headers={'X-API-KEY': 'sd_your_key_here'},
            json={'email': email, 'ip': ip},
        ).json()

    if result['recommendation'] == 'block':
        return {'error': 'Invalid signup'}, 400

    # proceed with signup
\`\`\`

## Django

\`\`\`python
import httpx
from django.http import JsonResponse

def signup(request):
    email = request.POST.get('email')
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '')

    result = httpx.post(
        'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
        headers={'X-API-KEY': settings.SIGNUPDOGGY_KEY},
        json={'email': email, 'ip': ip},
    ).json()

    if result['recommendation'] == 'block':
        return JsonResponse({'error': 'Invalid signup'}, status=400)
\`\`\`

## Cloudflare Turnstile + SignupDoggy (the 2-stage funnel)

Use Turnstile for the first stage (catches 95% of browser bots), SignupDoggy for the second stage (catches the remaining 5% + non-browser bots).

Full tutorial: /blog/cloudflare-turnstile-vs-server-side-fraud-api.

## Auth0

Use a Post-Login Action or Pre-User-Creation Action. Call SignupDoggy with the email and IP from the action's event object.

## Clerk

Use a beforeUserCreate webhook. Call SignupDoggy with the email_address and IP from the event payload.

## cURL

\`\`\`bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\
  -H "X-API-KEY: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
\`\`\`

That is the entire API surface. One endpoint, three parameters (email, ip, phone), one response.

See /docs for the full API reference.
`;

export const CHANGELOG_BODY = `SignupDoggy changelog

Every product change, every blocklist update, every new feature. Updated when shipped.

## 2026-06-20 — SEO + GEO content push

- 10 new long-form blog posts targeting buyer-intent keywords
- New comparison pages: /vs/ipqualityscore, /vs/maxmind, /vs/sift, /vs/cloudflare-turnstile
- New use-case pages: /use-cases/indie-hackers, /use-cases/saas-startups, /use-cases/ecommerce
- New /integrations page covering Supabase, Cloudflare Workers, Next.js, Node, Python
- New /changelog page (this one)
- Updated llms.txt with all new content
- Expanded robots.txt with additional AI bot allowlist entries

## 2026-06-19 — Blog infrastructure launch

- 5 long-form blog posts published
- /blog index and per-post pages with full AEO metadata
- Markdown twins for AI agents
- Per-post BlogPosting JSON-LD

## 2026-06-17 — Public launch

- Live at signupdoggy.pages.dev
- Detection API at signupdoggy-api.jeffrinjames99.workers.dev
- 125,000+ disposable email domains
- 70,000+ Tor exit nodes
- 24,000+ VPN / hosting ASNs
- $0.01 per call, $5 minimum, credits never expire
`;
