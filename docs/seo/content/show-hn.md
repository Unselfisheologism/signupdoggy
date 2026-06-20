# Show HN — SignupDoggy

**Title**: Show HN: SignupDoggy – Disposable email & VPN detection API for $0.01/call

**Body**:

Hi HN,

I'm Jeffrin, solo founder of SignupDoggy ([signupdoggy.pages.dev](https://signupdoggy.pages.dev)). It's a serverless fraud-detection API for SaaS signup forms.

The problem it solves: 5–30% of new SaaS signups are disposable emails, VPN users, or bots. They pollute analytics, waste support time, and never convert. The existing options (IPQualityScore, MaxMind, Sift) charge $25–$400/month and require sales calls.

SignupDoggy charges $0.01 per API call. $5 minimum. No monthly fee. No sales call. Credits never expire.

The tech: Cloudflare Workers (edge), Hono, Supabase. 200,000+ disposable domains, 70,000+ Tor exits, 24,000+ VPN ASNs. Sub-50ms p95.

**Free tools** (no signup required):
- [Disposable Email Checker](https://signupdoggy.pages.dev/disposable-checker) — browser-based
- [API Reference](https://signupdoggy.pages.dev/docs)

**What I'm looking for**:
1. Feedback on the API design (one endpoint, three params, one decision: allow/review/block)
2. Beta testers who want to integrate it in their SaaS
3. Honest critique of the pricing — am I too cheap, too expensive, or right?

Why I'm sharing here: indie SaaS teams on HN are exactly the target market. If this works for them, it works for everyone. If it doesn't work for them, I want to know why before I scale the marketing spend.

Built in Mumbai, India. One person. I answer support emails myself, usually within a day.

Happy to discuss the design, the business, or the tech. — Jeffrin