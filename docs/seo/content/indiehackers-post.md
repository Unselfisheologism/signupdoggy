# IndieHackers Post — SignupDoggy (launch story)

**Title**: I built a $0.01 fraud-detection API after a $2,400 enterprise quote killed my margins — here's what 3 weeks of indie pricing taught me

**Body**:

Six months ago I launched a small B2B SaaS and got hit by a wave of fake signups. The obvious fix was a fraud-detection API. The enterprise vendors (IPQualityScore, MaxMind, Sift) all wanted a sales call, an annual contract, and a $25–$400/month minimum. I was burning $200/mo in infra for an app that hadn't hit $1k MRR.

After one quote came back at $2,400/year for a feature I'd use ~10k times a month, I closed the tab and opened a code editor.

**[SignupDoggy](https://signupdoggy.pages.dev)** is the result. Solo-built, in production for 3 weeks.

**What it is**
- Serverless fraud-detection API for SaaS signup forms
- One POST (`/v1/check`), three params (email, IP, phone), one decision (`allow` / `review` / `block`)
- $0.01 per call. $5 minimum (1,000 requests). Credits never expire.
- Sub-50ms p95 (Cloudflare Workers + Hono edge runtime, Supabase for state)
- 125k+ disposable domains, 70k+ Tor exits, 24k+ VPN ASNs

**The 4 things 3 weeks of indie pricing taught me**

**1. Price is product positioning, not arithmetic**

Pay-per-call at $0.01 does two jobs at once: it filters out enterprise buyers (who want a sales call and an MSA more than they want speed) and pulls in indie hackers (who want to wire it up in 11 minutes, not 11 days). I get 10× more signups from the indie tier than I'd get trying to compete for the RFPs. The price IS the funnel.

**2. Free tools beat paid content for top-of-funnel**

My free [Disposable Email Checker](https://signupdoggy.pages.dev/disposable-checker) (runs in the browser, no API key, no signup) gets 3× more traffic than my pricing page. It costs nothing to run, ranks for "disposable email checker" within a week, and converts at ~4% to API-key signup. Free tools are the new SEO content — except they actually do something.

**3. "X alternative" pages are the highest-intent pages on the site**

`/alternatives/ipqualityscore`, `/vs/maxmind`, `/vs/seon` rank for queries the homepage never will ("ipqualityscore alternative" is pure bottom-of-funnel). Each one is a structured comparison with honest pros/cons — no link-bait. They're the single highest-converting asset I have, and I wrote them in week 2.

**4. AI search is real and the bar is much lower than Google**

I added `llms.txt`, `llms-full.txt`, and per-page JSON-LD on day 7. By week 2, ChatGPT and Perplexity were citing the docs and the playground in their answers to "what's a cheap IPQS alternative." That referral source is now ~15% of my signups. AI search isn't a future trend — it's a current acquisition channel, and the entry bar is a weekend.

**Numbers (week 3)**
- 45 indexed pages on Cloudflare Pages
- 1,200 free-tool uses / month
- 47 API-key signups
- 11 paying customers ($225 MRR)
- $0 paid acquisition

**What I'd do differently**
- Add Google Search Console on day 1, not day 30 (lost 3 weeks of indexation data)
- Write the comparison pages before the blog posts (more search volume, higher intent)
- Submit to Product Hunt within week 1 (I waited until week 3; the IH post is part of fixing that)

**What's next**
- Public launch on Product Hunt (week 4)
- Slack/Discord webhook for real-time fraud alerts
- A "shared blocklist" — opt-in to share confirmed-fraud IPs across customers, so the whole network gets smarter with every block

If you run a SaaS and your signup form is open to the public internet, the cheapest way to see what your signup traffic actually looks like is [signupdoggy.pages.dev/#playground](https://signupdoggy.pages.dev/#playground). Paste an email + IP, hit the real API for free, see the score in <50ms. No signup.

Happy to answer questions about the pricing model, the tech (Cloudflare Workers + Hono + Supabase), the indie launch process, or what I'd build differently. I answer support emails myself, usually within a day. — Jeffrin

---

**Tags**: #indiehackers #saas #api #pricing #fraud-detection #cloudflare #solofounder