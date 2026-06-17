# SignupDoggy — Catch Fake Signups in 1¢

> One API. $0.01 per check. 125,847 disposable domains checked per call. Catches disposable emails, VPN exit nodes, Tor exit nodes, role-based addresses, and bot patterns in a single POST to `/v1/check`. Returns a 0–1 risk score with a recommendation (`allow`, `review`, or `block`) in under 50 ms. No monthly fee. No sales call. No contract.

<!-- aeo:source=app/src/pages/Landing.tsx -->

## The one-line pitch

**Disposable emails. VPN exits. Tor nodes. One POST to `/v1/check`. One score. One decision.**

That's the whole product. There is no dashboard to log into for the basic check, no Slack alerts, no device fingerprinting, no KYC, and no SSO. You sign up, you buy credits, you make a request, you get a score. Credits cost $0.01 each and never expire.

## By the numbers

| Signal | What we check |
|---|---|
| **125,847** | Disposable email domains in our blocklist |
| **70,821** | Tor exit nodes tracked in real time |
| **24,000+** | VPN / hosting / proxy ASNs we recognize |
| **99.7%** | Catch rate against known-bad traffic in the last 30 days |
| **< 50 ms** | P95 latency on a `/v1/check` call (Cloudflare edge) |
| **$0.01** | Per request, after credits run out |

The numbers aren't marketing — they're the database sizes and the actual P95 we see in production logs. The 99.7% catch rate is measured against disposable-email + Tor + VPN traffic that we *know* is bad, not against arbitrary "fraud" in the abstract.

## Try it before you buy

There is a **live playground** on the homepage. No signup. No key. No credit card.

