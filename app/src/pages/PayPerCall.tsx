// /pay-per-call — landing page targeting the "pay per call API" keyword cluster.
//
// Targets: pay per call API, pay per call fraud detection, pay-as-you-go API,
// no subscription API, no monthly fee API, fraud detection API pricing.
//
// Uses StaticPage with an inline body string (same pattern as the comparison
// and use-case pages). The body lives in this file rather than staticBodies.ts
// because it's page-specific and not shared across routes.

import { Link } from 'react-router-dom';
import StaticPage from './StaticPage';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

const BODY = `If you've been shopping for a fraud-detection API, email validation API, or any other developer tool, you've hit the same wall: every "enterprise" vendor wants a $25/month minimum, an annual contract, or a sales call. **Pay-per-call** pricing flips that — you pay only for what you use, no minimum, no subscription.

This page is the indie-hacker / SaaS-startup playbook for evaluating pay-per-call APIs (and a deep dive on why SignupDoggy is the cheapest one that still ships to production).

## What "pay-per-call" actually means

A pay-per-call API charges you only for the requests you make. The math is straightforward:

- **Per-call cost** — the price of one request (SignupDoggy: $0.01)
- **No minimum spend** — you can buy 100 calls or 100,000 calls
- **No monthly subscription** — there's no recurring charge for "access to the API"
- **No annual contract** — you can stop using the API at any time

The opposite model — the one most fraud-detection vendors use — is **subscription-based**:

- **Monthly fee** — pay $X/month regardless of usage (typical: $25–$500/month)
- **Per-call surcharge** — and then pay per call ON TOP of the monthly fee
- **Annual contract** — sign for 12 months upfront or pay a penalty

For an indie hacker running a side project, the subscription model is broken — you pay $300/year before you've validated a single signup. The pay-per-call model matches your actual usage.

## Why pay-per-call wins for indie SaaS

Three concrete reasons:

**1. Cash flow matches revenue.** When your SaaS hits $20 MRR, you don't want to be locked into a $25/month IPQS contract. Pay-per-call aligns your fraud-detection spend with your revenue.

**2. No vendor lock-in.** The moment you're not locked into a 12-month contract, you can switch APIs in an afternoon. This pushes vendors to compete on quality.

**3. You only pay for real value.** If your signup form gets 10 fake signups today and 0 tomorrow, your bill reflects that. With a subscription, you pay the same regardless.

## The SignupDoggy pay-per-call model

SignupDoggy is the cheapest pay-per-call fraud-detection API that actually ships to production:

| Tier | Price | Calls | Per-call cost |
|---|---|---|---|
| Solo | $5 one-time | 1,000 | $0.005 |
| Pro | $25 one-time | 5,000 | $0.005 |
| Scale | $100 one-time | 25,000 | $0.004 |
| PLUS subscription | $20/month | 2,200/month | ~$0.009/month |
| SUPER subscription | $100/month | 11,000/month | ~$0.009/month |
| ULTRA subscription | $200/month | 22,000/month | ~$0.009/month |

**Key details:**

- Credits **never expire**. Buy 1,000 credits in January, use them in December.
- No monthly fee on the one-time packs. Pay $5 once, get 1,000 calls forever.
- The subscriptions exist for high-volume users who want predictable monthly billing.
- You can mix and match — buy a Solo pack AND a PLUS subscription.

## Compare to subscription alternatives

Here's what you'd pay at 5,000 signups/month on the subscription alternatives:

| Provider | Monthly cost | Annual cost | Per-call |
|---|---|---|---|
| IPQualityScore | $25–$80/month | $300–$960/year | $0.005–$0.016 |
| MaxMind minFraud | $25–$75/month | $300–$900/year | $0.005–$0.030 |
| Sift | $1,000+/month | $12,000+/year | $0.05–$0.30 |
| **SignupDoggy (Pay-per-call)** | **$0 first month** | **$5–$50 one-time** | **$0.004–$0.01** |

For 5,000 signups/month sustained for 12 months:

- IPQS: $300–$960/year
- MaxMind: $300–$900/year
- Sift: $12,000+/year
- SignupDoggy: $25/year (Pro pack, refilled annually)

That's a **12x–480x cost difference** at the same volume.

## When pay-per-call DOESN'T win

Honest take: pay-per-call loses on the extreme high end. If you're processing 10M signups/month and your fraud budget is $50,000/month, a subscription with volume discounts might beat per-call pricing. But:

- Most SaaS companies never hit 10M signups/month
- The switching cost of changing fraud vendors is real (engineers don't want to do it)
- A vendor offering a subscription often offers pay-per-call too — you can negotiate

So pay-per-call is the right default for **anyone under 1M signups/month**, which is the vast majority of SaaS companies.

## What to look for in a pay-per-call fraud API

Five criteria:

1. **Real coverage** — does the API check disposable emails? Tor exits? VPN ASNs? Role-based emails? Phone numbers? Or just one of these?
2. **Sub-100ms latency** — if the API takes 500ms, your signup form will feel slow. Sub-50ms is the standard.
3. **No minimums** — the whole point of pay-per-call is no minimum spend.
4. **Credits that don't expire** — if your credits expire in 30 days, you're back to a subscription in disguise.
5. **No sales call** — if you have to talk to a human to sign up, the vendor has pricing leverage over you.

SignupDoggy hits all five:

- ✅ Checks disposable email (125K+ domains), Tor exits (70K+ nodes), VPN/hosting ASNs (24K+), role-based emails, phone numbers
- ✅ Sub-50ms p95 latency (Cloudflare Workers edge)
- ✅ $5 minimum (1,000 calls), no monthly fee
- ✅ Credits never expire
- ✅ No sales call — self-service at /pricing

## How to integrate in 5 minutes

One POST to /v1/check with email + IP, get back a 0–1 risk score + allow/review/block recommendation:

\`\`\`js
const r = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip: req.ip, phone }),
}).then(r => r.json());

if (r.recommendation === 'block') return res.status(400).json({ error: 'Invalid signup' });
\`\`\`

That's it. No SDK. No SDK lock-in. Just curl + your HTTP client.

## Who uses pay-per-call APIs

- **Indie hackers** running side projects with <1,000 signups/month
- **SaaS startups** in their first year, validating product-market fit
- **Open-source maintainers** who want fraud detection on their self-hosted signup forms
- **Bootstrapped SaaS** that doesn't want to pay $300/year before they've proven their model

## Get started

Buy credits at /pricing — $5 minimum, no monthly fee, credits never expire. Or try the playground for free — one free /v1/check call per day, no signup, no API key, no email.

Questions? Email jeffrinjames99@gmail.com.`;

export default function PayPerCall() {
  return (
    <StaticPage
      config={SEO_ROUTES.payPerCall}
      body={BODY}
      bannerCmd="./pricing --pay-per-call"
      bannerStatus="NO MONTHLY FEE"
    />
  );
}