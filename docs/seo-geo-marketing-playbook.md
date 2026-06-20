# SignupDoggy Marketing Playbook (External SEO)

This is the manual for the parts of SEO that happen OUTSIDE the codebase —
backlinks, directory listings, social shares, and product launches. Code
changes alone don't get a site into Google's index; you need at least 10-20
high-quality external signals pointing at it. This document lists the
specific actions, copy, and URLs to use.

## Priority 1: Submit to Google Search Console (5 min)

**Owner:** Founder (Jeffrin)
**Why:** Until Google knows your site exists, you cannot rank. Search Console
is the channel.

Steps:
1. Go to https://search.google.com/search-console/
2. Add property: `https://signupdoggy.pages.dev`
3. Verify via the existing HTML file: `/google025641382a654cfe.html`
   (already deployed; Google just needs to fetch it)
4. Submit sitemap: `https://signupdoggy.pages.dev/sitemap.xml`
5. Use URL Inspection to request indexing of:
   - https://signupdoggy.pages.dev/
   - https://signupdoggy.pages.dev/docs
   - https://signupdoggy.pages.dev/pricing
   - https://signupdoggy.pages.dev/blog
   - One blog post per day for the first 30 days
6. Enable email notifications for crawl errors, manual actions

## Priority 2: Submit to Bing Webmaster Tools (5 min)

**Owner:** Founder
**Why:** Bing powers DuckDuckGo and a meaningful slice of US search.

Steps:
1. Go to https://www.bing.com/webmasters
2. Add site, verify via Google Search Console import
3. Submit sitemap: `https://signupdoggy.pages.dev/sitemap.xml`
4. Use URL Inspection to request indexing of key pages

## Priority 3: Product Hunt launch (2 hours prep, 24 hours cooldown)

**Owner:** Founder
**Why:** Product Hunt gives you a dofollow backlink, social signals, and
real users.

When to launch: Tuesday or Wednesday at 12:01 AM PT. Avoid Mondays
(competitor launches) and Fridays (low traffic).

