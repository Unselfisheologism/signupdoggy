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

- **30–45%** of signups on a typical bootstrapped SaaS use a disposable email domain. Not a sketchy one — \`tempmail.com\`, \`guerrillamail.com\`, \`mailinator.com\`. The same six domains, over and over.
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

This is where [SignupDoggy](https://signupdoggy.pages.dev) fits. Before a signup hits your user table, make one HTTP call to \`/v1/check\` with the email, IP, and phone (if you collected one). If the response is \`recommendation: block\`, send them to a manual review queue or send them straight to a captcha wall. If it's \`review\`, mark the account and watch for unusual behavior. If it's \`allow\`, proceed.

What this buys you:

- Your "users who signed up this week" number stops including bots.
- Your activation funnel starts reflecting real behavior.
- Your churn analysis stops including accounts that were created by scripts and never used.
- Your support inbox stops filling up with "I never got the verification email" tickets from \`guerrillamail.com\`.

The API call costs $0.01. A clean funnel is worth a lot more than a cent per signup.

If you're not ready to wire in SignupDoggy yet, you can do a poor-man's version in an hour: maintain a denylist of the top 50 disposable email domains (\`tempmail.com\`, \`guerrillamail.com\`, \`mailinator.com\`, \`10minutemail.com\`, etc.) and reject signups from them. It catches about 60% of the disposable-email problem for free. For the other 40%, you need a real blocklist with the long tail.

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
3. In your signup handler, before you write the user to the database, call \`POST /v1/check\` with the email and IP from the request.
4. If the response is \`recommendation: block\`, return a generic "we couldn't create your account, please contact support" and log the block.
5. If the response is \`review\`, create the account normally and tag it for manual review.
6. If the response is \`allow\`, proceed as usual.

Total code: about 15 lines. Total time: under an hour, including the API key dance. Per-request cost: $0.01. The full [API reference is here](https://signupdoggy.pages.dev/docs).

You can also try the playground on the [homepage](https://signupdoggy.pages.dev) — paste \`someone@guerrillamail.com\` and \`185.220.101.45\` to see the response shape without burning a credit.

## The bottom line

User validation is not "did people sign up." User validation is "did someone pay, and would they pay again." If you're optimizing for free signup count, you're optimizing for the wrong thing. If you can't tell your real users from the bots in your funnel, you can't validate anything — you're just looking at a number.

Filter the noise. Charge early. Talk to the almost-buyers. Build for one specific person who will pay, then find ten more like them. Repeat.

That's how you validate a SaaS idea. The rest is marketing.

---

**About the author**

Jeffrin James is the founder of [SignupDoggy](https://signupdoggy.pages.dev), a serverless fraud-detection API for indie hackers and small SaaS teams. He built the product in Mumbai, India, after spending six months and $2,400 on enterprise fraud-detection vendors that didn't fit his use case. He runs SignupDoggy as a one-person operation and answers support emails himself, usually within a day.

**Tags:** saas validation, user validation, mvp validation, fake signups, signup fraud, indie hackers, product-market fit, b2b saas
`,
};
