# SignupDoggy — External SEO Distribution Playbook

> This is the single source of truth for what to post, where, and when.
> Every action below creates a backlink to signupdoggy.pages.dev — the
> single biggest factor in Google ranking.
>
> **Status legend**: `[ ]` = not done, `[X]` = done, `[~]` = in progress.

---

## 🎯 High-DA backlink targets (DA 60+)

### Product Hunt — DA 91
- **Status**: [ ]
- **URL**: https://www.producthunt.com/posts/new
- **Asset**: `content/producthunt-launch.md`
- **CTA**: post on Tuesday-Thursday 12:01 AM PST for max visibility

### Hacker News (Show HN) — DA 90
- **Status**: [ ]
- **URL**: https://news.ycombinator.com/submit
- **Asset**: `content/show-hn.md`
- **CTA**: post Tuesday-Thursday 8-10 AM EST

### IndieHackers.com — DA 75
- **Status**: [ ]
- **URL**: https://www.indiehackers.com/post/new
- **Asset**: `content/indiehackers-post.md`
- **CTA**: tag with #indiehackers, #saas, #api

### BetaList — DA 68
- **Status**: [ ]
- **URL**: https://betalist.com/submit
- **Asset**: short pitch only — name + tagline + link

### Reddit (r/SaaS, r/IndieHackers, r/SideProject, r/startups) — DA 95
- **Status**: [ ]
- **Asset**: `content/reddit-posts.md`
- **CTA**: post in 4 subreddits over 2 weeks. Don't spam — provide value first.

### GitHub Awesome Lists — DA 70+
- **Status**: [ ]
- **Target lists**:
  - https://github.com/dzharii/awesome-elasticsearch (no, wrong niche)
  - https://github.com/sindresorhus/awesome (general)
  - https://github.com/awesome-selfhosted/awesome-selfhosted (no, hosted)
  - https://github.com/topics/fraud-detection (search GitHub for related awesome lists)
- **Asset**: short PR description + URL

---

## 🛠️ SaaS directories (DA 30-60, fast wins)

### AlternativeTo — DA 65
- **Status**: [ ]
- **URL**: https://alternativeto.net/submit
- **Asset**: name + tagline + category + alternative-to list (link to /alternatives)
- **Best fit**: IPQualityScore alternative, MaxMind alternative, Sift alternative, Cloudflare Turnstile alternative

### SaaSHub — DA 55
- **Status**: [ ]
- **URL**: https://www.saashub.com/startup-submit
- **Asset**: same as AlternativeTo

### StackShare — DA 60
- **Status**: [ ]
- **URL**: https://stackshare.io/submit-a-tool
- **Asset**: stack info (Cloudflare Workers + Hono + Supabase + React)

### G2 — DA 90
- **Status**: [ ]
- **URL**: https://www.g2.com/products/new
- **Asset**: long-form product profile + screenshots

### Capterra — DA 80
- **Status**: [ ]
- **URL**: https://www.capterra.com/vendors/sign-up
- **Asset**: same as G2

### GetApp — DA 75
- **Status**: [ ]
- **URL**: https://www.getapp.com/submit-an-app/
- **Asset**: same as G2

### ProductHunt "Ship" page (separate from launch) — DA 91
- **Status**: [ ]
- **URL**: https://www.producthunt.com/ship
- **Asset**: changelog post for any feature update

---

## ✍️ Cross-post content (DA 50-80 publishing platforms)

### dev.to — DA 80
- **Status**: [ ]
- **Asset**: `content/dev-to-posts.md`
- **Strategy**: cross-post the top 3 blog posts (disposable email checker, fraud API comparison, VPN detection)
- **Canonical**: ALWAYS set canonical URL to signupdoggy.pages.dev/blog/<slug> to avoid duplicate content

### Hashnode — DA 70
- **Status**: [ ]
- **Asset**: same as dev.to
- **Canonical**: signupdoggy.pages.dev/blog/<slug>

### Medium — DA 95
- **Status**: [ ]
- **Asset**: same content
- **Canonical**: signupdoggy.pages.dev/blog/<slug>

---

## 🤝 Community / dev community (DA 40-70)

### Hashnode Q&A / dev.to comments / Reddit comments
- **Status**: [ ]
- **Asset**: `content/community-answers.md`
- **Strategy**: find StackOverflow / Reddit questions about fraud detection / disposable email API, provide real answer with signupdoggy link

### Stack Overflow — DA 88
- **Status**: [ ]
- **URL**: https://stackoverflow.com/
- **Asset**: write 5 canonical answers to questions like:
  - "How do I detect disposable email addresses?"
  - "What's the cheapest fraud API for indie hackers?"
  - "How to block bot signups without CAPTCHA?"
- Each answer cites signupdoggy with a code example.

### IndieHackers podcast/interview — DA 70
- **Status**: [ ]
- **URL**: https://www.indiehackers.com/podcast
- **Asset**: pitch email to host about the solo-founder story

---

## 📰 Press / media (DA 60-95)

### HackerNoon — DA 80
- **Status**: [ ]
- **URL**: https://hackernoon.com/submit-story
- **Asset**: "How I built a $0.01/call fraud API as a solo founder" story

### freeCodeCamp — DA 90
- **Status**: [ ]
- **URL**: https://www.freecodecamp.org/news/submit/
- **Asset**: technical tutorial (the disposable email Node.js tutorial is a good fit)

### Daily Dev — DA 60
- **Status**: [ ]
- **URL**: https://daily.dev/submit
- **Asset**: pick a top blog post and tag #api #saas #indie

### Console — DA 50
- **Status**: [ ]
- **URL**: https://console.substack.com/submit
- **Asset**: long-form essay on signup quality + indie SaaS

---

## ⏱ Cadence

| Week | Actions | Expected DA gain |
|---|---|---|
| 1 | ProductHunt, HackerNews, IndieHackers post | +30 |
| 2 | 5 directory submissions (AlternativeTo, SaaSHub, etc.) | +15 |
| 3 | Cross-post 3 blog posts (dev.to, Hashnode, Medium) | +20 |
| 4 | 5 StackOverflow answers + Reddit engagement | +10 |
| 5 | HackerNoon + freeCodeCamp + press | +25 |

**Total expected DA gain**: 0 → 30+ in 5 weeks.

---

## 🔍 Tracking

- Monitor: https://search.google.com/search-console (manual setup required)
- Track: `site:signupdoggy.pages.dev` in Google (run weekly)
- Rank tracker: Ubersuggest or SE Ranking (free tier, manual)
- Backlink check: https://ahrefs.com/backlink-checker (free)

---

## 🚨 Critical rules

1. **NEVER use the same boilerplate text twice** — Google de-duplicates link networks.
2. **Set canonical URL on every cross-post** to signupdoggy.pages.dev/blog/<slug>.
3. **Space out posts** — no more than 3 backlinks per day. Don't trigger spam filters.
4. **Vary anchor text** — "SignupDoggy", "this API", "fraud detection API", "indie alternative", etc.
5. **Add real value to every post** — don't just drop a link and run.
6. **Engage with comments** on every post for at least 48 hours after publishing.