Assets needed:
- Tagline: "Disposable email + VPN + Tor detection in one API call. $0.01 each, $5 minimum, no sales call."
- Description: 280 chars
- First comment: founder story (the $2,400 on enterprise fraud-detection vendors that didn't fit)
- 4-6 screenshots
- Maker comment within 1 hour of launch

Pre-launch:
- 2 weeks before: build email list of 50 friends, indie hackers, Twitter followers
- 1 week before: schedule the launch, prep the assets
- 1 day before: line up 10 supporters to upvote and comment in the first 2 hours

## Priority 4: Indie Hackers post (1 hour)

**Owner:** Founder
**Why:** Indie Hackers is a high-authority site for the target buyer. A
"Building SignupDoggy" post in the technical founder section gets indexed
in days.

URL: https://www.indiehackers.com/post/new

Title: "I built a fraud-detection API after spending $2,400 on enterprise vendors that didn't fit. Here's what I learned."

Body outline:
1. The problem (bot signups polluting the database)
2. The vendor search (IPQualityScore, MaxMind, Sift - all too expensive for indie)
3. The build (Cloudflare Workers, the 200k domain blocklist, the calibration)
4. The launch (X / Twitter, Indie Hackers, Product Hunt)
5. The numbers (X signups, Y API calls, Z MRR after 30 days)

## Priority 5: Twitter / X thread (30 min)

**Owner:** Founder
**Why:** Twitter threads get indexed in Google. One well-shared thread can
drive 100+ signups.

Template thread (8 posts):

1/ "I built a fraud-detection API after spending $2,400 on enterprise vendors that didn't fit my SaaS. Here's the pricing comparison nobody talks about."

2/ "I was getting 30% bot signups on my SaaS. Mailinator, Guerrilla Mail, Tempmail, all the usual suspects. My Mixpanel funnel was lying to me. Half my 'users' were throwaway emails behind Tor exit nodes."

3/ "I tried IPQualityScore. $25/month minimum, 5,000 free lookups if I gave them my business email. I tried MaxMind. 4-week onboarding, separate license for the IP risk score, $1,500/month at my volume. I tried Sift. Sales-led, $2k+/month, no self-service."

4/ "So I built my own. $0.01 per call. $5 minimum. No sales call. No business email required. 30-minute integration. Catches 99.7% of clearly fraudulent signups at a 0.4% false-positive rate."

5/ "It's just one API endpoint. POST /v1/check with email, IP, optional phone. Returns a 0-1 risk score and an allow/review/block recommendation. Sub-50ms p95. Hosted on Cloudflare Workers."

6/ "The blocklist is the moat. 200,000+ disposable email domains, synced daily from the public GitHub list plus 175 per-provider crawls. The long tail is what catches the active fraudsters."

7/ "If you have a SaaS with a signup form, you have this problem. 5-15% of new accounts are disposable email addresses. The fix is one HTTP call. The cost is $0.01 per signup. The integration is 30 minutes."

8/ "Link in bio. Free API key, no credit card. The 1¢ demo is live. https://signupdoggy.pages.dev"

## Priority 6: Dev.to article (2 hours)

**Owner:** Founder or contractor
**Why:** Dev.to has high domain authority. A well-tagged article ranks in
Google within days.

Title: "Building a $0.01 fraud-detection API: the disposable-email blocklist, the threshold tuning, and the 99.7% catch rate"

Tags: #api #saas #indiehackers #fraud-detection #cloudflare

Outline (matches the disposable-email-list-2026 blog post but with more
code and more screenshots):
1. The problem
2. The blocklist sync architecture
3. The threshold tuning
4. The catch rate measurement
5. The pricing math
6. The full code (Cloudflare Worker + KV)
7. The lesson

## Priority 7: Hacker News Show HN (after Product Hunt)

**Owner:** Founder
**Why:** HN drives 10k+ visits from developers if it hits the front page.

When: 2 weeks after Product Hunt, on a weekday morning US time.

Title: "Show HN: SignupDoggy – $0.01 disposable email + VPN + Tor detection API"

Text: "I built this after spending $2,400 on enterprise fraud-detection vendors that didn't fit my SaaS. It's one API endpoint, $0.01 per call, $5 minimum, 30-minute integration. Catches 99.7% of disposable email + Tor/VPN signups at 0.4% false-positive. The 1¢ demo is live in the browser, no signup required. Looking for feedback on the threshold tuning and pricing."

## Priority 8: SaaS directory submissions (30 min total)

**Owner:** Founder or VA
**Why:** Dofollow backlinks from high-authority directories. Each one is a
small ranking signal.

Submit to:
- https://www.producthunt.com (Priority 3)
- https://www.betalist.com
- https://www.indiehackers.com/products
- https://www.saashub.com
- https://www.capterra.com
- https://www.g2.com
- https://www.crunchbase.com (free company listing)
- https://www.f6s.com
- https://www.startupstash.com
- https://www.toolpilot.io
- https://www.aitools.fyi
- https://www.launchingnext.com
- https://www.sideprojectors.com
- https://www.mvp.academy
- https://www.killerstartups.com

For each: name, tagline, description, logo, link to /docs, screenshots.

## Priority 9: Cross-link to/from the blog

**Owner:** Founder
**Why:** Internal links between blog posts and product pages distribute
page authority. Currently 5 blog posts have 0-2 internal links each.

Add to each blog post:
- 1 link to a relevant product page (/docs, /pricing, /integrations, or a /vs page)
- 2 links to other blog posts
- 1 link to a /use-cases page
- 1 link to /changelog

Example for "MaxMind vs SignupDoggy":
- Link to /pricing from the pricing table
- Link to /use-cases/saas-startups from the "use case" section
- Link to /blog/sift-vs-signupdoggy from the "see also" section
- Link to /integrations from the "code" section
- Link to /blog/how-to-stop-bot-signups-without-captcha from the "related reading" section

## Priority 10: GitHub README + repo

**Owner:** Founder
**Why:** GitHub profiles rank in Google. A public repo with a great README
gives you a second ranking page for the brand search.

Create `signupdoggy/signupdoggy` (or use the existing
`Unselfisheologism/registerguardian` repo):
- README.md with the API quickstart, code examples, badge
- LICENSE (MIT)
- docs/ folder with the same content as /docs
- examples/ folder with Node.js, Python, Supabase, Cloudflare Workers

## Priority 11: Reddit posts (1 hour total)

**Owner:** Founder
**Why:** Reddit threads rank in Google. The "best tools for X" subreddit
posts are link-bait for SaaS buyers.

Post to:
- r/SaaS (8M members): "What's your signup fraud detection stack? We built a $0.01 alternative to IPQualityScore"
- r/IndieHackers (1.5M members): "After spending $2,400 on enterprise fraud APIs, I built a $0.01 alternative. Here's what I learned."
- r/programming (5M members): "Show: I built a $0.01 disposable email detection API on Cloudflare Workers"
- r/webdev (2M members): "How we filter 30% of signups that are bots in 50ms with a single API call"
- r/node (300k members): "Disposable email detection in Node.js: a tutorial with 4 approaches"
- r/CloudFlare (50k members): "Serverless disposable email detection on Cloudflare Workers + KV"
- r/Supabase (50k members): "Supabase Auth signup validation: a working Postgres trigger pattern"

Each post: a self-contained tutorial or comparison, with the SignupDoggy
link as a "for those who want it managed" footnote.

## Priority 12: Backlink monitoring

**Owner:** Founder
**Why:** Backlinks are the #1 ranking factor. Monitor new ones weekly.

Free tools:
- https://ahrefs.com/free-backlink-checker (signup for free account)
- https://www.openlinkprofiler.org (free, no signup)
- Google Search Console → Links

Track in a spreadsheet:
- Date
- Source URL
- Anchor text
- Follow/nofollow
- Domain Authority (estimated)

Goal: 5-10 new backlinks per week for the first 6 months.

## Priority 13: Social media profiles

**Owner:** Founder
**Why:** Branded search results (Jeffrin James, SignupDoggy) need a
presence on every social platform.

Create profiles with consistent bio:
- Twitter: @signupdoggy
- LinkedIn: company page + founder page
- GitHub: organization
- Crunchbase: company
- Indie Hackers: profile
- Dev.to: profile
- Hashnode: profile
- Medium: publication
- Substack: optional newsletter
- YouTube: optional product walkthrough channel

Each profile: link to /, use the same tagline and avatar.

## Priority 14: Long-term content cadence

**Owner:** Founder
**Why:** Google rewards freshness. New content = new crawl = new
opportunity to rank.

Publish 1-2 blog posts per month targeting specific keywords:
- "Best free [X] for [Y] in 2026" (comparison intent)
- "How to [X] in [language]" (tutorial intent)
- "[Brand A] vs [Brand B]" (comparison intent)
- "What is [X]? A 2026 guide" (definitional intent)

Topics to cover in the next 6 months:
1. "How to detect residential proxy traffic at signup"
2. "Disposable email list comparison: 2026 edition"
3. "Stripe Radar vs SignupDoggy: when to use which"
4. "How to validate phone numbers at signup"
5. "Free email list verification APIs (and why you should skip them)"
6. "The 5 cheapest fraud detection APIs in 2026"
7. "Why your email list is 30% dead (and what to do about it)"
8. "How to stop bots with Cloudflare Turnstile + a fraud API"
9. "Captcha alternatives: the 2026 roundup"
10. "How I built a fraud detection API on Cloudflare Workers"

## Priority 15: When to expect results

Realistic timeline for a brand-new domain:

- Week 1-2: Googlebot discovers the site via the sitemap submission
- Week 2-4: First pages start to appear in the index (very low rank)
- Month 2-3: Brand-name searches ("SignupDoggy") return the site
- Month 3-6: Long-tail keywords ("disposable email checker API", "fraud API indie hacker") start ranking on page 2-3
- Month 6-12: With consistent content + backlinks, page 1 rankings on specific keywords
- Year 2+: Domain authority compounds. Rankings accelerate.

The site is now in a position to start this timeline. The 15 blog posts,
4 comparison pages, 3 use-case pages, 1 integrations page, and 1 changelog
give Google 25 high-quality, content-rich pages to index.

The external actions above (Product Hunt, Indie Hackers, Hacker News, Dev.to,
Reddit, directories) provide the backlinks that turn good content into
rankings.

## What to do when Google indexes the first page

When Google Search Console shows the first page as "Indexed":
1. Check the rich results: https://search.google.com/test/rich-results
2. Verify the structured data is valid
3. Check the SERP snippet for the page
4. Look for the FAQ section in the snippet
5. Submit more URLs to index

When the first keyword starts ranking (even on page 5):
1. Look at the SERP for that keyword
2. Identify the top 3 ranking pages
3. Analyze why they rank (backlinks, content length, freshness, schema)
4. Make your page better on those dimensions

When a page hits page 1:
1. Don't change anything
2. Add more internal links pointing at it
3. Get more backlinks to it
4. Update it with fresh content quarterly

## Tracking

Set up a weekly check of:
- Google Search Console → Performance → top queries
- Google Search Console → Coverage → indexed pages
- Bing Webmaster Tools → Page Traffic
- A rank tracker (free: SERPWatcher, Mangools, or even manual incognito
  Google searches)

Goal for the first 90 days:
- 10+ pages indexed
- 5+ keywords ranking in top 100
- 2+ keywords ranking in top 20
- 50+ organic impressions per day
- 5+ organic clicks per day
