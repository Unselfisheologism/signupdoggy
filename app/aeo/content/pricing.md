# SignupDoggy Pricing

> Credit-based. 1 credit = $0.01 USD. Pay once or subscribe monthly. Auto-refill is optional. No monthly minimum. No contract. No sales call.

<!-- aeo:source=app/src/pages/Pricing.tsx -->

## Top-up credits (the default)

Buy once. Use whenever. Credits never expire. **1 credit = $0.01.**

| Pack | Price | Credits | Per request | Best for |
|---|---|---|---|---|
| **SOLO** | $5 | 1,000 | $0.0050 | First-time users, side projects, low-volume apps |
| **PRO** ⭐ | $25 | 5,000 | $0.0050 | Most popular. Indie SaaS at $1k–$10k MRR with hundreds of signups a month. Adds phone validation, risk-score explanation, and email support. |
| **SCALE** | $100 | 25,000 | $0.0040 | High-volume apps, growth-stage startups. Adds bulk blacklist import, webhook on `score > 0.7`, and priority support. |

Every pack includes:

- Disposable email detection (125,847+ domains)
- VPN / proxy / Tor detection
- Custom blacklists
- One-time payment (no recurring charge)
- No card on file after the purchase

PRO adds:

- Phone number validation (E.164 format, 100k+ blocklist)
- Risk-score explanation (per-signal breakdown returned with every check)
- Email support (Jeffrin answers directly, <24h reply)

SCALE adds:

- Bulk blacklist import (CSV upload, 1000+ entries at a time)
- Webhook on `score > 0.7` (auto-quarantine integration)
- Priority support (top of the queue)

After credits run out, the API returns `402 Payment Required`. You can either buy more from the dashboard, set up auto-refill, or switch to a monthly subscription.

## Monthly subscription (optional)

Prefer predictable billing? Subscribe monthly. You still get a shared credit pool; top-up credits roll over if you go over. **You can cancel anytime.**

| Plan | Price / month | Credits / month | Per request | Highlights |
|---|---|---|---|---|
| **PLUS** | $20 | 2,200 | $0.0090 | 10% bonus on monthly cap. Phone validation included. Email support (<24h). |
| **SUPER** | $100 | 11,000 | $0.0090 | 10% bonus. Same per-request price as Plus, just more credits. |
| **ULTRA** | $200 | 22,000 | $0.0090 | 10% bonus. Same per-request price. |

Every subscription includes:

- Rollover up to 1× the monthly cap (unused credits carry forward for one month)
- Phone validation included
- Email support (<24h reply)
- Cancel anytime (no contract, no questions)

Subscriptions are billed monthly by Stripe. You can also have a top-up balance on top of a subscription — if you go over your monthly cap, we draw from the top-up first, then return `402`.

## Auto-refill (optional)

Set a low-balance threshold. When you hit it, we top you up automatically with the pack you pick. No surprise overages. **No contract.**

| Setting | Default |
|---|---|
| **Trigger when balance drops below** | 500 credits ($5) |
| **Then buy** | 2,500 credits ($25) |
| **Max per month** | Unlimited (configurable) |

Auto-refill is configured in the dashboard under `/billing`. Toggle off anytime. No contract.

## Comparison

|  | SignupDoggy | SignupGate | IPQualityScore |
|---|---|---|---|
| Per request | **$0.01** | $0.05–$0.30 | $0.05–$0.25 |
| Monthly minimum | **$0** | $29 | $25 |
| Contract | **None** | Annual | Monthly |
| Setup fee | **$0** | $500 | $0 |
| Checks per call | **125K domains** | 8K | 10K |
| Sales call | **No** | Yes | Yes |
| Integration time | **5 min** | 2 hours | 1 hour |

## Frequently asked questions

### Do credits expire?

No. Buy once, use them in a week or a year. We don't expire credits.

### Is there a trial?

There's a [live demo](#) on the homepage. Paste an email, see a real score, no signup. The playground *is* the trial.

### Why not just $0/month free?

Because less than 3% of free users ever convert. We don't build features for them. We build for people who pay.

### Do I have to subscribe?

No. Buy a one-time pack above and you're done. Subscribe only if you want monthly credits that auto-renew.

### What if I burn through my credits?

The dashboard will alert you. Buy more at any time, or set up auto-refill so you never hit zero.

### 1 credit = $0.01?

Yes. Every API call costs 1 credit. If you buy 2,500 credits for $25, that's 2,500 API calls. 1 call = 1¢.

### Can I get a refund?

If you bought credits and changed your mind within 7 days, email [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com). Refunds are at the founder's discretion. See the [Terms of Service](./terms.md) for the full refund policy.

### Do you offer enterprise contracts?

No. If you need an enterprise contract, an MSA, a DPA, a security questionnaire, or a SOC 2 report, SignupDoggy is the wrong product for you. We're optimized for the opposite case: small teams that want to pay with a credit card and ship today.

## Get started

1. Sign up at [signupdoggy.pages.dev](https://signupdoggy.pages.dev)
2. Pick a pack (Solo is the default)
3. Get an API key
4. Make your first call

That's it. No card on file. No sales call.
