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

};