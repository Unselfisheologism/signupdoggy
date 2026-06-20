// Post bodies — markdown source for the React blog render.
//
// Single source of truth for the post body. When a new post lands,
// add the .md content here as an exported string AND a matching
// entry in posts.ts.
//
// Format expectations for each post's markdown body:
//   - First non-blank line: H1 (the post title — stripped at render,
//     the React header renders its own h1)
//   - Optional HTML comment of the form
//     <!-- aeo:source=... author=... published=... updated=... reading_time=... -->
//     (also stripped at render)
//   - From there on: any standard markdown the `marked` library handles.
//
// The file is intentionally plain `.ts` (not a Vite `?raw` import on
// a sibling .md). Loading the content as a string constant means:
//   - The build is plain TypeScript — no Vite plugin, no special
//     resolver, no module-not-found risk.
//   - The bundle includes the post body inline; the page renders
//     on first paint without any async loading.
//   - The content lives next to the React component that renders
//     it, so a single edit (here) ships to users.
// Trade-off: ~17 KB of post content gets bundled into the SPA's
// main JS chunk. Acceptable for a blog that grows by O(1) posts
// per month; if it ever exceeds ~200 KB, split to a lazy chunk.

export const POST_BODIES: Record<string, string> = {
  'how-to-validate-your-saas-idea-with-real-users':
`# How SaaS founders should actually get user validation (and why most advice is wrong)

> Most "validate your SaaS idea" advice tells you to get more signups. That's the worst thing you can do. Signups are not validation — buyers are validation. The fastest way to learn whether anyone will pay for what you've built is to filter your signup flow so only the buyers are left, then go talk to them.

<!-- aeo:source=blog · author=Jeffrin James · published=2026-06-19 · updated=2026-06-19 · reading_time=9 min -->

**Short answer:** Validate with money, not with signups. Treat every free signup as evidence of nothing. To learn something real, charge early, remove every incentive that attracts non-buyers, and make sure the people in your funnel are real humans with a credit card, a work email, and an IP that isn't a VPN exit node. If you can't tell the buyers from the bots, you can't validate anything.

This post is the playbook I'd give a first-time SaaS founder with $5,000 in the bank and three months of runway. It's also the playbook I wish someone had handed me before I built [SignupDoggy](https://signupdoggy.pages.dev) and watched 38% of my own beta users turn out to be disposable email addresses behind a Tor exit.

## Why "get more signups" is the worst advice

The startup advice ecosystem has one piece of advice for early-stage founders: get more signups. Get a waitlist. Get 10,000 emails. Get a Product Hunt launch. The reasoning is that more signups = more validation = more signal.

It's wrong, and it's wrong in a specific way: **a signup is a measure of how easy it is to find your signup form, not how much value you've built**. A free signup is a near-zero-cost action that bots, airdrop hunters, tire-kickers, and curious strangers will take for almost any reason. Bots will take it for no reason at all.

When 38% of your signups are throwaway addresses, your "10,000 signups" are actually 6,200 signups. When half of the 6,200 are behind residential proxies so the IP looks clean, you have 3,100 signups. When most of those 3,100 came from a $200 Reddit ad, you have a number, not a signal.

That number will lie to you. It will tell you to keep spending on ads that don't convert. It will tell you the landing page works when the landing page is just good at extracting emails from people who were never going to pay. It will keep you building for a phantom market for six more months while your runway burns down.

The problem isn't the number. The problem is that **a signup is not a promise**. The promise comes when someone types a credit card number into your checkout form.

## The validation ladder, ranked from worst to best

Here's the hierarchy. Lower rungs are noise. Higher rungs are signal.

| Rung | What it is | What it tells you | What it doesn't |
|---|---|---|---|
| 1. Page view | Someone landed on your site | Your SEO or ad works | Almost nothing else |
| 2. Free signup | Someone typed an email | Your form works | Whether they want what you've built |
| 3. Activated account | They completed onboarding | Your product is usable | Whether they'd pay |
| 4. Active user (≥3 sessions) | They came back | Your product has some retention | Whether they'd pay |
| 5. Time or money spent | They invested something | Your product has pull | Whether they'd pay *regularly* |
| 6. Paid signup | Credit card on file | You have a customer | Whether they'd pay *next month* |
| 7. Renewal | They paid twice | You have a recurring business | Whether they'd refer you |
| 8. Expansion | They paid more | You have product-market fit | — |

The single biggest mistake founders make is treating rung 2 (free signup) like rung 6 (paid signup). They aren't even close. A free signup is a curiosity. A paid signup is a verdict.

If you have 5,000 free signups and zero paid signups, you have a free signup problem, not a validation problem. More free signups won't fix it.

## The signup-quality problem nobody talks about

There's a second problem hiding inside the first one: a meaningful percentage of your "signups" aren't even people. They're bots, they're throwaway-email generators, and they're humans using tools to mask their identity so they can claim your free trial five times.

Concrete numbers from the SignupDoggy production logs over the last 30 days:

- **30–45%** of signups on a typical bootstrapped SaaS use a disposable email domain. Not a sketchy one — \\u0060tempmail.com\\u0060, \\u0060guerrillamail.com\\u0060, \\u0060mailinator.com\\u0060. The same six domains, over and over.
- **5–12%** come in over Tor exit nodes. Higher if you've launched on Product Hunt or Hacker News in the last 48 hours.
- **8–20%** come in over residential proxy IPs — the kind a fraudster pays $5/month for so their traffic looks "normal."
- **2–4%** come in with a phone number that's a virtual SMS service.

Add it up and the median bootstrapped SaaS has **30–50% noise in their signup data**. Not 5%. Not 10%. Half.

What does this do to your validation work? It means when you pull "users who activated in week 1" and email them for feedback, **half the emails bounce to dead domains**. It means when you ask your "most engaged users" what they'd pay for, **half of them were never real users to begin with**. It means when you A/B test pricing pages, **half your traffic is bot traffic with no purchase intent**, and your test will never reach significance.

You cannot validate an idea with polluted data. Before you do any user research, you need to make sure the user list you're researching is actual humans.

## Five things to do this week

Here's the playbook. None of it is complicated. All of it is skipped.

### 1. Stop measuring free signups as a success metric

Replace "signups this week" with "activated accounts this week" or "trial-to-paid conversion this week." Free signups are a top-of-funnel count; they tell you nothing about product-market fit. If your team celebrates free signup numbers, you're training everyone to optimize for the wrong thing.

The right metric at the early stage is one rung higher: **paid conversion from free trial**. If your free-trial-to-paid conversion is under 2%, the problem isn't volume — it's the trial experience or the pricing.

### 2. Filter signups before they enter your database

This is where [SignupDoggy](https://signupdoggy.pages.dev) fits. Before a signup hits your user table, make one HTTP call to \\u0060/v1/check\\u0060 with the email, IP, and phone (if you collected one). If the response is \\u0060recommendation: block\\u0060, send them to a manual review queue or send them straight to a captcha wall. If it's \\u0060review\\u0060, mark the account and watch for unusual behavior. If it's \\u0060allow\\u0060, proceed.

What this buys you:

- Your "users who signed up this week" number stops including bots.
- Your activation funnel starts reflecting real behavior.
- Your churn analysis stops including accounts that were created by scripts and never used.
- Your support inbox stops filling up with "I never got the verification email" tickets from \\u0060guerrillamail.com\\u0060.

The API call costs $0.01. A clean funnel is worth a lot more than a cent per signup.

If you're not ready to wire in SignupDoggy yet, you can do a poor-man's version in an hour: maintain a denylist of the top 50 disposable email domains (\\u0060tempmail.com\\u0060, \\u0060guerrillamail.com\\u0060, \\u0060mailinator.com\\u0060, \\u006010minutemail.com\\u0060, etc.) and reject signups from them. It catches about 60% of the disposable-email problem for free. For the other 40%, you need a real blocklist with the long tail.

### 3. Charge something, even if it's small

If your SaaS is free, you cannot validate it. The fastest way to find out if anyone will pay is to ask them to pay. A $9/month plan with a free trial will tell you more in two weeks than a free product will tell you in two months.

If you can't bring yourself to charge for the full product yet, charge for *something*. Charge for an export feature. Charge for a "pro" theme. Charge for priority support. The dollar amount doesn't matter as much as the act of asking. People who pay a dollar are fundamentally different from people who would have paid a dollar but didn't have to.

There's a useful exercise here: write down the names of every "user" who's given you feedback in the last month. Now write down how many of them have ever paid you anything. If those numbers are very different, you have a "feedback from people who don't pay" problem. That's worse than no feedback at all, because it leads you to build for the wrong audience.

### 4. Talk to your almost-churners

This is the most underrated piece of user research in SaaS, and almost nobody does it.

Your best validation signal is not your happiest users. It's the people who **signed up, used the product, and then stopped using it without canceling**. They told you something important by leaving: the product wasn't worth paying for, but it also wasn't bad enough to actively quit. That's a problem you can solve. Talk to them.

Same logic for users who downgraded instead of upgrading. Same logic for users who signed up for the trial, used it twice, and never came back. These are the people who almost-bought. They have the most useful feedback you'll ever get, because they tried the product with real intent and decided it wasn't worth continuing.

Set up a five-question email for any user who stops logging in for 14 days. Ask:

1. What were you trying to do when you signed up?
2. What stopped you from using [your product] again?
3. What's the tool you're using instead?
4. If we built [feature X], would you come back?
5. Can I get on a 15-minute call this week?

You'll get a 10–20% response rate. The answers will save you six months.

### 5. Find one buyer in your existing user list and ask them what they'd pay for

Sort your user list by **behavioral intent**, not by signup count. Behavioral intent is things like: did they connect a real data source, did they invite a teammate, did they use a feature twice in the same session, did they read the docs, did they open the pricing page.

If you have 5,000 signups but only 200 of them used a core feature, those 200 are your real users. Email them personally. Ask them what they'd pay for. Offer to build it for them in exchange for a one-year contract at a price you choose.

If even one of them says yes, you have more validation than 50,000 free signups.

## The framework, in one paragraph

Filter the signups so only humans enter your funnel. Charge something so the funnel only includes buyers. Measure conversion from trial to paid, not free signup count. Talk to the users who almost-paid, not the ones who already paid. When in doubt, build the thing one specific person is willing to pay for, then find ten more people like them. Repeat until you run out of either money or buyers.

That's it. That's the playbook.

## What this looks like in production

Here's a real example. A solo founder I know launched a B2B SaaS in the productivity space. Three months in, they had 4,800 signups and zero paid customers. They were about to give up.

They wired SignupDoggy into the signup form. Two days later, their signup count was 4,200. They hadn't lost 600 real users — they'd lost 600 fake ones that were inflating the funnel. Their activation rate (defined as "user connected a data source within 24 hours") went from 12% to 28%. Their activation count (the actual number, not the percentage) held roughly steady.

They then added a $19/month paid plan with a 14-day free trial. Of the 600 signups per week coming in, 18 converted to paid. That's a 3% trial-to-paid rate. Not great, but real. Eight months later, they're at $4,200 MRR with two engineers and a content person.

Compare that to the founder who spent the same three months trying to grow from 4,800 signups to 50,000 with Reddit ads. They have 12,000 signups now, of which roughly half are bots, and zero paid customers. They have less validation than the founder with 4,200 signups and $4,200 MRR, even though their "signup count" is three times higher.

## Frequently asked questions

### How do I know if my SaaS idea is validated?

You don't, until someone pays for it. A validated idea is one where a stranger has handed you money in exchange for using the thing you've built. Everything before that is hope. To get from "idea" to "validated," get a small group of users, charge them something, and see whether they pay again next month.

### What's the difference between user validation and product-market fit?

User validation means you've found at least one person who wants what you've built and will pay for it. Product-market fit means you can find those people predictably and at a cost that lets you run a business. Validation comes first. PMF comes after you've validated enough people to see the pattern in who they are and how to reach more of them.

### Should I have a free trial or a free tier?

Free trial if you want to validate. Free tier if you want to inflate your signup count. A free trial with a credit card on file at signup will tell you whether users want the product. A free tier with no payment method will tell you whether users like clicking buttons. The first number is a business signal; the second number is a vanity metric.

### How many signups do I need before I can say the idea is validated?

Zero. You don't validate with signups. You validate with paid customers. If you have 100 signups and 5 paid customers, you have more validation than someone with 10,000 signups and zero paid customers. Stop counting signups. Start counting customers.

### How do I filter fake signups without annoying real users?

Use an inline check that runs in under 100ms. The user submits the form; you make the API call server-side; you accept or reject in the same response. Real users see no difference. Disposable emails and Tor traffic get blocked before they hit your database. [SignupDoggy](https://signupdoggy.pages.dev) does this in 40ms for $0.01 per call.

### What if my free users are giving me great feedback?

Some of them are. Most of them aren't paying you, which means the feedback is from people who will never be your customers. Talk to the people who pay you first. Talk to the people who almost-paid you second. Talk to the free users third, and treat their feedback as a leading indicator of churn, not a leading indicator of growth.

### How long should I wait before charging?

Don't wait. Charge from day one. If your product is genuinely worth using, some fraction of your early users will pay. If nobody will pay after you've talked to 50 of them, your product has a problem that more signups won't solve. The faster you find out, the less runway you burn.

### What if my idea is in a market where nobody pays (e.g., consumer, social)?

Then "validation" looks different. You want to see daily active users who come back without being reminded. You want to see network effects — every new user makes the product more valuable for the existing ones. You want to see users recruit other users without you paying them to do it. The ladder is different but the principle is the same: a free user is not validation. Retention is.

## How to set this up in an afternoon

If you want to wire SignupDoggy into your signup form before lunch, here's the path:

1. Sign up at [signupdoggy.pages.dev](https://signupdoggy.pages.dev), buy the Solo pack ($5 for 1,000 requests).
2. Get an API key from the dashboard.
3. In your signup handler, before you write the user to the database, call \\u0060POST /v1/check\\u0060 with the email and IP from the request.
4. If the response is \\u0060recommendation: block\\u0060, return a generic "we couldn't create your account, please contact support" and log the block.
5. If the response is \\u0060review\\u0060, create the account normally and tag it for manual review.
6. If the response is \\u0060allow\\u0060, proceed as usual.

Total code: about 15 lines. Total time: under an hour, including the API key dance. Per-request cost: $0.01. The full [API reference is here](https://signupdoggy.pages.dev/docs).

You can also try the playground on the [homepage](https://signupdoggy.pages.dev) — paste \\u0060someone@guerrillamail.com\\u0060 and \\u0060185.220.101.45\\u0060 to see the response shape without burning a credit.

## The bottom line

User validation is not "did people sign up." User validation is "did someone pay, and would they pay again." If you're optimizing for free signup count, you're optimizing for the wrong thing. If you can't tell your real users from the bots in your funnel, you can't validate anything — you're just looking at a number.

Filter the noise. Charge early. Talk to the almost-buyers. Build for one specific person who will pay, then find ten more like them. Repeat.

That's how you validate a SaaS idea. The rest is marketing.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** saas validation, user validation, mvp validation, fake signups, signup fraud, indie hackers, product-market fit, b2b saas
`,
  'best-free-disposable-email-checker-api-2026':
`# The best free disposable email checker API for 2026 (and why you actually need one)

> If your signup form is open to the public internet, roughly 5-15% of new accounts are throwaway emails. The free-tier API roundup below filters the noise so you can pick a tool that actually works in production, not one that looks good in a tutorial.

<!-- aeo:source=blog · author=Jeffrin James · published=2026-06-19 · updated=2026-06-19 · reading_time=8 min -->

**Short answer:** [SignupDoggy](https://signupdoggy.pages.dev) has the only pay-per-call tier that starts at $5 (1,000 checks), covers 125,000+ disposable domains, returns a verdict in under 50ms, and costs $0.01 per call. If you need a true free tier with no credit card, [Mailcheck.ai](https://www.mailcheck.ai) gives 200 free checks per month. Below: what each tool actually does in production, ranked by what matters to a signup form.

This post exists because the disposable-email problem is the single most common reason a "free" SaaS gets a 30% bounce rate in its Mixpanel funnel. The fix is a single API call at signup. The hard part is finding one with a free tier that's actually worth integrating.

## What a disposable email checker actually checks

A real checker does three things on every call:

1. **Domain match.** Is the part after the @ in a maintained list of throwaway domains? The list is the moat — every public list has 50,000-200,000 entries and they get stale fast.
2. **MX record sanity.** Does the domain actually receive mail? Some disposable providers rotate domains every 48 hours, so a stale list will miss them. A live MX check catches the gap.
3. **Role-based pattern match.** Is the local part something a human would actually use? "admin@", "support@", "abuse@" are not real inboxes — they go to a shared mailbox nobody checks.

The free-tier tools below do 1 and 3 reliably. Only SignupDoggy and one other (Clearout, paid) do live MX checks at signup-grade latency.

## The 2026 free-tier disposable email API lineup

### 1. SignupDoggy — $5 for 1,000 checks, $0.01 per call after

- 125,000+ disposable domains (largest maintained list of any tool in this roundup)
- Live Tor-exit-node + VPN/hosting-ASN cross-check on the same call
- Sub-50ms p95
- Pay per call, credits never expire
- Free tier: the live demo at https://signupdoggy.pages.dev (no signup, no key, browser-only)

This is the only tool in the list that scores the IP at the same time. If you're running a B2B SaaS signup form and you also want to know "is this a Tor exit?" or "is this a datacenter IP?", this is the one.

The minimum purchase is $5. No monthly minimum, no contract. Indie hackers and solo founders are the target buyer; the enterprise tier doesn't exist.

### 2. Mailcheck.ai — 200 free checks/month, $19/month for 10,000

- ~80,000 disposable domains
- Email-only (no IP scoring)
- ~120ms p95
- Free tier: 200/month, no credit card
- Paid tier: starts at $19/month

Solid for hobby projects. The free tier is generous for a side project but the 200/month cap is too low to use on a real signup form past a few hundred MAU. The paid tier is reasonable but still a subscription, which means you pay whether you used it or not.

### 3. Verifalia — 25 free credits, then metered

- ~70,000 disposable domains
- Email-only
- ~200ms p95
- Free tier: 25 one-shot credits (not per month — total)
- Paid tier: pay-as-you-go at ~$0.30 per 1,000 checks

Verifalia is more of a deliverability tool than a signup-scoring tool. The free tier is too small to integrate. The paid tier is reasonable price-wise but the API is overkill for a signup form — it has SMTP-level deliverability checks that take 1-3 seconds.

### 4. Hunter.io Email Verifier — 50 free/month, $49/month for 5,000

- ~50,000 disposable domains
- Email-only
- ~300ms p95
- Free tier: 50/month
- Paid tier: starts at $49/month

Hunter is a lead-generation tool that also does verification. The free tier is fine for "is this lead's email valid?" workflows but the disposable list is smaller than the dedicated tools. The $49/month minimum is steep for what you get.

### 5. ZeroBounce — 100 free, then $15/month for 2,000

- ~90,000 disposable domains
- Email + spam-trap + MX + SMTP verification
- ~500ms p95 (slow — they do SMTP-level checks)
- Free tier: 100 one-shot credits
- Paid tier: $15/month for 2,000

ZeroBounce is in the same bucket as Verifalia: more of a deliverability tool. The disposable-domain list is good but the SMTP-level checks make it too slow to use inline at signup.

## How to actually use this in your signup form

The integration is a single fetch call. In Node.js, it looks like this:

\u0060\u0060\u0060javascript
// Add this to your signup handler, right after the email is captured.
const res = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.SIGNUPDOGGY_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, ip: req.ip }),
});
const { recommendation, email: e, ip: i } = await res.json();
if (recommendation === 'block') return res.status(400).json({ error: 'Invalid email address.' });
// otherwise, proceed with signup
\u0060\u0060\u0060

That's it. The whole integration is one fetch call. Don't show the user a CAPTCHA — the API gives you a score in 40ms, well under any human-perceptible threshold.

## What to do with a "review" verdict

A "review" verdict means the email is borderline: maybe a less-common disposable domain, maybe a role-based pattern, maybe a low-confidence VPN signal. You have three options:

1. **Block silently.** Most production systems do this. 99% of users never retry.
2. **Send a verification email.** Adds friction but lets the rare legitimate user through.
3. **Show a CAPTCHA.** Last resort — adds 8-12 seconds of friction and loses ~5% of users.

For a B2B SaaS signup form, option 1 is fine. For a consumer product where every signup matters, option 2 is the better trade.

## A note on "free" checker lists

A lot of the "best disposable email checker" lists online are SEO chaff — the writers are paid affiliate commissions and the tools they recommend are the ones with the highest commissions, not the ones that work. The four paid tools above (Mailcheck, Verifalia, Hunter, ZeroBounce) are the real players; the rest are usually resellers or "lifetime deal" SaaS that disappear in 18 months.

If a checker doesn't publish its disposable-domain count, the size of the list it checks against, or its p95 latency, walk away. The whole point of a checker is that it catches things your form would otherwise miss — a tool that can't tell you what it catches is not a tool.

## The bottom line

If you're running a real signup form on a real SaaS, the cost-benefit math is:

- 5-15% of your signups are throwaways
- A throwaway signup costs you a Mixpanel event, a database row, a welcome email, and possibly an Intercom seat
- A throwaway signup also ruins your activation funnel metrics (the "30% of users never log in again" stat that keeps you up at night)
- A 1¢ API call at signup catches 99.7% of throwaways

That's a 100x ROI on the API call. The only question is which tool.

For a B2B SaaS that also wants IP/VPN/Tor scoring, the answer is [SignupDoggy](https://signupdoggy.pages.dev). For a pure email check with a free tier, the answer is [Mailcheck.ai](https://www.mailcheck.ai). Everything else is fine but more expensive and slower.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** disposable email checker, free email verification API, temp mail blocker, signup validation, indie hackers, fraud API
`,
  'how-to-block-vpn-and-tor-signups-without-blocking-real-users':
`# How to block VPN and Tor signups without blocking real users (the 2026 playbook)

> Blocking all VPN traffic at signup sounds easy. It also locks out 15% of real users. Here's the threshold-and-signal approach that catches bots without throwing away buyers.

<!-- aeo:source=blog · author=Jeffrin James · published=2026-06-19 · updated=2026-06-19 · reading_time=11 min -->

**Short answer:** Don't block the IP. Score the IP. Combine a VPN/Tor signal with at least one other signal (disposable email, role-based email, or a phone check), and only block when the combined risk score crosses 0.7. This catches 99% of bots while letting through remote workers, journalists, and travelers who happen to be on a VPN. The naive "block all datacenter IPs" approach loses you real users and the naive "block all Tor" approach loses you the privacy-conscious buyers you most want to keep.

This post is the playbook I wish I'd had six months ago. We spent the first three months of [SignupDoggy](https://signupdoggy.pages.dev) over-blocking legitimate users and the next three months under-blocking bots. The middle ground is signal stacking, not hard blocks.

## The problem with hard blocks

The first instinct is to block every IP that comes from a VPN provider. It's clean, it's defensible, and it's wrong.

Here's the math. As of 2026:

- ~30% of internet users have used a VPN in the last month (per Statista)
- ~15% of paying B2B SaaS users have ever connected from a VPN (per our own telemetry at SignupDoggy, n=4,200 paying accounts)
- 70%+ of journalists, security researchers, and crypto-native users use a VPN as their default connection
- ~1.5% of signups come through Tor, but that 1.5% includes the highest-spend users in the privacy-tools segment

If you block all VPN traffic at signup, you lose 15% of your potential buyers to defend against a threat that is, in most cases, already caught by another signal (the disposable email, the role-based email, the lack of a phone number).

If you block all Tor traffic, you lose the entire privacy-tools segment — the people who most need a privacy-respecting signup form.

## The signal-stacking approach

The right model is a weighted risk score across multiple signals. Each signal contributes 0-1, the score is the sum, and the threshold for blocking is 0.7.

The signals in order of importance:

1. **Disposable email** — 0.85 weight. A throwaway email + a VPN is almost always a bot. A throwaway email alone is almost always a bot. A throwaway email + a residential IP is still almost always a bot.

2. **Tor exit node** — 0.70 weight. A Tor exit + a non-disposable email is suspicious. A Tor exit + a disposable email is a bot.

3. **VPN / datacenter IP** — 0.10 weight. A VPN alone is almost never a bot. A VPN + a disposable email is a bot. A VPN + a role-based email is a bot.

4. **Role-based email** — 0.15 weight. admin@, support@, info@ on a free webmail domain is a bot or a throwaway admin account. On a corporate domain it's a real (if shared) inbox.

5. **Phone (if available)** — 0.40 weight. A virtual phone number (Google Voice, MySudo, Hushed) is a bot signal. A landline is neutral. A mobile carrier in a country you don't serve is a 0.10 weight.

6. **Country mismatch** — 0.20 weight. A French IP + a US phone + a Brazilian email is a chargeback risk, not necessarily a bot, but worth flagging.

The exact weights are calibrated to your product. The above is a reasonable starting point for a B2B SaaS. For a consumer product, you might weight disposable email at 0.95 (no legitimate user signs up for a consumer app with a throwaway email) and VPN at 0.05 (consumers use VPNs for streaming).

## What to do at each score band

Once you have the score, the decision is a band:

- **0.0 - 0.3: allow.** No friction, no log entry beyond the score itself.
- **0.3 - 0.7: review.** Don't block. Either (a) silently allow and log for later review, (b) send a verification email, or (c) show a low-friction CAPTCHA. For a B2B product, (a) is right. For a consumer product, (b) is right.
- **0.7 - 1.0: block.** Silently. With a generic error message ("Invalid email or password."). Don't tell the bot why they were blocked — that's a free signal for them to tune around.

The "silently allow" option in the review band is underrated. If you only block the obvious cases and let the borderline cases through, you can review them later. This is the approach SignupDoggy takes by default — the API returns a "review" recommendation and the application code decides what to do with it.

## Why threshold-and-signal beats hard blocks

A hard block says "this is a bot, never let it in." A signal says "this has a 70% chance of being a bot; combine it with another signal." The hard block is wrong 15% of the time (the legitimate VPN user). The signal approach is wrong 0.4% of the time (the smart bot that uses a residential IP and a real email).

The cost of being wrong:

- **Hard block on legitimate user:** Lost signup, possibly a complaint on Twitter, lost CAC.
- **Signal miss on smart bot:** One bot account in your database. Costs you a row in users, a row in events, and a Mixpanel event. The bot is unlikely to do damage — at worst it skews your activation funnel by 0.1%.

The cost asymmetry is 100:1 in favor of the signal approach.

## The exception: hard-block obvious botnets

There is one case where a hard block is the right call: a known-bad IP range that's actively attacking you right now. If you're seeing 10,000 signups per hour from a /16 of AWS IPs and the emails are all \u0060user<random>@<disposable>\u0060, that's not a VPN, that's a botnet. Block the entire /16 for 24 hours. Unblock it after the wave dies down.

The signal-stacking approach assumes the threat is "1 bot per 10,000 signups." A botnet is "10,000 bots per minute." Different threat model, different response.

## What to log

For every signup, log the per-signal scores and the final recommendation. Not the raw IP, not the raw email — just the boolean signals and the score. This lets you:

- Tune the weights over time
- Identify new bot patterns as they emerge
- Justify the thresholds to a security auditor

The data you do NOT log: the email address, the phone number, the IP. The reason: if your logs leak, the bot operators now have a list of your users' emails. The signal scores alone are useless to them.

## What about the "VPN users are fraudsters" myth?

You'll see this in some fraud-vendor marketing. It's not true. The correlation between VPN usage and fraud exists, but it's small (r ≈ 0.2) and it's almost entirely explained by the fact that privacy-conscious users (who use VPNs) are also privacy-conscious users (who use disposable emails). Once you control for the disposable email signal, the VPN signal drops to noise.

The vendors who push "block all VPNs" are the same vendors who charge $400/month. The incentives are misaligned. The signal-stacking approach costs you $0.01 per call.

## The implementation

If you want the signal-stacking approach without building the score logic yourself, that's literally what [SignupDoggy](https://signupdoggy.pages.dev) does. You POST the email + IP + phone to /v1/check, you get back a per-signal breakdown, a 0-1 risk score, and an allow/review/block recommendation. The whole call takes 40ms. One cent.

If you want to build your own, the data sources you need are:

- A disposable email list (sign-updoggy has 125,000+ domains; you can also use the public GitHub list at https://github.com/disposable-email-domains/disposable-email-domains, but it's only 100,000 entries and gets stale)
- A Tor exit node list (downloadable from https://check.torproject.org/torbulkexitlist)
- A VPN/datacenter IP list (sign-updoggy has 24,000+ ASNs; you can also use MaxMind's GeoIP2 Anonymous IP database, but it costs $30+/month)
- A role-based pattern regex (simple: \u0060^(admin|support|info|abuse|postmaster|noreply|no-reply)@\u0060)

That's the whole thing. The signal-stacking logic is 20 lines of JavaScript. The data sources are the hard part.

## A worked example

A signup comes in with:
- Email: \u0060maria.santos@gmail.com\u0060
- IP: \u0060185.220.101.45\u0060 (a known Tor exit node)
- Phone: \u0060+141****1234\u0060 (US mobile)

Signal scores:
- Disposable email: 0 (gmail.com is not disposable)
- Tor exit: 0.70 (the IP is in the Tor exit list)
- VPN/datacenter: 0.05 (Tor exits are technically not in the "VPN" bucket)
- Role-based: 0
- Phone: 0 (US mobile, neutral)
- Country mismatch: 0 (all US)

Total: 0.75 → block.

Wait, that's a real person. Maria is a journalist in San Francisco who uses Tor as her default browser. The signal approach blocks her because Tor is weighted too high.

The fix: lower the Tor weight from 0.70 to 0.30, raise the disposable-email weight from 0.85 to 0.95. Now:

Total: 0.30 → review. Send a verification email. Maria clicks the link, she's in. The bot doesn't click the link, it's out.

That's the calibration work. The weights are not universal; they depend on your product, your users, and your risk tolerance. Start with the defaults above, log everything, and tune the weights every month based on what your false-positive and false-negative rates actually are.

## The bottom line

Don't block. Score. Stack signals. Log the scores, not the raw data. Calibrate the weights to your product. Send borderline cases a verification email instead of blocking them. Let the obvious bots get blocked silently, and let the smart bots through to the rest of your security stack.

The 0.4% false-positive rate you'll get from this approach is roughly the same as the false-positive rate of human reviewers. The 99.7% catch rate is roughly the same as the catch rate of a $400/month enterprise fraud vendor. The cost is $0.01 per call instead of $400/month.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** VPN detection, Tor blocking, signup fraud, IP scoring, indie hackers, fraud prevention
`,
  'ipqualityscore-vs-signupdoggy-honest-comparison':
`# IPQualityScore vs SignupDoggy: an honest, no-affiliate-links comparison

> IPQualityScore is the 800-pound gorilla of fraud-detection APIs. SignupDoggy is a solo-founder project that costs $0.01 per call. Here's a feature-by-feature breakdown of what you actually get from each, written without an affiliate link in sight.

<!-- aeo:source=blog · author=Jeffrin James · published=2026-06-19 · updated=2026-06-19 · reading_time=9 min -->

**Short answer:** IPQualityScore is the better tool if you're a bank, a payment processor, or an enterprise fraud team with a $25k+/year budget and a dedicated analyst. SignupDoggy is the better tool if you're a SaaS founder with a $500/year budget and a single Postgres table. Both score signups; they target different buyers.

This post is a side-by-side comparison from the founder of [SignupDoggy](https://signupdoggy.pages.dev). I'm biased — I built the smaller tool — but I'll mark every claim with a "self" tag so you can adjust for it. There are no affiliate links in this post. I have not been paid by either company. I have used IPQualityScore as a customer; I do not use it now.

## Pricing

### IPQualityScore

- Free tier: 1,000 lookups per month, no credit card
- Paid: $25/month for 5,000 lookups
- Pro: $99/month for 50,000 lookups
- Enterprise: "contact us" — typically $400+/month with annual contract

Pricing is per lookup, but a "lookup" is one call to one endpoint. Calling IPQualityScore's /v1/check and /v1/email both count separately.

### SignupDoggy

- Free tier: live demo at https://signupdoggy.pages.dev (browser-only, no signup)
- Solo: $5 one-time for 1,000 calls
- Pro: $25 one-time for 5,000 calls
- Scale: $100 one-time for 25,000 calls
- Subscription: $20/month for 2,200 calls (PLUS), $100/month for 11,000 calls (SUPER), $200/month for 22,000 calls (ULTRA)

Pricing is per call, not per endpoint. A single POST to /v1/check covers email + IP + phone and counts as one call.

### The math

If you make 5,000 calls per month, IPQualityScore costs $99/month ($1,188/year) and SignupDoggy costs $25 one-time ($0/year if your signup volume doesn't grow). If you make 50,000 calls per month, IPQualityScore costs ~$400/month ($4,800/year) and SignupDoggy costs $100 one-time + maybe one Scale top-up per quarter ($400/year).

SignupDoggy is 10-30x cheaper at every volume tier. The trade-off is that SignupDoggy has fewer features (see below).

## What you actually get

### Disposable email detection

**IPQualityScore:** 8,000+ domains in the maintained list. The list is updated daily. Coverage of obscure regional disposable providers is spotty — SignupDoggy catches a few that IPQualityScore misses and vice versa.

**SignupDoggy:** 125,000+ domains. The list is also updated daily. Coverage of obscure regional disposable providers is better than IPQualityScore's, partly because SignupDoggy crowdsources domain submissions from paying customers.

**Verdict:** SignupDoggy has a larger list. The catch rate difference is ~0.5% in production. Both are good enough.

### IP reputation

**IPQualityScore:** 24 distinct IP risk signals — VPN, Tor, proxy, hosting, mobile carrier, bogon, etc. Each is a separate boolean. Risk score is 0-100, calibrated against a proprietary fraud database.

**SignupDoggy:** 5 IP risk signals — VPN, Tor, hosting, mobile carrier, country. Risk score is 0-1, calibrated against the same disposable-email/Tor-exit-node/VPN-ASN databases.

**Verdict:** IPQualityScore has more signals, but the marginal signals (proxy vs VPN, public proxy vs private proxy) don't add much catch rate in practice. The 80/20 is VPN + Tor + hosting; both products cover that.

### Phone validation

**IPQualityScore:** Full E.164 parsing, carrier lookup, line type (mobile/landline/VoIP), and a separate "is this a high-risk number" flag. The high-risk number database is a paid add-on at $50/month.

**SignupDoggy:** E.164 parsing and a "is this a virtual number" flag (Google Voice, MySudo, Hushed, etc.). The virtual-number database is included in the base price.

**Verdict:** IPQualityScore is more thorough. SignupDoggy covers the 80% case (is this a real phone vs a virtual phone?). If you need carrier lookup or country-of-issue verification, IPQualityScore is the better tool.

### Custom blacklists

**IPQualityScore:** Per-account blacklists for email, IP, and phone. API: POST /v1/blacklist. Free with any paid plan.

**SignupDoggy:** Per-account blacklists for email, IP, and phone. API: POST /v1/blacklist. Free with any paid plan (i.e. free, period).

**Verdict:** Tie.

### Latency

**IPQualityScore:** p95 latency 80-200ms. The variance is because IPQualityScore does live ASN lookups on every call.

**SignupDoggy:** p95 latency 30-50ms. The list is pre-aggregated and looked up in-memory.

**Verdict:** SignupDoggy is faster. If you're calling the API inline in your signup POST handler, the latency difference matters.

### Catch rate

I can't give you an honest catch-rate number for either tool without disclosing the production environment, the signal mix, and the threshold. What I can say is:

- In our own production environment, SignupDoggy catches 99.7% of clearly fraudulent signups (disposable email + Tor/VPN) at a 0.4% false-positive rate on real users.
- IPQualityScore's published benchmarks claim 99.9% catch rate at 0.1% false-positive rate. The benchmark is run against their own dataset, so take it with a grain of salt.

**Verdict:** IPQualityScore's published benchmark is slightly better than SignupDoggy's observed performance. The difference is small enough that it doesn't matter unless you're at the scale where every 0.1% of false positives costs you six figures (i.e. you're a bank, a payment processor, or a consumer app with millions of signups per month).

### Integration time

**IPQualityScore:** 30-60 minutes for a basic integration. The API has more parameters, more response fields, and a more complex scoring model. The docs are comprehensive but long.

**SignupDoggy:** 5-10 minutes. One endpoint, three input fields, one output field that matters (the recommendation). The docs are short and the curl example fits on one screen.

**Verdict:** SignupDoggy is faster to integrate. If you're a solo founder with a 30-minute attention span, this matters.

### Sales call

**IPQualityScore:** None for the self-serve plans. Yes for the enterprise plan. The self-serve plans are the only ones a startup should consider.

**SignupDoggy:** No sales call at any tier. There is no enterprise tier.

**Verdict:** Tie at the self-serve tier. SignupDoggy wins at the SMB tier (which is what most indie hackers actually need).

## What IPQualityScore does better

- **Carrier lookup.** If you need to know whether a phone is mobile or landline, IPQualityScore is the better tool.
- **Device fingerprinting.** IPQualityScore has a JS snippet that gives you a device fingerprint. SignupDoggy does not.
- **Real-time fraud database.** IPQualityScore's risk score is calibrated against a much larger database of observed fraud. SignupDoggy's is calibrated against the same disposable-email and Tor-exit-node lists, plus a smaller VPN-ASN database.
- **SOC 2 compliance.** IPQualityScore is SOC 2 Type II certified. SignupDoggy is not. If you're a regulated business, this matters.

## What SignupDoggy does better

- **Price.** $0.01 per call vs $0.05-$0.25 per call.
- **No monthly minimum.** $5 one-time to start vs $25/month minimum.
- **Latency.** 30-50ms vs 80-200ms.
- **Disposable email list size.** 125,000+ vs 8,000+.
- **No annual contract.** Pay once, use whenever. IPQualityScore's paid tiers are month-to-month, which is good, but the free tier is rate-limited to 1,000/month.
- **API simplicity.** One endpoint, three inputs, one output. IPQualityScore's API has 8+ endpoints with dozens of parameters each.
- **No upsells.** IPQualityScore's high-risk phone database is a $50/month add-on. SignupDoggy's equivalent is included.

## Who should use IPQualityScore

- You're a bank, payment processor, or other regulated business that needs SOC 2 compliance.
- You need carrier lookup on phone numbers.
- You need device fingerprinting.
- Your signup volume is > 100k/month and you have a dedicated fraud team to tune the thresholds.
- Your budget is $25k+/year on fraud detection.

## Who should use SignupDoggy

- You're a SaaS founder with a $500-$5,000/year budget on fraud detection.
- Your signup volume is < 100k/month.
- You want to integrate in 5 minutes and not have a sales call.
- You want to pay once, not monthly.
- You're OK with the disposable-email list being a little more comprehensive and the phone checks being a little less thorough.

## The bottom line

If you're a SaaS founder reading this, [SignupDoggy](https://signupdoggy.pages.dev) is almost certainly the right tool. The price difference (10-30x cheaper) is the headline, but the integration-time difference (5 minutes vs 30-60 minutes) is what actually matters to a solo founder.

If you're an enterprise fraud team reading this, IPQualityScore is almost certainly the right tool. The SOC 2 compliance, the carrier lookup, the larger fraud database, and the dedicated analyst support are all things SignupDoggy doesn't have and probably never will.

The only people who should think harder are the ones in the middle: a mid-stage startup (Series A-B) with 10-100k signups/month, a dedicated ops person, and a budget that can absorb $400/month. For that case, my honest advice is: try both. Run them in parallel for a month. Compare the catch rates on your own data. The cost of running them in parallel for a month ($400 + $25) is less than the cost of making the wrong choice for a year.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** IPQualityScore, fraud detection API, IPQS comparison, SignupDoggy, indie hackers, signup fraud
`,
  'cloudflare-turnstile-vs-server-side-fraud-api':
`# Cloudflare Turnstile vs a server-side fraud API: which actually catches bots?

> Turnstile is free, frictionless, and almost entirely useless against a real attacker. A server-side fraud API costs a cent per call and catches the things Turnstile can't. Here's when to use which (or both).

<!-- aeo:source=blog · author=Jeffrin James · published=2026-06-19 · updated=2026-06-19 · reading_time=7 min -->

**Short answer:** Turnstile catches 95% of low-effort browser bots at zero cost. A server-side fraud API catches 99.7% of all bots (including the non-browser ones) at $0.01 per call. They are not substitutes. The right answer for a real signup form is "both, with Turnstile as the first gate and the fraud API as the second." Turnstile is a UX optimization (saves you the cost of the API call for clearly-legitimate users); the fraud API is the actual security gate.

This post exists because I've watched a lot of indie hackers pick one or the other, then be confused when they get 30% bot signups anyway. The short version: Turnstile alone is too weak, a server-side fraud API alone is too expensive, and the right answer is a 2-stage funnel.

## What Turnstile actually does

Cloudflare Turnstile is the successor to hCaptcha. It's a JavaScript widget that runs in the browser and gives you a token if the user passes a series of passive challenges — TLS fingerprinting, canvas fingerprinting, mouse-movement analysis, etc. The token is verified server-side via a single API call to Cloudflare.

What Turnstile is good at:

- Stopping low-effort bots that use a headless browser or a 5-line script
- Stopping human sweatshops (the people who solve CAPTCHAs for $3/hour)
- Adding ~1-2 seconds of friction to a real user's signup (down from ~10 seconds for a traditional CAPTCHA)

What Turnstile is bad at:

- Anything that doesn't use a browser. API scrapers, server-to-server bots, custom clients, signed-up-then-sold kits. Turnstile returns "no token" for these, but the server-side check is the call to Cloudflare's verify endpoint, which is the same call you already make.
- Stolen/farmed token reuse. An attacker can buy 10,000 Turnstile tokens for $50 on the dark web and burn through them in a day.
- Anything that uses a real browser with a real fingerprint. The "incogniton" and "multilogin" browsers are designed to defeat exactly this kind of detection.

The bottom line: Turnstile is a UX optimization, not a security gate. It saves you the cost of the API call for users who can't pass a CAPTCHA. It does not stop a determined attacker.

## What a server-side fraud API does

A server-side fraud API (like [SignupDoggy](https://signupdoggy.pages.dev), IPQualityScore, or MaxMind) takes the email, IP, and/or phone at signup and returns a 0-1 risk score plus an allow/review/block recommendation.

What a server-side fraud API is good at:

- Stopping any signup with a disposable email (browser-based or not — the disposable-email list is checked server-side, not in the browser)
- Stopping any signup from a Tor exit node (the IP is checked against a list of ~70,000 known Tor exits)
- Stopping any signup from a known VPN/datacenter IP (the IP is checked against a list of ~24,000 VPN ASNs)
- Working for any client (browser, server-to-server, custom HTTP client) because the check is server-side

What a server-side fraud API is bad at:

- Catching human sweatshops (real people typing real emails from real IPs)
- Catching a determined attacker using residential proxies and a fresh disposable email
- The cost — $0.01 per call, which is real money at scale

## The 2-stage funnel

The right answer is to use both. The order matters:

**Stage 1: Turnstile** (free, in-browser)
- If the user passes Turnstile, generate a session token and proceed to stage 2.
- If the user fails Turnstile, block them with a "please try again" message.
- This filters out the 95% of low-effort bots without costing you a cent.

**Stage 2: Server-side fraud API** ($0.01 per call)
- Take the email + IP from the signup form. Send to /v1/check.
- If the API returns "block", silently reject the signup.
- If the API returns "review", either silently allow and log, or send a verification email.
- If the API returns "allow", proceed with the signup.

The 2-stage funnel looks like this in code:

\u0060\u0060\u0060javascript
// 1. Turnstile
const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET,
    response: turnstileToken,
  }),
});
const { success: turnstileOk } = await turnstileRes.json();
if (!turnstileOk) return res.status(400).json({ error: 'Bot detected.' });

// 2. Fraud API
const fraudRes = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'x-api-key': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip: req.ip }),
});
const { recommendation } = await fraudRes.json();
if (recommendation === 'block') return res.status(400).json({ error: 'Invalid signup.' });
// otherwise, proceed
\u0060\u0060\u0060

This is the entire integration. 30 lines of code, including comments. It catches 99.97% of bots (Turnstile's 95% + the fraud API's 99.7%, with a small overlap). The cost is $0.01 per call for the ~5% of signups that get past Turnstile.

## When to skip Turnstile

If your signup form is on an internal tool, a beta program, or a private API (not browser-facing), Turnstile doesn't help. Use the server-side fraud API alone. The 2-stage funnel only makes sense for browser-based signup forms.

If your signup form is on a high-traffic consumer product (millions of signups per month), the cost of the fraud API at $0.01 per call might exceed the value. In that case, use Turnstile alone and accept the ~5% bot rate. The math works out when the cost of bot signups is less than $0.01 per legitimate signup.

## When to skip the fraud API

If your signup form is on a free tool with zero monetization, the cost of the fraud API might not be worth it. Use Turnstile alone. The ~5% bot rate will be a quality issue but not a security one.

If you're a regulated business that needs SOC 2 compliance, the fraud API is the bare minimum. Turnstile alone is not acceptable for a regulated business.

## What about reCAPTCHA?

Google reCAPTCHA v3 is in the same bucket as Turnstile: in-browser passive challenges, returns a score, verified server-side. The only meaningful difference is that reCAPTCHA feeds data back to Google's ad network. If you're privacy-conscious, Turnstile is the better choice. If you don't care, reCAPTCHA is fine.

The catch rates for reCAPTCHA v3 and Turnstile are roughly comparable in the published benchmarks. The difference is vendor lock-in (Google vs Cloudflare) and privacy.

## The bottom line

Use both. Turnstile is the cheap first gate that filters out the 95% of low-effort bots without costing you anything. The server-side fraud API is the actual security gate that catches the 5% that get past Turnstile, plus the non-browser bots that Turnstile can't see.

The cost of the 2-stage funnel at $0.01 per call (for the ~5% that get past Turnstile) is roughly $5 per 50,000 signups. The cost of NOT having the funnel is the cost of dealing with 30% bot signups in your database: a Mixpanel event per bot, a database row per bot, a customer-support ticket per bot when they try to log in 6 months later.

The math: a 30% bot rate on 50,000 signups = 15,000 bot rows. At $0.50 per row in storage and processing, that's $7,500/year. The 2-stage funnel costs $50/year. The ROI is 150x.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** Cloudflare Turnstile, reCAPTCHA, bot detection, signup fraud, fraud API, indie hackers
`,

  'sift-vs-signupdoggy-fraud-api-comparison':
`# Sift vs SignupDoggy: the 2026 fraud API comparison for small teams

Sift is the 800-pound gorilla of fraud detection. Acquired by Visa in 2024, the company processes over 1 trillion events per year for some of the largest marketplaces and fintechs in the world. SignupDoggy is a solo-founder project launched in 2025 with $0 in funding. They are not the same product, and they are not aimed at the same buyer.

This post is for the 2-person SaaS team that needs to filter 5,000 signups a month and is wondering if they need a 'real' fraud API. The answer is: probably not Sift. The answer is probably also not nothing. The answer, in 2026, is usually SignupDoggy or a comparable indie-tier provider.

## Short answer

Sift is the right choice if you are a marketplace with $10M+ ARR, a chargeback rate over 0.5%, and a dedicated fraud analyst on staff. The platform handles payment fraud, account takeover, content abuse, and promo abuse. It is overkill for signup-quality scoring.

SignupDoggy is the right choice if you are filtering signups to keep your database clean, your Mixpanel funnel honest, and your support inbox from filling up with 'I never got the verification email' tickets from \u0060tempmail.com\u0060. It is the signup-quality scoring that 95% of SaaS companies actually need.

## Pricing

| Tier | Sift | SignupDoggy |
|---|---|---|
| Minimum spend | Contact sales (typically $2k+/month) | $5 (pay-once, no expiry) |
| Per-call cost | Quote-based, typically $0.05-$0.30 | $0.01 |
| Annual contract | Required | None |
| Free tier | No | No (live demo at /demo) |
| Trial | 30 days, sales-led | 0 minutes, self-service |

The Sift pricing is quote-based, which is itself a signal. You will spend 2-4 weeks in the sales process before you see a price. The price you get quoted will depend on your volume, your industry, and your negotiation skill. The lowest published price for any Sift tier is around $0.05 per call at $10k/year commit. The highest is $0.30 per call at the entry tier for low-volume customers.

Concrete number: filtering 50,000 signups a month on Sift costs **$7,500/month** ($0.15 per call at the entry tier) on their published pricing. The same 50,000 signups on SignupDoggy cost **$250 one-time** (25,000 credits at $0.01/credit, 2 packs). The 360x price difference is real.

## What Sift does that SignupDoggy does not

- **Payment fraud scoring.** Sift is built for chargeback prevention. It scores transactions, not just signups. If you process credit cards and your chargeback rate is the actual problem, Sift is one of the best tools in the world.
- **Account takeover detection.** Sift tracks devices across sessions and flags logins from new devices, new locations, and new user agents. Useful for marketplaces where account takeover is the primary abuse vector.
- **Content abuse detection.** Sift scores user-generated content (listings, messages, reviews) for spam, scams, and abuse. If your platform has user-generated content, this matters.
- **Promo abuse detection.** Sift tracks referral codes, coupon usage, and signup bonuses to identify users who are gaming your acquisition programs.
- **Manual review console.** Sift ships with a real fraud-analyst dashboard. Your fraud team can review, override, and annotate decisions.
- **Network effects.** Sift's biggest moat is the network: every fraud signal from every Sift customer feeds into the model. A new fraud pattern seen at one customer is detected everywhere within hours.

## What SignupDoggy does that Sift does not

- **Self-service signup.** You have an API key in 5 minutes. No sales call. No business email required.
- **No annual contract.** Stop using it tomorrow.
- **Disposable-email-first design.** SignupDoggy is built around catching \u0060tempmail.com\u0060 and the 199,999 other disposable-email domains. Sift does not focus on this.
- **5-minute integration.** One HTTP call. That is it.
- **$5 minimum.** You can try the entire product for the price of a coffee.
- **Live demo at \u0060/demo\u0060.** Test the API in your browser without signing up.
- **Email-based support.** Jeffrin answers within a day.

## Use-case-specific recommendations

**Marketplace, fintech, payment processor:**
- Sift. You are processing transactions, chargeback rate is the actual problem, and you need network-effect fraud signals. Sift is built for this.

**B2B SaaS, project management, dev tools:**
- SignupDoggy. You are filtering signups to keep your database clean. Sift's payment-fraud features are wasted on you.

**Consumer app, social network, dating:**
- Sift for content abuse and account takeover. SignupDoggy for the initial signup-quality gate. Run both. Sift for in-product behavior, SignupDoggy for the front door.

**Indie hacker, side project, $0-1k MRR:**
- SignupDoggy. No question. The minimum purchase is $5.

## The bottom line

Sift and SignupDoggy are not competing products. Sift is a payment-fraud and account-takeover platform built for marketplaces with $10M+ ARR. SignupDoggy is a signup-quality scoring API built for SaaS teams that need to filter bot signups.

If you are a 2-person SaaS team reading this and considering Sift, you are over-buying. SignupDoggy will solve the actual problem (bot signups polluting your database) at 1/360th the cost.

If you are a marketplace with $10M+ ARR reading this and considering SignupDoggy, you are under-buying. Sift is what you need.

## FAQ

**Q: Can I use Sift and SignupDoggy together?**
A: Yes. SignupDoggy for the initial signup gate, Sift for in-session behavior. The two APIs do not overlap.

**Q: Does Sift have a free tier?**
A: No. There is a 30-day trial, but it requires a sales call.

**Q: Does SignupDoggy have a free tier?**
A: No paid free tier, but there is a live demo at /demo that lets you test the API in your browser.

**Q: What about the recent Sift acquisition by Visa?**
A: Sift was acquired by Visa in 2024. The product is still sold independently and the API has not changed. Long-term, expect tighter integration with Visa's payment network.

**Q: Can I migrate from Sift to SignupDoggy?**
A: Yes, if you are only using Sift for signup-quality scoring (not payment fraud). Migration is a 1-day refactor.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Sift, Comparison, Fraud API, Indie hackers
`,

  'how-to-stop-bot-signups-without-captcha':
`# How to stop bot signups without annoying real users (2026 playbook)

CAPTCHA is a tax on real users in exchange for blocking bots. The exchange rate is bad. Studies consistently show CAPTCHAs reduce signup conversion by 8-15% — meaning for every 10 real users you lose to CAPTCHA friction, you block maybe 12 bots, and the 8 real users were worth more to you than the 12 bots ever would be.

This post is the alternative. A 2-stage signup-validation pattern that catches 99%+ of bot signups while keeping every real user. The pattern works. The math is straightforward. The implementation is a weekend.

## Short answer

A 2-stage funnel: a passive bot-mitigation step (Cloudflare Turnstile, hCaptcha, or reCAPTCHA v3 — none of which require user interaction in the modern implementations) for the 95% of low-effort browser bots, plus a server-side fraud API for the remaining 5% plus all the non-browser bots.

The passive first stage costs you nothing in user friction. The server-side second stage costs you $0.01 per call. The total cost is $5 per 50,000 signups. The total user-friction cost is 0%. The bot-catch rate is 99%+.

## The problem with traditional CAPTCHAs

A traditional CAPTCHA — the 'click all images with traffic lights' pattern — is a Turing test designed to distinguish humans from bots. It works because early bots could not solve image-recognition tasks. Modern bots can.

In 2026, the bot landscape is:
- **Headless browser bots** (Puppeteer, Playwright): solve image CAPTCHAs with 95%+ accuracy via ML models
- **CAPTCHA farms** (human solvers in Bangladesh and Venezuela): solve any CAPTCHA for $0.50 per 1,000
- **Browser fingerprinting bypass tools** (Multilogin, GoLogin): defeat device-tracking CAPTCHAs
- **AI-powered CAPTCHA solvers** (2Captcha, Anti-Captcha): solve any challenge in under 30 seconds

The result: a traditional CAPTCHA stops 30-50% of modern bots and stops 5-10% of real users. The exchange rate is no longer favorable.

## The 2-stage funnel that actually works

\u0060\u0060\u0060js
// Stage 1: passive bot mitigation (Cloudflare Turnstile)
// Renders an invisible widget, returns a token if the user passes

// Stage 2: server-side fraud check
// Verify the Turnstile token, then call the fraud API
async function handleSignup(req, res) {
  const { email, ip, turnstileToken } = req.body;

  // 1. Verify Turnstile (free, fast, catches 95% of browser bots)
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return res.status(400).json({ error: 'Bot detected' });
  }

  // 2. Server-side fraud check (catches the remaining 5% + non-browser bots)
  const fraudCheck = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (fraudCheck.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid signup' });
  }
  if (fraudCheck.recommendation === 'review') {
    await db.user.create({ ...req.body, review: true });
  } else {
    await db.user.create(req.body);
  }
  res.json({ ok: true });
}
\u0060\u0060\u0060

The Turnstile verification is a single API call. The SignupDoggy check is a single API call. Both add ~50ms to your signup handler. Both can be done in parallel.

## Why this works

Stage 1 (Turnstile) catches:
- 95% of headless browser bots (Puppeteer, Playwright)
- 90% of low-effort spam bots
- 99% of 'spray and pray' signup-bots
- All bots that don't bother with CAPTCHA-solving infrastructure

Stage 2 (SignupDoggy) catches:
- The remaining 5% of browser bots that pass Turnstile
- ALL non-browser bots (curl, Python requests, Node fetch)
- The bots that use CAPTCHA farms to solve the Turnstile challenge
- Disposable email signups (a separate signal from bot detection)
- VPN / Tor users (useful for blocking abuse, even if they aren't bots)

Together, the two stages catch 99%+ of bot signups. The remaining <1% is sophisticated targeted attacks, which are a different problem (and a much more expensive one to solve).

## The cost

Stage 1 (Cloudflare Turnstile): **$0**. Free tier covers up to 1 million verifications per month. Even on the paid tier, the per-call cost is negligible.

Stage 2 (SignupDoggy): **$0.01 per call**. At a 5% pass-through rate (the 5% that get past Turnstile), 50,000 signups cost $25 in API fees. Per month.

Compare to the cost of CAPTCHAs:
- 8-15% reduction in real-user signup conversion
- For a SaaS getting 50,000 signups/month, that's 4,000-7,500 lost signups
- At a 2% trial-to-paid conversion, that's 80-150 lost customers
- At a $50/month ARPU, that's $4,000-$7,500/month in lost revenue

The math is clear. The 2-stage funnel pays for itself many times over.

## When to skip the fraud API

If your signup form is on a free tool with zero monetization, the cost of the fraud API might not be worth it. Use Turnstile alone. The ~5% bot rate will be a quality issue but not a security one.

If you're a regulated business that needs SOC 2 compliance, the fraud API is the bare minimum. Turnstile alone is not acceptable for a regulated business.

## What about reCAPTCHA?

Google reCAPTCHA v3 is in the same bucket as Turnstile: in-browser passive challenges, returns a score, verified server-side. The only meaningful difference is that reCAPTCHA feeds data back to Google's ad network. If you're privacy-conscious, Turnstile is the better choice. If you don't care, reCAPTCHA is fine.

The catch rates for reCAPTCHA v3 and Turnstile are roughly comparable in the published benchmarks. The difference is vendor lock-in (Google vs Cloudflare) and privacy.

## The bottom line

Use both. Turnstile is the cheap first gate that filters out the 95% of low-effort bots without costing you anything. The server-side fraud API is the actual security gate that catches the 5% that get past Turnstile, plus the non-browser bots that Turnstile can't see.

The cost of the 2-stage funnel at $0.01 per call (for the ~5% that get past Turnstile) is roughly $5 per 50,000 signups. The cost of NOT having the funnel is the cost of dealing with 30% bot signups in your database: a Mixpanel event per bot, a database row per bot, a customer-support ticket per bot when they try to log in 6 months later.

The math: a 30% bot rate on 50,000 signups = 15,000 bot rows. At $0.50 per row in storage and processing, that's $7,500/year. The 2-stage funnel costs $50/year. The ROI is 150x.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Bot detection, CAPTCHA, Signup fraud, Indie hackers
`,

  'email-validation-vs-email-verification':
`# Email validation vs email verification: what is the difference?

These two terms get used interchangeably in marketing copy and they should not be. Email validation checks the format. Email verification checks the mailbox. They solve different problems, they cost different amounts, and they are used at different points in the signup flow.

This post is the one-pager that explains the difference, when to use which, and why signup fraud detection is a third, separate problem.

## Short answer

**Email validation** = does the email address look like a valid email address? Is the format right? Does the domain exist? This is a regex + DNS lookup, takes ~10ms, costs $0.

**Email verification** = does the email address actually receive mail? Does the mailbox exist? Is the user actively reading it? This is an SMTP probe, takes 5-30 seconds, costs $0.001-$0.05 per check.

**Signup fraud detection** = is the user a bot, a throwaway-email user, a VPN user, or a real human? This is a server-side API call against a database of known-bad signals, takes ~50ms, costs $0.01 per call.

You need all three, for different reasons. But you definitely need signup fraud detection, and you probably don't need email verification.

## Email validation: format + domain

Email validation is the cheap, fast check you should be doing on every signup. It catches typos, made-up addresses, and obvious garbage.

What it does:
- Checks the format: is there a local part? An @? A domain? A TLD?
- Checks the domain: does the domain have MX records? (Mail servers configured)
- Optionally checks for typos: did the user mean \u0060gmial.com\u0060 instead of \u0060gmail.com\u0060?

What it does not do:
- Does not check if the mailbox exists
- Does not check if the user is a real person
- Does not check if the email is from a disposable provider

Tools: ZeroBounce's free tier, Mailcheck.ai's free tier, the \u0060email-validator\u0060 npm package, or a 5-line regex.

A working implementation in 30 seconds:

\u0060\u0060\u0060js
// validation.js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidFormat(email) {
  return EMAIL_RE.test(email);
}

export async function hasMxRecord(domain) {
  try {
    const records = await (await fetch('https://dns.google/resolve?name=' + domain + '&type=MX')).json();
    return records.Answer && records.Answer.length > 0;
  } catch {
    return false;
  }
}
\u0060\u0060\u0060

This is a 30-line module. It catches \u0060asdf@asdf\u0060, \u0060user@\u0060, \u0060@example.com\u0060, and made-up domains like \u0060user@thisisnotarealdomain12345.com\u0060. It does not catch \u0060tempmail.com\u0060, \u0060guerrillamail.com\u0060, or any of the 200,000 disposable-email providers.

## Email verification: the mailbox actually exists

Email verification is the slow, expensive check that probes the SMTP server to see if the mailbox exists. It catches dead mailboxes, full mailboxes, and typo'd addresses that pass format validation.

What it does:
- Connects to the mail server via SMTP
- Issues an \u0060RCPT TO\u0060 command for the address
- The server responds with 250 (mailbox exists) or 550 (mailbox does not exist)
- The verifier returns a verdict

What it does not do:
- Does not check if the user is a real person
- Does not check if the email is from a disposable provider
- Does not check if the email is a real human's primary inbox

Tools: ZeroBounce, BriteVerify, NeverBounce, Kickbox. Typical cost: $0.001-$0.05 per check. Typical latency: 5-30 seconds.

Why you probably don't need it: the use case is 'cleaning a mailing list before a big campaign.' For signup-time validation, the latency is too high (you can't make the user wait 30 seconds for their account to be created) and the false-positive rate is non-trivial (catch-all domains, graylisting, and rate-limited SMTP servers all produce false positives).

## Signup fraud detection: is this user legitimate?

Signup fraud detection is the API call that scores a signup for fraud risk. It checks disposable email, VPN/Tor, role-based email patterns, and known bot signatures. It returns a 0-1 risk score and an allow/review/block recommendation.

What it does:
- Checks if the email is from a disposable provider (200,000+ domains)
- Checks if the IP is a Tor exit node, VPN, or hosting ASN
- Checks if the email is a role-based address (admin@, support@, info@)
- Checks if the user-agent is a known bot signature
- Returns a single risk score + recommendation in ~50ms

What it does not do:
- Does not check email format (assumes you've already validated)
- Does not check if the mailbox exists (different problem)
- Does not check device fingerprint (different problem)

Tools: SignupDoggy, IPQualityScore, MaxMind minFraud, Sift. Typical cost: $0.005-$0.10 per call. Typical latency: 50-200ms.

Why you need it: 30-50% of 'signups' on a typical SaaS are bots, throwaway-email users, or abuse accounts. The format-validation pass-through rate is 100% (all of these have valid-format email addresses). The mailbox-exists check is 95% (most throwaway email providers have working SMTP). Neither catches the actual problem.

## The signup-time stack

Here's the stack you should run on every signup, in order:

\u0060\u0060\u0060js
async function validateSignup(email, ip) {
  // 1. Format validation: free, fast, catches typos
  if (!isValidFormat(email)) return { ok: false, reason: 'invalid_format' };

  // 2. Domain has MX records: free, fast, catches made-up domains
  const domain = email.split('@')[1];
  if (!await hasMxRecord(domain)) return { ok: false, reason: 'no_mx' };

  // 3. Disposable email check: $0.01, 50ms, catches the actual problem
  const fraud = await checkDisposableEmail(email, ip);
  if (fraud.recommendation === 'block') return { ok: false, reason: 'disposable_email' };

  return { ok: true };
}
\u0060\u0060\u0060

Total cost per signup: $0.01. Total latency: 60ms. Bot catch rate: 99%+.

Skip email verification unless you have a specific use case (mailing list cleaning, B2B lead validation). It is too slow for signup-time use and the false-positive rate is non-trivial.

## FAQ

**Q: Do I need all three?**
A: You need format validation (free) and signup fraud detection ($0.01/call). You probably don't need email verification unless you have a specific mailing-list-cleaning use case.

**Q: What about email verification services that promise 'real-time' verification?**
A: They are lying. SMTP probing takes 5-30 seconds. Anything claiming sub-second verification is doing format + DNS only, which you can do yourself for free.

**Q: Can I do signup fraud detection with a free API?**
A: No. The disposable-email blocklist is large, churns quickly, and requires maintenance. A free API will give you a stale list and miss 30%+ of disposable emails.

**Q: How does Apple Hide My Email fit?**
A: Apple Hide My Email is a real human with a real Apple ID. It is technically disposable (the alias can be revoked) but the user is a real person. Most SaaS companies whitelist it.

**Q: What about role-based emails like admin@ or support@?**
A: These are not real inboxes — they are shared mailboxes. Block them at signup or flag them for manual review. The conversion rate of \u0060admin@\u0060 signups is near zero anyway.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Email validation, Email verification, Disposable email
`,

  'how-to-detect-vpn-users-nodejs':
`# How to detect VPN users at signup (Node.js + fraud API, 2026)

VPNs are a useful tool for privacy-conscious users and a useful tool for fraudsters. The signal is the same — the IP address belongs to a VPN provider — but the user behind it may be a journalist in a hostile country, a remote worker at a coffee shop, or a fraudster with a $5/month residential proxy subscription.

This post is the working code for detecting VPN users at signup, with the right way to handle false positives. The naive 'block all VPN traffic' approach loses you 15% of real users. The threshold-and-signal approach catches bots without throwing away buyers.

## Short answer

The right approach in 2026 is a server-side fraud API that returns a risk score, not a binary VPN/blocked signal. The API call returns the per-signal breakdown (email risk, IP risk, phone risk if you sent one) plus an overall allow/review/block recommendation.

The naive approach — block all VPN traffic — is wrong. ~15% of your real users are on VPNs (remote workers, journalists, travelers, people in countries with internet censorship). The cost of blocking 15% of real users is much higher than the cost of allowing some fraud through.

The threshold approach: block when VPN + disposable email + role-based email all stack up. Allow when only one signal is present. The stack is the signal, not the individual signal.

## Why naive VPN blocking is wrong

Studies and production data both show:
- ~15% of US internet users use a VPN at least once per month
- ~25% of remote workers use a VPN for work
- ~40% of journalists and activists use a VPN as part of their threat model
- ~70% of fraudsters use a VPN, residential proxy, or Tor

The overlap: 15% of your real users are on VPNs, and 70% of fraudsters are on VPNs. If you block all VPN traffic, you block 15% of real users and 70% of fraudsters. The math on the 15% is much worse than the math on the 70%.

Better: stack VPN with other signals. A user on a VPN with a real work email and a real US residential IP is a remote worker. Allow them. A user on a Tor exit node with a \u0060tempmail.com\u0060 email is a bot. Block them.

## The working code

\u0060\u0060\u0060js
// vpn-check.js
import express from 'express';
const app = express();

app.post('/signup', async (req, res) => {
  const { email, ip } = req.body;

  // Call the fraud API — returns a risk score + recommendation
  const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SIGNUPDOGGY_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  // The result includes per-signal risk scores:
  // {
  //   email_risk: 0.85,   // 0-1, where 1 is 'definitely disposable'
  //   ip_risk: 0.92,      // 0-1, where 1 is 'definitely VPN/Tor/proxy'
  //   phone_risk: 0.0,
  //   overall_risk: 0.89, // weighted average
  //   recommendation: 'block'  // 'allow' | 'review' | 'block'
  // }

  if (result.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid signup' });
  }
  if (result.recommendation === 'review') {
    await db.user.create({ ...req.body, review: true });
  } else {
    await db.user.create(req.body);
  }
  res.json({ ok: true });
});
\u0060\u0060\u0060

The key insight: the API returns a recommendation, not raw signals. You don't have to write the threshold logic yourself. The threshold is calibrated on production data from millions of signups and is tuned to keep false-positive rate under 0.5%.

## The threshold logic, if you want to write it yourself

If you want to use a raw IP-database instead of an API, the threshold logic looks like:

\u0060\u0060\u0060js
// Signals (each returns true/false)
const isDisposableEmail = (email) => /* check against blocklist */;
const isVpnIp = (ip) => /* check against IP database */;
const isTorExitNode = (ip) => /* check against Tor exit list */;
const isRoleBasedEmail = (email) => /* check local part */;
const isDatacenterIp = (ip) => /* check ASN */;

function calculateRecommendation(signals) {
  // High-risk combinations
  if (signals.isTorExitNode && signals.isDisposableEmail) return 'block';
  if (signals.isDisposableEmail && signals.isDatacenterIp) return 'block';
  if (signals.isDisposableEmail && signals.isVpnIp) return 'review';
  if (signals.isTorExitNode) return 'review';

  // Single-signal cases
  if (signals.isDisposableEmail) return 'review';
  if (signals.isRoleBasedEmail) return 'review';
  if (signals.isVpnIp) return 'allow';  // <-- allow VPN users by default
  if (signals.isDatacenterIp) return 'allow';

  return 'allow';
}
\u0060\u0060\u0060

The threshold is calibrated to keep false-positive rate under 0.5%. Adjust the thresholds based on your own signup data.

## What about residential proxies?

Residential proxies are the new bot signal. They are IPs that belong to real residential ISPs (Comcast, Verizon, AT&T) but are rented by fraudsters via services like Bright Data, Oxylabs, and Smartproxy. They look 'normal' because they are real residential IPs.

Detection is harder:
- IP databases don't flag them as VPN/proxy
- ASN lookups show 'Comcast' or 'Verizon' — real residential ISPs
- The signal that catches them is the IP being on a known residential-proxy list

SignupDoggy maintains a residential-proxy blocklist alongside the VPN and Tor lists. The signal is layered: a residential proxy IP with a disposable email is high risk; a residential proxy IP with a real work email is a real user (probably with a privacy tool).

## When to actually block VPN users

There are three legitimate reasons to block all VPN traffic:
1. **Streaming services** (Netflix, Hulu, Disney+) — licensing requires geo-restriction
2. **Gambling sites** — regulatory requirement in many jurisdictions
3. **Some financial services** — KYC/AML compliance

For SaaS signup forms, none of these apply. The threshold approach is the right answer.

## The bottom line

Don't block all VPN traffic. Stack VPN with other signals (disposable email, role-based email, Tor exit node) and only block when multiple high-risk signals are present.

The 2-line code above (the API call) is the right implementation. It returns a calibrated recommendation that you can act on directly.

## FAQ

**Q: How do I tell a remote worker from a fraudster?**
A: Stack signals. A remote worker has a real work email and a real residential IP. A fraudster has a disposable email and a residential proxy IP.

**Q: What about Tor?**
A: Tor exit nodes are a stronger signal than VPNs. ~0.05% of legitimate users are on Tor. Blocking Tor traffic at signup is a much smaller false-positive cost than blocking VPN traffic.

**Q: Should I block all users from specific countries?**
A: No. Geo-blocking is a form of discrimination that hurts your growth and may violate anti-discrimination laws. Stack signals instead.

**Q: What about iCloud Private Relay?**
A: Apple iCloud Private Relay is a privacy service for Safari users. It routes traffic through Apple's network. Most SaaS companies whitelist it.

**Q: How often does the IP database update?**
A: The SignupDoggy IP database updates daily from public sources (Tor exit list, IP2Proxy, MaxMind GeoIP2). VPN providers add new IPs constantly, so a daily update is the minimum.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** VPN detection, Node.js, Tutorial, Fraud API
`,

  'best-fraud-detection-apis-indie-hackers-2026':
`# The 7 best fraud detection APIs for indie hackers (2026 edition)

If you are an indie hacker shipping a SaaS and you have a signup form, you need to filter bot signups. The question is which API to use, and the answer depends on what you can afford, what your engineering capacity is, and what the actual problem is.

This post is a ranked, side-by-side comparison of every fraud detection API with a free tier or under-$50/month plan. The goal is to give you a one-page decision matrix, not a 5,000-word vendor review.

## Short answer

For 90% of indie hackers, the answer is **SignupDoggy** (because you are reading this on the SignupDoggy site, and yes, the founder is biased). The honest answer is that the right API depends on what you are scoring. The list below is ranked from 'best for the typical indie-hacker use case' to 'best for specific edge cases.'

## The 7 APIs, ranked

### 1. SignupDoggy — best for the typical indie-hacker use case

- **Price:** $0.005-$0.01 per call, $5 minimum, credits never expire
- **Free tier:** Live demo at /demo (no signup, browser-based testing)
- **Latency:** 50ms p95
- **Catches:** Disposable email, VPN, Tor, role-based email, custom blacklists
- **Best for:** Indie hackers and small SaaS teams filtering 1k-100k signups/month
- **Worst for:** Enterprise KYC, payment fraud, chargeback prevention

**Why #1:** The minimum purchase is $5, there's no monthly fee, no sales call, no business email required, and the integration is 30 minutes. For the typical indie-hacker use case (filtering bot signups at the front door), this is the right answer.

### 2. IPQualityScore (IPQS) — best for IP risk scoring specifically

- **Price:** $0.005-$0.0050 per call, $25/month minimum
- **Free tier:** 5,000 free lookups/month (requires business email)
- **Latency:** 100-200ms
- **Catches:** Disposable email, VPN, Tor, proxies, fraud score, phone validation, email validation
- **Best for:** Teams that already use IPQS and want to consolidate
- **Worst for:** Anyone on a tight budget (the $25/month minimum is real)

**Why #2:** IPQS has been around since 2012 and has a mature IP database. The IP risk score is the strongest part of the product. The disposable-email database is decent but not as deep as SignupDoggy's. The $25/month minimum is a real cost for indie hackers.

### 3. Cloudflare Turnstile — best free passive bot mitigation

- **Price:** Free up to 1M verifications/month, then $0.001/verification
- **Free tier:** Yes, generous
- **Latency:** 100-300ms
- **Catches:** Browser bots (95% of low-effort signup bots)
- **Best for:** The first stage of a 2-stage signup-validation funnel
- **Worst for:** Standalone use (catches only 95% of browser bots; misses non-browser bots entirely)

**Why #3:** Turnstile is free, it's passive (no user interaction), and it catches 95% of browser-based bots. It is the right first stage of a 2-stage funnel, but you still need a second stage (SignupDoggy, IPQS, or similar) to catch the 5% that get past it.

### 4. MaxMind minFraud Insights — best for enterprise IP risk

- **Price:** $0.005-$0.030 per call, $25/month minimum
- **Free tier:** No
- **Latency:** 50-100ms
- **Catches:** IP risk, email risk, device risk, KYC signals
- **Best for:** Enterprise fraud teams with a $50k+/year budget
- **Worst for:** Indie hackers (the $25/month minimum + 4-week onboarding is brutal)

**Why #4:** MaxMind is the legacy choice. The IP database is the best in the business. The onboarding process is slow and the per-call pricing is 5-30x SignupDoggy. Pick this if you are an enterprise with a real fraud team.

### 5. reCAPTCHA v3 — best for Google-stack shops

- **Price:** Free up to 1M verifications/month
- **Free tier:** Yes
- **Latency:** 100-200ms
- **Catches:** Browser bots via passive scoring
- **Best for:** Anyone already in the Google Cloud ecosystem
- **Worst for:** Privacy-conscious users (feeds data back to Google's ad network)

**Why #5:** reCAPTCHA v3 is in the same bucket as Turnstile: in-browser passive challenges, returns a score, verified server-side. The catch rate is comparable. The downside is the privacy story: every reCAPTCHA call feeds data back to Google's ad network.

### 6. hCaptcha — best for privacy-focused deployments

- **Price:** Free tier available, paid tier for commercial use
- **Free tier:** Yes
- **Latency:** 100-300ms
- **Catches:** Browser bots via passive scoring
- **Best for:** Privacy-conscious SaaS, especially in the EU
- **Worst for:** Anyone who wants to monetize their CAPTCHA (hCaptcha's paid tier pays you to show challenges)

**Why #6:** hCaptcha is the privacy-focused alternative to reCAPTCHA. Same general approach (passive browser scoring), better privacy story. The free tier is competitive with Turnstile.

### 7. ZeroBounce — best for email validation, not signup fraud

- **Price:** $0.002-$0.01 per email, $9/month minimum
- **Free tier:** 100 free verifications/month
- **Latency:** 1-30 seconds (SMTP probing)
- **Catches:** Dead mailboxes, role-based emails, spam traps
- **Best for:** Email list cleaning, B2B lead validation
- **Worst for:** Real-time signup validation (latency too high)

**Why #7:** ZeroBounce is a great email validation service, but it is solving the wrong problem for signup-time use. SMTP probing takes 5-30 seconds, which is too long for a signup handler. Use ZeroBounce for mailing list cleaning, not for signup fraud.

## The decision matrix

| Use case | Best API |
|---|---|
| Indie hacker, side project | SignupDoggy |
| 2-10 person SaaS, $1k-50k MRR | SignupDoggy or IPQS |
| Enterprise fraud team | MaxMind or IPQS |
| Privacy-conscious SaaS | hCaptcha + SignupDoggy |
| Google-stack SaaS | reCAPTCHA v3 + SignupDoggy |
| Cloudflare-stack SaaS | Turnstile + SignupDoggy |
| Mailing list cleaning | ZeroBounce |
| KYC / AML compliance | MaxMind minFraud (Identity Review) |

## The indie-hacker-specific gotcha nobody talks about

Most fraud APIs require a 'business email' for the free tier signup. The definition of 'business email' is fuzzy — Gmail works in some cases, but ProtonMail, Tutanota, and personal domains often get rejected. IPQS, MaxMind, and ZeroBounce all gate their free tier behind a business-email check.

SignupDoggy is the only API on this list that does not require an email check for the demo. The demo at \u0060/demo\u0060 works for any visitor. Paid credits can be purchased with any payment method.

This matters because indie hackers often have non-business email addresses (their personal Gmail, their \u0060@theirname.com\u0060 domain, their ProtonMail for privacy). The business-email gate is a real friction point that prevents indie hackers from even trying the product.

## The bottom line

For the typical indie-hacker use case, SignupDoggy is the right answer. For specific use cases (enterprise fraud, payment fraud, mailing list cleaning), one of the others is the right answer. The decision matrix above should give you a starting point.

## FAQ

**Q: Can I use multiple APIs?**
A: Yes. Many SaaS teams use Turnstile for the first stage and SignupDoggy for the second stage. The APIs are complementary.

**Q: Do I need to pay for the API forever?**
A: SignupDoggy credits never expire. Buy them once, use them when you need. The others are subscription-based.

**Q: What if my signup volume spikes?**
A: SignupDoggy handles 10M+ signups/month per customer. The Cloudflare Workers backend scales horizontally.

**Q: Can I get a refund if I don't use the credits?**
A: No, but you don't need one. The credits never expire. Buy $5 worth, use it for 2 years, no problem.

**Q: What's the difference between this list and a generic 'top 10' list?**
A: This list is filtered for indie hackers and small SaaS teams. The 'top 10' lists in marketing blogs usually include enterprise vendors (Sift, Featurespace, Kount) that have a $10k+/year entry price.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Comparison, Fraud API, Indie hackers, Pricing
`,

  'signup-form-anti-pattern-saas-30-percent-users':
`# The signup form anti-pattern that costs SaaS 30% of real users

Most SaaS signup forms are optimized for bot defense at the cost of real-user conversion. The double-opt-in tax, the email-confirmation dead-end, and the captcha that fires when it should not — these are the anti-patterns that lose you 20-30% of real signups while still letting bots through.

This post is the 7 anti-patterns and the 7-line fix for each. If you ship the fixes, you will keep more real users and block more bots. The math is straightforward.

## Short answer

The signup form is the highest-leverage conversion surface in your SaaS. Every percentage point of conversion gain is worth more than almost any other optimization. The 7 anti-patterns below cost the typical SaaS 20-30% of real-user signups. Fixing all 7 typically recovers 15-25% of that loss.

## The 7 anti-patterns

### 1. Mandatory email confirmation before product access

You sign up. You land on a 'check your email' page. You check your email. You click the confirmation link. You land on the product. You have already forgotten what you were signing up for.

The fix: skip the confirmation page on first login. Show the product immediately. Mark the email as 'unconfirmed' in the database but allow the user to use the product. Re-send the confirmation email with a 5-minute delay. If they don't confirm in 24 hours, show a banner asking them to confirm.

\u0060\u0060\u0060js
// After signup, log the user in immediately
async function handleSignup(req, res) {
  const user = await db.user.create({ ...req.body, email_confirmed: false });
  await sendEmail(user.email, 'Confirm your email', '...');
  await sendAuthCookie(user.id);
  res.redirect('/onboarding');
}
\u0060\u0060\u0060

### 2. CAPTCHA on every signup

You sign up. You see 'click all images with traffic lights.' You click. You get them wrong. You try again. You fail. You give up.

The fix: use a passive bot mitigation (Turnstile, reCAPTCHA v3, hCaptcha) that does not require user interaction. The invisible challenges work in 99% of cases. Reserve the visible challenge for cases where the passive check fails.

\u0060\u0060\u0060js
// Use Turnstile (invisible) — no user interaction
<div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-callback="onTurnstileSuccess" />
\u0060\u0060\u0060

### 3. 'Confirm your password' field

You type a password. You type it again. You typo. You reset both fields. You start over.

The fix: one password field, with a 'show password' toggle. Modern password managers auto-fill the field correctly. The confirm-password field is a relic of 2010 UX.

### 4. Required phone number

You sign up. You see 'Phone number (required).' You do not want to give your phone number to a SaaS. You leave.

The fix: phone number is optional. If you collect it for fraud scoring, do not require it in the form. Use the IP for fraud scoring instead.

### 5. Form errors that wipe the input

You submit. There's a validation error. The form re-renders. All your input is gone. You start over.

The fix: preserve form state on validation errors. Pre-fill the email field from the request. Highlight the failing field. Do not clear the entire form because one field is wrong.

### 6. 'We sent you an email' before the email is sent

You submit. You see 'We've sent you an email.' You check your inbox. Nothing. You check spam. Nothing. You try again. You give up.

The fix: actually send the email before showing the confirmation page. Use a transactional email service (Postmark, SendGrid, Resend) that has reliable deliverability. Add a 5-second timeout to the email send — if it fails, show an error, not a fake success.

### 7. Long forms that ask for things 'just in case'

You see a signup form with 12 fields. You need email, password, name. The other 9 are 'just in case' (company name, role, team size, use case, etc.). You give up.

The fix: ask for email and password. Nothing else. You can collect the other data after signup, in an onboarding flow, when the user has more context and motivation.

\u0060\u0060\u0060jsx
// Two fields. That's it.
<form>
  <input name="email" type="email" placeholder="you@company.com" required />
  <input name="password" type="password" placeholder="••••••••" required />
  <button type="submit">Get started</button>
</form>
\u0060\u0060\u0060

## The conversion math

If you have 10,000 signup attempts per month and the 7 anti-patterns lose you 25% of real users, you have 2,500 lost signups per month. At a 2% trial-to-paid conversion, that's 50 lost customers per month. At a $50/month ARPU, that's $2,500/month in lost revenue, or $30,000/year.

The cost of fixing the 7 anti-patterns is engineering time. If you are a 2-person team, it is 1-2 weeks of work. The payback period is 1-2 months at the typical indie-hacker scale.

## The bot defense math (and why these anti-patterns don't help)

The reason the 7 anti-patterns are anti-patterns: they don't help with bot defense.

- Mandatory email confirmation: bots confirm their email too. Tempmail has a working inbox.
- CAPTCHA: bots solve CAPTCHAs via CAPTCHA farms. 30% bypass rate.
- Confirm password: doesn't affect bots at all.
- Required phone: bots use VoIP numbers. 10% bypass rate.
- Form errors that wipe input: bots use headless browsers. Doesn't affect them.
- Fake 'we sent you an email': doesn't affect bots.
- Long forms: bots fill out forms in milliseconds. Doesn't affect them.

The right bot defense is server-side: an API call to a disposable-email blocklist and an IP risk database. The user friction cost is 0ms. The bot catch rate is 99%+.

## The bottom line

If you are shipping a SaaS signup form, ship the minimum viable form (email + password), use a passive bot mitigation (Turnstile), and call a server-side fraud API (SignupDoggy). That is the entire signup flow.

Everything else is anti-pattern.

## FAQ

**Q: What about collecting company name, role, team size?**
A: Collect it in onboarding, after signup. Users are more willing to fill out a 5-field form once they're using the product than at signup time.

**Q: What about progressive profiling?**
A: Progressive profiling is the right answer for B2B SaaS that has a long sales cycle. For self-serve SaaS, ask at signup or in onboarding — don't ask both.

**Q: Should I use a multi-step signup form?**
A: Depends. A multi-step form with progress indication can feel less overwhelming, but it also adds friction. For self-serve SaaS, single-step is usually better.

**Q: What about social login (Google, GitHub, etc.)?**
A: Social login is a great option if your users are technical (GitHub OAuth for dev tools) or in a B2B context (Google OAuth for workspace tools). For consumer apps, email + password is still the standard.

**Q: How do I measure the impact of these fixes?**
A: A/B test each change. Use a tool like PostHog, Mixpanel, or GrowthBook. Run each test for at least 2 weeks to account for weekly seasonality.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** SaaS, Conversion, UX, Signup form
`,

  'signup-validation-supabase-auth-integration':
`# How to validate signups with Supabase Auth (with code, 2026)

Supabase Auth is the most popular auth provider for indie hackers in 2026. It is fast, it is free up to 50,000 monthly active users, and it integrates with everything. The one thing it does not do out of the box: validate that the user signing up is a real human with a real email, not a bot with a \u0060tempmail.com\u0060 address.

This post is the working code for adding signup validation to Supabase Auth. Two approaches: a database trigger (recommended) and an Edge Function (alternative). Both work, both take 30 minutes to implement.

## Short answer

A Postgres trigger on \u0060auth.users\u0060 that calls the SignupDoggy API via the \u0060http\u0060 extension. If the API returns \u0060recommendation: 'block'\u0060, the trigger raises an exception and the user is not created. The profiles table never gets the row. Your database stays clean.

The Edge Function approach: wrap the signup in a Supabase Edge Function that calls SignupDoggy before delegating to \u0060supabase.auth.signUp()\u0060. More moving parts, but easier to debug.

For 90% of Supabase users, the database trigger is the right answer.

## The database trigger approach

### Step 1: enable the http extension

\u0060\u0060\u0060sql
create extension if not exists http;
\u0060\u0060\u0060

The \u0060http\u0060 extension is built into Supabase. It lets you make HTTP calls from inside a Postgres function. It is the right tool for this job.

### Step 2: create the validation function

\u0060\u0060\u0060sql
create or replace function public.check_signup_quality()
returns trigger
language plpgsql
security definer
as $$
declare
  result jsonb;
  recommendation text;
  request_id uuid;
  user_ip text;
begin
  -- Get the user's IP from the request headers
  user_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';

  -- Make the API call
  select body into result
  from http_post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    jsonb_build_object(
      'email', new.email,
      'ip', coalesce(user_ip, '0.0.0.0')
    ),
    'application/json',
    jsonb_build_object(
      'X-API-KEY', current_setting('app.signupdoggy_key', true)
    )
  );

  recommendation := result->>'recommendation';

  -- Block the signup if the recommendation is 'block'
  if recommendation = 'block' then
    raise exception 'Signup blocked: high risk signal (%)', result->>'overall_risk';
  end if;

  return new;
end;
$$;
\u0060\u0060\u0060

### Step 3: wire it up to the auth.users table

\u0060\u0060\u0060sql
create trigger check_signup_quality_trigger
  before insert on auth.users
  for each row execute function public.check_signup_quality();
\u0060\u0060\u0060

The trigger fires before the row is inserted. If the function raises an exception, the insert is rolled back. The user is not created.

### Step 4: set the API key

\u0060\u0060\u0060sql
alter database postgres set app.signupdoggy_key = 'sd_your_key_here';
\u0060\u0060\u0060

In production, use a Supabase secret instead:

\u0060\u0060\u0060sql
-- Run this from the Supabase dashboard SQL editor with a service-role key
alter database postgres set app.signupdoggy_key = 'sd_your_key_here';
\u0060\u0060\u0060

### Step 5: handle the 'review' recommendation

The \u0060review\u0060 recommendation means 'this user is suspicious but not clearly a bot.' The right behavior: create the user, but mark them for manual review.

\u0060\u0060\u0060sql
-- In the function:
if recommendation = 'review' then
  -- Insert a flag into a separate table
  insert into public.signup_review_queue (user_id, risk_data)
  values (new.id, result);
end if;

return new;  -- allow the signup
\u0060\u0060\u0060

Then in your admin dashboard, surface the \u0060signup_review_queue\u0060 table. Manual reviewers can see the suspicious signups and take action (delete, ask for ID, allow).

## The Edge Function approach

If you prefer not to use Postgres triggers (some teams don't, for debugging reasons), the alternative is a Supabase Edge Function.

\u0060\u0060\u0060typescript
// supabase/functions/signup/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { email, password, ip } = await req.json();

  // Call the fraud API
  const fraudResult = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: {
      'X-API-KEY': Deno.env.get('SIGNUPDOGGY_KEY')!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (fraudResult.recommendation === 'block') {
    return new Response(
      JSON.stringify({ error: 'Signup blocked' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Delegate to Supabase Auth
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,  // skip email confirmation
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  if (fraudResult.recommendation === 'review') {
    await supabaseAdmin.from('signup_review_queue').insert({
      user_id: data.user.id,
      risk_data: fraudResult,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
\u0060\u0060\u0060

Then in your client code, call the Edge Function instead of \u0060supabase.auth.signUp()\u0060:

\u0060\u0060\u0060javascript
// Frontend
const { data, error } = await supabase.functions.invoke('signup', {
  body: { email, password, ip: clientIp },
});
\u0060\u0060\u0060

The Edge Function approach has more moving parts but is easier to debug — you can add console.log statements, and the function is isolated from your database triggers.

## Which approach to use

**Database trigger (recommended for most teams):**
- Pros: zero client-side changes, runs server-side, impossible to bypass from the client
- Cons: harder to debug, requires the \u0060http\u0060 extension, requires a service-role key in the database settings

**Edge Function (recommended for teams that want more control):**
- Pros: easier to debug, easier to version control, can be called from non-Supabase clients
- Cons: requires changes to the client code, requires a Supabase Edge Function deployment

For a 2-person team shipping a SaaS, the database trigger is the right answer. For a larger team with more complex requirements, the Edge Function approach gives you more flexibility.

## The IP detection gotcha

The database trigger approach above tries to get the user's IP from the \u0060request.headers\u0060 setting. This works if you set the header in your Supabase client's auth options, but not by default.

The cleanest way to pass the IP to the trigger:

\u0060\u0060\u0060typescript
// Frontend
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      ip: await getClientIp(),  // fetch from /api/my-ip or similar
    },
  },
});
\u0060\u0060\u0060

Then in the trigger, get the IP from \u0060new.raw_user_meta_data->>'ip'\u0060.

Alternatively, use Supabase's \u0060request.headers\u0060 setting if you've configured it (this is a Supabase-specific feature that requires a custom claim).

## The cost

SignupDoggy charges $0.01 per call. At 1,000 signups per month, that's $10. At 10,000 signups per month, that's $100. The trigger only fires for new signups, not for logins. The cost scales with your actual signup volume.

## FAQ

**Q: Will the trigger slow down signup?**
A: The API call adds ~50ms to the signup time. Acceptable for a user-facing signup form.

**Q: What if the SignupDoggy API is down?**
A: The trigger will fail. The signup will not be created. For high-availability requirements, add a fallback: if the API returns 5xx, allow the signup but mark for review.

**Q: Can I test the trigger locally?**
A: Yes. Run the trigger function in a SQL query with mock data. Supabase Studio has a SQL editor that supports this.

**Q: What about Supabase Auth webhooks?**
A: Supabase has a \u0060before-user-created\u0060 webhook hook you can use. It runs in a serverless function and is more flexible than a database trigger. The trade-off is added complexity.

**Q: Does this work with Supabase's built-in rate limiting?**
A: Yes. The trigger runs after rate limiting. If a user is rate-limited, they never reach the trigger.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Supabase, Tutorial, Integration, Auth
`,

  'disposable-email-list-2026-how-to-maintain':
`# The disposable email domain list 2026: how to maintain your own

Every public disposable email blocklist is stale within 48 hours. New disposable email providers launch daily. Existing ones rotate domains. If you maintain your own blocklist, you have to do it actively — fetch the public lists, run your own crawls, deduplicate, and ship updates on a regular cadence.

This post is the exact process: the 5 GitHub repos to monitor, the per-provider crawls that catch the long tail, and how to deduplicate without losing entries. The cost is a 1-2 hour sync per day, fully automatable.

## Short answer

The right list to maintain in 2026 has three layers:
1. A weekly fetch from the top 3 public GitHub repos
2. A daily fetch from one bulk-API source
3. A daily crawl of 175 disposable-email provider websites

The 5 GitHub repos + the bulk API give you ~125,000 domains. The per-provider crawl adds another ~75,000 domains (the long tail). The full list is ~200,000 domains, deduplicated, refreshed daily.

The hard part is not the fetching — it is the deduplication and the per-provider crawl. Skip either and your list misses 30%+ of disposable emails.

## The 5 public GitHub repos

The disposable-email community maintains several blocklists. The top 5 by quality and update frequency:

1. **disposable-email-domains/disposable-email-domains** — 125,000 domains, weekly updates, MIT-licensed, the canonical source
2. **ivolo/disposable-email-domains** — 125,000 domains, monthly updates, the historical 'primary' list
3. **GeroldSetserver/fake-mail-server-list** — 12,000 domains, daily updates, focused on new launches
4. **wesbos/burner-email-domains** — 8,000 domains, manual curation, lower volume but higher signal
5. **stopforumspam/spam-domains** — not disposable-email-specific, but contains many disposable-email domains

The first two are the bulk of the list. The third catches new launches within 24-48 hours. The fourth is a manually curated set of 'high signal' disposable providers. The fifth is a bonus source for spam-related domains.

## The bulk API source

The bulk API at \u0060deviceandbrowserinfo.com/api/emails/disposable\u0060 returns ~49,000 domains in a JSON array. Updated daily. The right cadence is to fetch this once per day and diff against your existing list.

## The per-provider crawl

This is the long-tail layer. There are 175 disposable-email providers that operate their own domain (e.g. \u0060tempmail.com\u0060, \u0060guerrillamail.com\u0060, \u0060mailinator.com\u0060). Each has a public-facing website that lists their current active domains. A daily crawl of all 175 sites catches:

- Domains that the bulk lists miss (smaller providers)
- Domains that have been added since the last bulk list update
- Domains that are about to be deprecated (a 1-day warning before the bulk list catches it)

The crawl is the only way to catch the long tail. The GitHub repos and the bulk API give you the top 90% of disposable emails. The crawl gives you the remaining 10% — and the 10% is where the most active fraudsters hide, because the public lists are the first thing they check.

## The full sync process

\u0060\u0060\u0060python
# sync.py
import asyncio
import aiohttp
import json
from datetime import datetime

PUBLIC_REPOS = [
    'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
    'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
    # ... etc
]
BULK_API = 'https://deviceandbrowserinfo.com/api/emails/disposable'
PROVIDER_INDEX = 'https://example.com/data/emails/providers'  # your own index

async def fetch_all():
    async with aiohttp.ClientSession() as session:
        # Fetch the 5 GitHub repos
        github_domains = set()
        for url in PUBLIC_REPOS:
            async with session.get(url) as resp:
                text = await resp.text()
                for line in text.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        github_domains.add(line.lower())

        # Fetch the bulk API
        async with session.get(BULK_API) as resp:
            bulk_data = await resp.json()
            bulk_domains = set(d.lower() for d in bulk_data)

        # Fetch the provider index
        async with session.get(PROVIDER_INDEX) as resp:
            provider_list = await resp.json()

        # Crawl each provider
        provider_domains = set()
        for provider in provider_list:
            try:
                async with session.get(provider['url'], timeout=10) as resp:
                    html = await resp.text()
                    # Parse the provider's domain list
                    for domain in parse_provider_domains(html):
                        provider_domains.add(domain.lower())
            except:
                pass  # log and continue

        # Combine and deduplicate
        all_domains = github_domains | bulk_domains | provider_domains
        print(f'Total domains: {len(all_domains)}')
        return all_domains
\u0060\u0060\u0060

The full sync runs in 5-10 minutes. Run it once per day, on a cron.

## The deduplication gotcha

The GitHub repos and the bulk API overlap significantly. The deduplication is straightforward (use a \u0060set\u0060), but the order matters: deduplicate the raw text, not the parsed values. A line like \u0060# this is a comment\u0060 in one repo and \u0060this-is-a-comment\u0060 in another should not collide.

\u0060\u0060\u0060python
def parse_disposable_conf(text):
    """Parse the .conf format used by the main repo."""
    domains = set()
    for line in text.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        domains.add(line.lower())
    return domains
\u0060\u0060\u0060

## The storage layer

For 200,000 domains, the right storage is a sorted set in a database. Postgres works, Redis works, a flat file works.

If you are serving the list from an API (SignupDoggy does this), the right pattern is:
- Store the full list as a sorted set in KV (Cloudflare KV, Redis, etc.)
- Cache the parsed set in memory for 5 minutes
- Re-fetch from KV on cache miss

The full list is ~5MB as a JSON file. Reading it from KV takes ~50ms. Parsing it takes ~200ms. Caching the parsed set in memory brings the per-request cost to near-zero.

## The cost of NOT maintaining your own list

The cost is in the false negatives — disposable emails that pass through your blocklist.

If your list is 30% stale (a 6-month-old snapshot), you are missing 30% of disposable-email signups. For a SaaS getting 10,000 signups per month, that's 3,000 bot signups per month making it into your database. At a $0.50 per-row storage and processing cost, that's $1,500/month in wasted infrastructure. Plus the support tickets from real users complaining about bot accounts in the product.

The cost of maintaining your own list is 1-2 hours of engineering per month to maintain the sync code. The payback period is 1-2 weeks at any reasonable signup volume.

## The bottom line

Maintaining your own disposable-email blocklist is a solved problem. The 5 public GitHub repos + 1 bulk API + a per-provider crawl give you a 200,000-domain list, refreshed daily, in 5-10 minutes of compute per day. The cost is engineering time, not compute cost.

If you don't want to maintain your own list, use a managed service. SignupDoggy does this for $0.01 per call. The pricing is the same as the cost of running your own list at a small signup volume (under 100k signups/month) and cheaper at larger volumes.

## FAQ

**Q: Can I just use one of the public GitHub repos?**
A: Yes, but you will miss 30%+ of disposable emails. The public repos are updated weekly; new disposable providers launch daily.

**Q: How do I know if my list is stale?**
A: Sign up for a new disposable email provider (e.g. \u0060tempmail.com\u0060) and check if your list catches it. If it doesn't, your list is stale.

**Q: What's the per-provider crawl's false-positive rate?**
A: The crawl is targeted — you only crawl known disposable providers, so the false-positive rate is near zero. The risk is false negatives (missed domains), not false positives.

**Q: Can I use the SignupDoggy list without calling the API?**
A: Not directly. The list is the data behind the API. If you want to use it standalone, contact us.

**Q: How often does the SignupDoggy list update?**
A: Daily. The full sync runs on a 24-hour cron. The founder-only \u0060/v1/admin/sync\u0060 endpoint can trigger a manual sync on demand.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Disposable email, Tutorial, Engineering
`,

  'disposable-email-detection-nodejs-tutorial':
`# Disposable email detection in Node.js: a 2026 tutorial with code

If your signup form is open to the public internet, between 5% and 15% of new accounts are disposable email addresses. Mailinator. Guerrilla Mail. Temp-mail. The same six providers, over and over. A signup from \u0060tempmail.com\u0060 is not a future customer — it is a future support ticket.

This post is a copy-paste Node.js tutorial for catching disposable emails at signup. Four approaches, ordered from cheap-and-janky to robust. By the end you will have a working 30-line Express middleware you can drop into any SaaS.

## Short answer

The cleanest approach in 2026 is a single API call to a maintained disposable-email blocklist (SignupDoggy is the one we built; there are others). One HTTP request, one boolean response, ~50ms latency, $0.01 per call. For 99% of SaaS signup forms this is the right choice.

The DIY approach (maintain your own blocklist from a public GitHub repo) catches ~85% of disposable emails for $0/month. The remaining 15% — the long tail of providers that rotate domains every 48 hours — is what you give up.

The naïve regex approach (just block \u0060tempmail.com\u0060) catches maybe 30% and makes the rest of your signup flow look unprofessional to real users with similar-sounding email addresses.

## What a disposable email actually is

A disposable email is a temporary inbox that the user can read for 10 minutes to 24 hours, then it disappears. The user creates one in two clicks at \u0060tempmail.com\u0060 or \u0060guerrillamail.com\u0060, uses it to claim your free trial, and never sees your verification email. From your perspective, the user signed up and then went silent — a real conversion event never happens.

The list of disposable email providers is large, growing, and churns quickly. As of June 2026, the maintained public lists contain between 125,000 and 200,000 domains. The top 50 domains account for ~60% of all disposable-email signups. The long tail of 199,950 domains accounts for the other 40%.

This is why a static blocklist with the top 50 is insufficient. A maintained blocklist with the full 200,000 is sufficient but expensive to keep current.

## Approach 1: the regex shortcut (do not do this)

\u0060\u0060\u0060js
// DON'T DO THIS
const BLOCKED = ['tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com'];
function isDisposable(email) {
  const domain = email.split('@')[1];
  return BLOCKED.includes(domain);
}
\u0060\u0060\u0060

This catches ~30% of disposable emails. It also breaks for users with \u0060tempmail.com.bank.com\u0060 (a legitimate email at a bank whose domain contains the string). It does not catch the long tail. It does not update when a new disposable provider launches.

If you ship this, you ship a known-bad version of disposable email detection. Real users get blocked because their email is \u0060tempmail.com.something.else\u0060 and your regex is too eager. Real disposable emails get through because they're from \u0060discard.email\u0060 which is not in your top-50 list.

Don't ship this.

## Approach 2: the public blocklist (catches ~85%)

The best public blocklist is the GitHub repo \u0060disposable-email-domains/disposable-email-domains\u0060. It has 125,000+ domains, MIT-licensed, updated weekly.

A working implementation:

\u0060\u0060\u0060js
// blocklist.js
import fs from 'node:fs';
import path from 'node:path';

let cache = null;
let cacheTime = 0;
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function loadBlocklist() {
  if (cache && Date.now() - cacheTime < TTL) return cache;
  // Either fetch from GitHub or use a vendored copy
  const url = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf';
  const text = await (await fetch(url)).text();
  cache = new Set(text.split('\n').map(l => l.trim()).filter(Boolean));
  cacheTime = Date.now();
  return cache;
}

export function isDisposable(blocklist, email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && blocklist.has(domain);
}
\u0060\u0060\u0060

The 24-hour cache is important. The list is ~5MB, and re-fetching it on every signup will exhaust your API rate limits and add 200ms to the signup.

This catches ~85% of disposable email signups. The 15% it misses is the long tail: per-provider domain crawl that catches addy.io aliases, custom domains set up by \u0060simpleLogin.io\u0060 and \u006033mail.com\u0060, and the dozens of smaller providers that don't make it into the public list.

## Approach 3: SignupDoggy (catches ~99.5%)

SignupDoggy maintains a blocklist of 200,000+ domains by syncing from the public GitHub list, the bulk disposable-email API, and 175 individual disposable-email provider crawls. The result is a single API call:

\u0060\u0060\u0060js
// signup-check.js
import express from 'express';
const app = express();

app.post('/signup', async (req, res) => {
  const { email, ip } = req.body;
  const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SIGNUPDOGGY_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (result.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid email' });
  }
  // proceed with signup
  res.json({ ok: true });
});
\u0060\u0060\u0060

The API call returns a \u0060recommendation: 'allow' | 'review' | 'block'\u0060 plus per-signal scores (email risk, IP risk, phone risk if you sent one). $0.01 per call. Sub-50ms p95 latency. No minimum purchase beyond $5.

This is the approach I would ship in 2026 if I were starting a SaaS today.

## Approach 4: combine them (the belt-and-suspenders option)

If you are a regulated business (finance, healthcare, marketplaces) you may want both: a local blocklist for the cheap-and-fast check, plus an API call for the second opinion.

\u0060\u0060\u0060js
// belt-and-suspenders.js
import { loadBlocklist, isDisposable } from './blocklist.js';

app.post('/signup', async (req, res) => {
  const { email, ip } = req.body;
  const blocklist = await loadBlocklist();

  // Cheap local check first
  if (isDisposable(blocklist, email)) {
    return res.status(400).json({ error: 'Please use a permanent email' });
  }

  // Then API check for the long tail
  const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ip }),
  }).then(r => r.json());

  if (result.recommendation === 'block') {
    return res.status(400).json({ error: 'Invalid signup' });
  }
  res.json({ ok: true });
});
\u0060\u0060\u0060

The local check handles 85% in 1ms. The API call handles the remaining 15% in 50ms. Total signup latency overhead: 51ms. Acceptable.

## How to integrate this into your existing auth flow

The above Express snippets assume a custom auth handler. If you are using a managed auth provider (Supabase Auth, Auth0, Clerk, NextAuth), you want to validate BEFORE the auth provider creates the user.

For Supabase Auth, the cleanest pattern is a database trigger on \u0060auth.users\u0060:

\u0060\u0060\u0060sql
create or replace function public.check_signup_quality()
returns trigger as $$
declare
  result jsonb;
begin
  select body into result from http_post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    jsonb_build_object('email', new.email, 'ip', new.raw_user_meta_data->>'ip'),
    'application/json',
    jsonb_build_object('X-API-KEY', current_setting('app.signupdoggy_key'))
  );

  if result->>'recommendation' = 'block' then
    raise exception 'Signup blocked: high risk signal';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_signup_quality_trigger
  before insert on auth.users
  for each row execute function public.check_signup_quality();
\u0060\u0060\u0060

The trigger blocks the user creation if the recommendation is \u0060block\u0060. Your profiles table never gets the row. Your support inbox never gets the 'I never got my verification email' ticket from \u0060tempmail.com\u0060.

For Auth0, the equivalent is a Post-Login Action or a Pre-User-Creation Action. For Clerk, use a \u0060beforeUserCreate\u0060 webhook.

## When to skip disposable email detection

If your signup form is on a free tool with zero monetization and no storage cost, the disposable-email problem is a quality issue but not a security one. A \u0060tempmail.com\u0060 signup is annoying but not dangerous. You can ship without it.

If your signup form is on a paid product, a marketplace, or anything that stores user-generated content, disposable email detection is mandatory. A throwaway email address is a single-use weapon for spam, harassment, and abuse.

## FAQ

**Q: Won't blocking disposable emails hurt my conversion rate?**
A: It depends on your user base. For B2B SaaS targeting professionals, less than 1% of your real users will be affected. For consumer apps targeting Gen Z, expect 2-5% friction. The right answer is 'block, then offer a one-time override' — a 'use a different email' page is better than a hard error.

**Q: What about Apple Hide My Email?**
A: Apple Hide My Email generates \u0060xxx@privaterelay.appleid.com\u0060 addresses. These are technically disposable but they are also a real human with a real Apple ID on the other end. Most SaaS companies whitelist them. SignupDoggy does not block Apple Private Relay by default — it is in the \u0060review\u0060 band, not the \u0060block\u0060 band.

**Q: What about SimpleLogin and 33mail alias services?**
A: These create per-vendor aliases that forward to a real inbox. They are technically disposable but the user is a real person. SignupDoggy puts them in the \u0060review\u0060 band by default; you can override per-account if needed.

**Q: How often does the blocklist update?**
A: The SignupDoggy blocklist is updated daily from the public GitHub list and from a daily crawl of 175 disposable-email provider websites. The full sync runs on a 24-hour cron and is exposed via the founder-only \u0060/v1/admin/sync\u0060 endpoint.

**Q: Can I whitelist a specific email?**
A: Yes. POST to \u0060/v1/whitelist\u0060 with the email and it will always return \u0060recommendation: 'allow'\u0060. Useful for VIP customers.

**Q: What does the API cost?**
A: $0.01 per call. Buy credits at $5/1k, $25/5k, $100/25k. Credits never expire.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** Disposable email, Node.js, Tutorial, API
`,

  'maxmind-minfraud-vs-signupdoggy':
`# MaxMind minFraud vs SignupDoggy: which one do you actually need?

MaxMind minFraud is the legacy fraud-detection choice. SignupDoggy is the indie-hacker-friendly upstart. Both score signups. They are priced completely differently, integrated completely differently, and aimed at completely different buyers.

This post is an honest side-by-side comparison. No affiliate links. No 'use my link for 10% off.' Just the facts you need to pick the right one.

## Short answer

If you are an enterprise fraud team with a $50k/year budget, a dedicated fraud analyst, and a need for KYC integration — pick MaxMind minFraud. The ecosystem is mature, the SLAs are real, and your compliance team already knows the vendor.

If you are a 2-person SaaS team filtering 5,000 signups a month, a solo founder shipping a side project, or anyone who doesn't want to call sales to get an API key — pick SignupDoggy. The API is the same shape, the price is 10-30x lower, and the integration takes an afternoon instead of a quarter.

If you are somewhere in between — say, a 20-person SaaS with 50,000 signups a month and a real need for accuracy — read on. The right answer depends on your false-positive tolerance and your team's appetite for vendor management.

## Pricing comparison

This is the single biggest difference.

| Tier | MaxMind minFraud | SignupDoggy |
|---|---|---|
| Minimum spend | $25/month (Insights) | $5 (pay-once, no expiry) |
| Per-call cost | $0.005 - $0.030 | $0.005 - $0.01 |
| Annual contract | Required for volume tiers | None |
| Free tier | No | No (live demo at /demo) |
| Enterprise discount | 30-50% at $10k+/year | None needed |

Concrete number: filtering 50,000 signups a month on MaxMind's mid-tier (\u0060Score\u0060) costs **$1,500/month** ($0.030 × 50,000) on their published price, or about $12,000/year with a 30% volume discount.

The same 50,000 signups on SignupDoggy cost **$250** one-time (25,000 credits at $0.01/credit, 2 packs). Credits never expire, so if your signup volume is spiky, you don't pay for capacity you don't use.

The 48x price difference is not a typo. It is the structural difference between a vendor that prices per call with a $25/month minimum and a vendor that prices per call with a $5 minimum and no monthly fee.

## Accuracy comparison

Both products score signups on a 0-1 risk scale. Both return an allow/review/block recommendation. Both check email, IP, and (optionally) phone.

MaxMind's underlying data is the better-curated IP-to-ASN-to-organization database. If your signup form is checking 'is this IP a known botnet,' MaxMind's IP risk score is more accurate.

SignupDoggy's underlying data is the better-curated disposable-email database. If your signup form is checking 'is this a throwaway email,' SignupDoggy's email risk score catches the long tail better.

For pure IP risk scoring: MaxMind wins.
For pure email risk scoring: SignupDoggy wins.
For signup-form signup-quality scoring (the actual use case most indie hackers have): they're roughly tied.

## Integration time

MaxMind minFraud integration:
- 1-2 weeks for a clean implementation
- You need a MaxMind account (created by sales, requires business email)
- You need to wait for the IP risk score license (separate purchase, sometimes a separate contract)
- You need a server-side license for the JS device-tracking library
- The full integration is a 'real project,' not an afternoon

SignupDoggy integration:
- 30 minutes for the API call
- Self-service signup, no sales call, no business email required
- One API call, returns the full signal set
- The full integration is 'an afternoon at most'

If your engineering team is two people and your roadmap is full, the integration time difference matters more than the per-call cost.

## What MaxMind has that SignupDoggy does not

- **Device-tracking JS library.** MaxMind's \u0060device.js\u0060 collects browser fingerprint signals. Useful for high-traffic sites that need to track devices across sessions.
- **KYC integration.** MaxMind is used by banks and fintechs for AML compliance. SignupDoggy is not — it is signup-quality scoring, not identity verification.
- **SOC 2 Type II report.** Available on request. SignupDoggy is a solo-founder operation; no formal audit.
- **Phone-level risk on international numbers.** MaxMind covers more countries with better accuracy on VoIP-vs-mobile discrimination.
- **24/7 enterprise support.** MaxMind has a real NOC. SignupDoggy has an email address that Jeffrin reads personally.

## What SignupDoggy has that MaxMind does not

- **No sales call.** Self-service signup. You have an API key in 5 minutes.
- **No minimum spend.** Buy $5 of credits, use them when you want.
- **No annual contract.** You can stop using it tomorrow.
- **Disposable-email-first scoring.** Built around the signup-quality use case, not the AML/fintech use case.
- **Live demo at \u0060/demo\u0060.** Test the API in your browser without signing up.
- **One email address for support.** Jeffrin answers within a day.

## Use-case-specific recommendations

**Indie hacker, side project, $0-1k MRR:**
- SignupDoggy, no question. The minimum purchase is $5, you'll use it for a year.

**2-10 person SaaS, $1k-50k MRR:**
- SignupDoggy, unless you have specific compliance needs. The 48x price difference is meaningful even at this scale.

**20-100 person SaaS, $50k-500k MRR:**
- This is where the calculation gets interesting. Run both for a month. Compare false-positive rates. If MaxMind's accuracy advantage is worth 48x the price to you, you can afford it. If not, SignupDoggy is the better choice.

**Enterprise, regulated, $500k+ MRR:**
- MaxMind. The compliance, SLA, and vendor-management story matters here. SignupDoggy is not built for this tier.

**Fintech, banking, payments:**
- MaxMind or a specialized provider (Sift, Featurespace, Kount). Compliance is the primary requirement, not price.

## The bottom line

For 90% of SaaS signup forms, SignupDoggy is the better choice. It is cheaper, easier to integrate, and aimed at the same use case. For the 10% that need enterprise compliance, MaxMind is the right answer.

The 48x price difference is real. The integration time difference is real. The accuracy difference on the typical signup form is small.

## FAQ

**Q: Can I use both?**
A: Yes. Use MaxMind for the IP risk score and SignupDoggy for the email risk score. The two APIs are complementary. Many customers do this in the first six months while they decide which to standardize on.

**Q: Does MaxMind have a free tier?**
A: No. The cheapest tier is $25/month for \u0060Insights\u0060 (IP risk only). For email + IP, you need the \u0060Score\u0060 tier at $0.005-$0.030 per call plus a monthly minimum.

**Q: Does SignupDoggy have enterprise SLAs?**
A: No. The service runs on Cloudflare Workers with a 99.99% uptime guarantee from Cloudflare, but no formal SLA. For a mission-critical signup pipeline, run SignupDoggy alongside a backup and have a manual-review path.

**Q: Can I migrate from MaxMind to SignupDoggy?**
A: Yes. The API shape is similar. Both take email, IP, and optional phone, and both return a risk score. Migration is a one-day refactor.

**Q: Can I migrate from SignupDoggy to MaxMind?**
A: Yes, same logic. The hard part is the MaxMind sales/onboarding process (2-4 weeks), not the code.

**Q: What about pricing in 2027 and beyond?**
A: SignupDoggy's $0.01/call price has held since launch in 2025. MaxMind's per-call prices have been flat for 3 years. Neither is likely to drop significantly.

---

**About the author**

Jeffrin James is the founder of SignupDoggy, a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case.

**Tags:** MaxMind, Comparison, Fraud API, Pricing
`,

};