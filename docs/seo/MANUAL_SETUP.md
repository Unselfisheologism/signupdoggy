# Manual Setup — Google Search Console + Bing Webmaster Tools

> Google and Bing both require interactive site ownership verification.
> There's no automated way around this — you have to log into the dashboard
> and click "Verify". After verification, the sitemap ping happens
> automatically.
>
> **Time required: 15 minutes.** This is the single most important SEO
> action you can take this week.

---

## Google Search Console (DA 100, mandatory)

### Step 1 — Verify the site

1. Go to https://search.google.com/search-console/welcome
2. Select "URL prefix" → enter `https://signupdoggy.pages.dev`
3. Verification method: **HTML tag**
4. Google will give you a `<meta name="google-site-verification" content="...">` tag
5. The codebase already has a verification stub at `app/public/google025641382a654cfe.html` (HTML file method), but the meta-tag method is more reliable. Add the tag to `app/index.html`:
   ```html
   <meta name="google-site-verification" content="<paste-your-tag-here>" />
   ```
6. Commit + push → Cloudflare Pages deploys → GSC verifies automatically
7. Alternative: use the `google025641382a654cfe.html` file method if you prefer DNS-free setup

### Step 2 — Submit the sitemap

1. In GSC, go to Sitemaps (left nav)
2. Enter `https://signupdoggy.pages.dev/sitemap.xml`
3. Click "Submit"
4. Status should change to "Success" within minutes
5. Google will start crawling — expect first results in 3-7 days

### Step 3 — Request indexing for top pages

For the 5 highest-priority pages, use "URL Inspection" → "Request Indexing":
- https://signupdoggy.pages.dev/
- https://signupdoggy.pages.dev/disposable-checker/
- https://signupdoggy.pages.dev/pricing/
- https://signupdoggy.pages.dev/blog/best-free-disposable-email-checker-api-2026/
- https://signupdoggy.pages.dev/alternatives/ipqualityscore/

This forces Google to crawl those URLs within 24 hours instead of waiting for organic discovery.

### Step 4 — Monitor indexation

After 7 days, check GSC → Pages → "Why pages aren't indexed":
- "Discovered - currently not indexed" → wait, Google will get to them
- "Crawled - currently not indexed" → low quality signal, improve content
- "Duplicate without user-selected canonical" → check canonical tags
- "Blocked by robots.txt" → fix robots.txt

---

## Bing Webmaster Tools (DA 95, fast indexation)

### Step 1 — Verify the site

1. Go to https://www.bing.com/webmasters
2. Sign in (Microsoft account)
3. "Add a site" → enter `https://signupdoggy.pages.dev`
4. Verification options (any one):
   - **CNAME** (best): add `bing-site-verification` CNAME via Cloudflare DNS
   - **Meta tag**: paste into `app/index.html`
   - **XML file**: upload `BingSiteAuth.xml` to `app/public/`

### Step 2 — Submit sitemap

1. In BWT, go to Sitemaps
2. Enter `https://signupdoggy.pages.dev/sitemap.xml`
3. Submit

### Step 3 — Use IndexNow (Bing's API)

IndexNow is already wired up via `.github/workflows/indexnow.yml`. Once the key validates (24-48h after first submission), every deploy automatically pings Bing + DuckDuckGo + Yahoo + Yandex + Naver.

To check key validation status:
```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"signupdoggy.pages.dev","key":"e8d8e6e443e74ec4a2ee53d952f0a147","keyLocation":"https://signupdoggy.pages.dev/e8d8e6e443e74ec4a2ee53d952f0a147.txt","urlList":["https://signupdoggy.pages.dev/"]}'
```

If status = 200, key is validated. If 403, wait 24h and retry.

### Step 4 — Monitor

BWT typically indexes 5-10x faster than Google. Expect first pages in 1-3 days.

---

## Other search engines (low priority but quick wins)

### Yandex Webmaster
- https://webmaster.yandex.com/
- Verification: meta tag or HTML file
- Worth 5 minutes — Yandex powers a chunk of Russian-speaking SaaS devs

### DuckDuckGo
- No separate submission. Powered by Bing. IndexNow covers it.

### Brave Search
- https://search.brave.com/search?q=site%3Asignupdoggy.pages.dev (manual check)
- No formal submission; follows Bing indirectly

### Applebot (Siri web search)
- User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15
- Already allowed in robots.txt

---

## Daily monitoring

After both are set up:

1. **GSC** → Performance → check "Queries" tab weekly for new keywords
2. **GSC** → Pages → check "Why pages aren't indexed" for blockers
3. **BWT** → Reports → check crawl stats
4. **GitHub Actions** → daily-seo-check → runs every day, results in `docs/seo/INDEXATION_REPORT.md`

---

## Expected timeline

| Day | What happens |
|---|---|
| 1 | You verify site in GSC + BWT. Sitemap submitted. |
| 2-3 | IndexNow key validates. Bing starts crawling. |
| 3-5 | Bing indexes 20-40 pages. |
| 5-7 | Google indexes first 5-10 pages. |
| 7-14 | Google indexes 30-45 pages. Long-tail queries start appearing in GSC. |
| 14-30 | "Disposable email checker" type queries start ranking page 2-3. |
| 30-60 | With backlinks from dev.to + Product Hunt, page 1 for long-tail. |
| 60-90 | With continuous content + backlinks, page 1 for medium-competition terms. |

The site WILL rank. The variables are (a) how fast you do the GSC + BWT setup, and (b) how many backlinks you push from `docs/seo/EXTERNAL_LINKS.md`.