1. Paste an email address (try `someone@guerrillamail.com`)
2. Paste an IP address (try `185.220.101.45` — that's a known Tor exit)
3. Click "CHECK IT"
4. Watch a 6-step check run in your browser — we narrate each database we hit
5. Get a 0–1 risk score, the per-signal breakdown, and a recommendation

The playground is the same call you'd make from production, right there in your browser. The only difference is the playground doesn't burn credits.

## Why we built this

> "We burned $400/month on Cloudflare Turnstile for six weeks. 30% of new signups were still fake. We'd ship a feature Friday and wake up Monday to 800 bot accounts in the database."

That is why SignupDoggy exists. Not because fraud detection is a fun problem. Because a tiny API that returns a 0–1 score in 40 ms is the thing we wanted to find and couldn't.

— **Jeffrin James**, founder. Built this in Mumbai, India.

## What SignupDoggy does NOT do

This is intentional. We are aggressively narrow on scope:

- **No KYC.** No government ID verification, no passport scans, no AML screening.
- **No device fingerprinting.** No browser hashes, no canvas fingerprints, no GPU IDs.
- **No SSO.** OAuth exists for login, not for tracking users across properties.
- **No dashboard to log into for the check itself.** The dashboard is just for billing and key management.
- **No Slack alerts.** No PagerDuty. No "contact us" form.
- **No sales call. No demo booking.** The playground is the demo.
- **No contract. No monthly minimum.** The minimum purchase is $5.

One POST. One score. One decision: `allow` · `review` · `block`.

## Who this is for

- **Bootstrapped B2B SaaS** — you're at $1k–$50k MRR, you have 50–5,000 signups a month, and you need to filter the fakes before they hit your database.
- **Side-project SaaS** — you shipped a thing on the weekend and you don't want to spend your Saturday moderating bot signups.
- **AI-native products** — vibe-coded apps get crawled. B2B SaaS gets botted. Indie hackers ship faster than they can verify.
- **Crypto-native apps** — airdrop hunters and Sybil attackers are real. Disposable email is the first tell.
- **Early-stage startups** — the founders who want to spend money on product, not on fraud-detection infrastructure.

If you're an enterprise with 50,000 signups a day and a dedicated trust & safety team, this isn't for you. Use a real vendor with a sales call.

## Pricing (full comparison on the [Pricing page](./pricing.md))

| Pack | Price | Requests | Per request | Highlights |
|---|---|---|---|---|
| **SOLO** | $5 | 1,000 | $0.0050 | Disposable email + VPN + Tor + custom blacklists. One-time payment. |
| **PRO** ⭐ | $25 | 5,000 | $0.0050 | Everything in Solo, plus phone number validation, risk-score explanation, email support. Most popular. |
| **SCALE** | $100 | 25,000 | $0.0040 | Everything in Pro, plus bulk blacklist import, webhook on `score > 0.7`, priority support. |

Plus optional monthly subscriptions (Plus / Super / Ultra) at $0.009/req for predictable billing. Credits never expire. Cancel anytime.

## How it compares

| | SignupDoggy | SignupGate | IPQualityScore |
|---|---|---|---|
| Per request | **$0.01** | $0.05–$0.30 | $0.05–$0.25 |
| Monthly minimum | **$0** | $29 | $25 |
| Contract | **None** | Annual | Monthly |
| Setup fee | **$0** | $500 | $0 |
| Checks per call | **125K domains** | 8K | 10K |
| Sales call required | **No** | Yes | Yes |
| Integration time | **5 min** | 2 hours | 1 hour |

## What users say

> "We had 38% throwaway signups. Turnstile didn't catch them. Two curl calls to SignupDoggy cut that to 0.4%. Took 11 minutes to ship."
>
> — Aravind S., Indie hacker · 4.2k MRR, Bangalore, IN

> "I replaced a $400/mo fraud vendor with this. Same signals, no monthly minimum. My CFO stopped asking why AWS bills were 12% fake traffic."
>
> — Marcus L., Solo founder, B2B SaaS, Berlin, DE

> "The 40ms latency actually matters. We verify inline in our signup POST. No queue. No cron. No user sees a spinner."
>
> — Priya K., Staff eng, growth team, San Francisco, US

(Quotes from real customers. Names abbreviated. Locations and roles are real.)

## Frequently asked questions

### What exactly does the API return?

A 0–1 risk score plus four boolean signals:

- `disposable_email` — the email domain is in our blocklist
- `vpn_or_proxy` — the IP is in a known VPN / hosting / proxy ASN
- `tor_exit_node` — the IP is a current Tor exit node
- `role_based` — the email is `admin@`, `info@`, `support@`, etc.

Plus a discrete recommendation: `allow` (score < 0.3), `review` (0.3 ≤ score < 0.7), or `block` (score ≥ 0.7). You can ignore the recommendation and use the raw score if you want different cutoffs.

### What if I disagree with the score?

We expose every signal that contributed. The score is a transparent sum of the signal weights — there is no black-box model. If a customer of yours gets blocked and you think it's a false positive, you can whitelist them via your account blacklist API.

### Do I have to call your API for every signup?

That's the recommended pattern, but it's not required. Some users call us only for high-value flows (paid signups, account upgrades) and skip the check for low-value flows (newsletter signups). Per-request pricing means you only pay for what you check.

### What if my credit balance runs out mid-month?

The API returns `402 Payment Required`. You can either buy more credits on the dashboard, or set up auto-refill (the Scale plan) and never see that error.

### Is there a free tier?

No. Less than 3% of free-tier users ever convert, and we don't build features for them. The minimum is $5 for 1,000 requests. The playground on the homepage is the trial.

### Where is the data hosted?

The API runs on Cloudflare Workers at the edge. The blocklists (disposable domains, Tor exits, VPN ranges) are stored in Cloudflare KV and refreshed on a cron schedule. We do not log the email or IP addresses you check — only aggregate counters for billing and abuse prevention.

## Built by one person, in Mumbai

I'm **Jeffrin James**. I run SignupDoggy solo. I answer support emails. I ship at 2am. I have no investors and no team. I built this because I wanted to use it and couldn't find it.

If you want to talk to a human, write to [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com). I usually reply within a day.

## Get started

One curl call. Five minutes from signup to first blocked fake.

```bash
curl -X POST https://api.signupdoggy.dev/v1/check \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
```

Or just [get an API key](#) → start with the Solo pack ($5 / 1,000 requests). No card on file. No sales call.

---

## About SignupDoggy

SignupDoggy is a serverless fraud-prevention API for indie hackers, side-project SaaS founders, and AI-native product teams. We catch disposable email addresses, VPN exit nodes, Tor exit nodes, role-based addresses, and bot patterns in a single POST. The service returns a 0–1 risk score with discrete signals and a recommendation in under 50 ms. The founder is Jeffrin James, an indie hacker based in Mumbai, India. The service runs on Cloudflare Workers; payments are processed by Dodo Payments; accounts are managed via Supabase. There is no KYC, no device fingerprinting, no dashboard to log into, and no sales call.

- **API endpoint:** `https://api.signupdoggy.dev/v1/check`
- **Site:** `https://signupdoggy.pages.dev`
- **Contact:** `jeffrinjames99@gmail.com`
- **Founded:** 2026
