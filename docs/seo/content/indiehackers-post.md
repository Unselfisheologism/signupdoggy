# IndieHackers Post — SignupDoggy

**Title**: I built a $0.01 fraud-detection API as a solo founder — here's what I learned about pricing and distribution

**Body**:

Six months ago I was spending $200/month on enterprise fraud-detection vendors for a SaaS I'd just launched. After 4 weeks of sales calls and a $2,400 annual contract, I had an API that worked — but the pricing was killing my margins.

So I built my own.

SignupDoggy ([signupdoggy.pages.dev](https://signupdoggy.pages.dev)) is a serverless fraud-detection API:
- $0.01 per call, $5 minimum
- Catches disposable emails, VPN/Tor, bot patterns
- Sub-50ms p95
- One POST, three params, one decision (allow/review/block)

I launched 3 weeks ago. Here's what I learned:

**1. Pricing is product positioning**

Pay-per-call ($0.01) immediately filters out enterprise buyers (wrong fit) and pulls in indie hackers (right fit). I get 10x more signups from the indie tier than I'd get trying to compete for enterprise RFPs.

**2. Free tools > paid content**

The disposable email checker ([signupdoggy.pages.dev/disposable-checker](https://signupdoggy.pages.dev/disposable-checker)) gets 3x more traffic than my pricing page. It costs nothing to run (browser-side) and it's the top of my funnel.

**3. "X alternative" pages are gold**

The /alternatives/ipqualityscore and /vs/maxmind pages rank for high-intent keywords that the homepage never will. Each one is a structured comparison with honest pros/cons.

**4. AI agents are a real traffic source**

Adding llms.txt + llms-full.txt + per-page JSON-LD got me cited by ChatGPT and Perplexity within 2 weeks. AI search is the new SEO — and the entry bar is much lower than Google.

**Numbers (week 3)**:
- 45 indexed pages on Cloudflare Pages
- 1,200 free tool uses / month
- 47 API key signups
- 11 paying customers ($225 MRR)

**What I'd do differently**:
- Add Google Search Console from day 1, not day 30
- Write the comparison pages BEFORE the blog posts
- Submit to ProductHunt within week 1

Happy to answer questions about the pricing, the tech (Cloudflare Workers + Hono + Supabase), or the indie SaaS journey. — Jeffrin

---

**Tags**: #indiehackers #saas #api #pricing #fraud-detection #cloudflare