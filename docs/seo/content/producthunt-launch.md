# SignupDoggy — Product Hunt Launch

## Title (60 chars max)
SignupDoggy — Disposable email & VPN detection API for $0.01/call

## Tagline (60 chars max)
Serverless fraud-detection API. Catches bots at signup. $0.01/check.

## Topics
API, Developer Tools, SaaS, Privacy, Security

## Gallery (4 images, ordered by impact)

1. **Landing page screenshot** — show the one-screen pitch, demo playground, pricing teaser
2. **Disposable Email Checker** — the free tool (signupdoggy.pages.dev/disposable-checker)
3. **API docs** — show the clean REST reference + curl example
4. **Comparison table** — IPQualityScore vs SignupDoggy pricing

## Description

SignupDoggy is a serverless fraud-detection API for SaaS signup forms.

**The problem**: 5–30% of new SaaS signups are disposable emails, VPN users, or bots. They pollute your funnel data, waste support time, and never convert.

**The fix**: one POST to /v1/check with the email + IP. You get back a 0–1 risk score plus an allow/review/block recommendation in under 50ms.

**Why we're different**:
- $0.01 per call, $5 minimum (1,000 calls), credits never expire
- No monthly fee, no subscription, no sales call
- 200,000+ disposable domains, 70,000+ Tor exits, 24,000+ VPN ASNs
- Sub-50ms p95 latency, no queueing
- Built by a solo founder in Mumbai — you email me, I answer

**Tech**: Cloudflare Workers (edge), Hono, Supabase, React.

**Free tools**:
- [Disposable Email Checker](https://signupdoggy.pages.dev/disposable-checker) — browser-based, no signup
- [API Reference](https://signupdoggy.pages.dev/docs) — full docs with curl/Node/Python

**Built for**: indie hackers and 2–50 person SaaS teams that need a working fraud API in an afternoon, not a 4-week vendor onboarding.

**Not for**: enterprise fraud teams with $50k+/year budgets (use IPQualityScore or MaxMind).

## Maker comment

Hey Product Hunt! I'm Jeffrin, the solo founder. Built this because I spent 6 months and $2,400 on enterprise fraud vendors that didn't fit my use case. Wanted a $0.01 API I could call inline at signup.

Roadmap:
- Phone validation (live now in Pro)
- Webhook on score > 0.7 (live now in Scale)
- ML-based anomaly detection (Q3 2026)
- Email reputation (Q4 2026)

Happy to answer any questions. If you try it and have feedback, my email is in the footer. — Jeffrin