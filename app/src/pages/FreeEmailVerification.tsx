// /free-email-verification — landing page targeting email-validation intent.
//
// Targets: free email validation API, email verification API free, free email
// checker, free email validator, no signup email verification.
//
// Differentiator from /disposable-checker (which targets disposable-only):
// this page covers ALL email validation (syntax + MX + SMTP + role-based +
// disposable), and positions SignupDoggy as the broader free option.

import StaticPage from './StaticPage';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

const BODY = `Looking for a free email validation API that actually ships? This page covers what "email validation" really means, what the free options are in 2026, and why SignupDoggy's free disposable email checker is the best starting point for indie SaaS teams.

## What "email validation" actually means

When a vendor says "email validation," they usually mean **one or more** of these checks:

1. **Syntax validation** — does the email have an @ sign, a valid local part, a domain with a TLD? (Cheap, fast, milliseconds.)
2. **MX record check** — does the domain have mail servers configured to receive email? (DNS lookup, ~50ms.)
3. **SMTP probe** — does the mailbox actually exist? (Slow — 100ms to 2 seconds. Some servers block this as spam.)
4. **Role-based detection** — is the address shared (admin@, support@, abuse@)?
5. **Disposable detection** — is the address from a known throwaway provider?
6. **Free provider detection** — is the address from gmail/yahoo/outlook?
7. **Typo suggestion** — did the user mean gmial.com → gmail.com?
8. **Catch-all detection** — does the domain accept all addresses (making SMTP probe unreliable)?

**Cheap APIs** do #1, #4, #5, #6, #7.
**Mid-range APIs** do #1–#5.
**Expensive APIs** do #1–#8 (SMTP probing is expensive — you risk your IPs being blacklisted).

## What the free options are in 2026

Free email validation APIs ranked:

### 1. SignupDoggy free disposable email checker (this site)

- **Free**, in-browser, no signup
- Covers: disposable email detection (200K+ domains), role-based detection, free provider detection
- **Missing**: SMTP probing (we don't do SMTP probing — it's slow and risks blacklisting)
- **Use case**: instant disposable email detection at signup

### 2. AbstractAPI

- **Free tier**: 100 requests/month (then paid)
- Covers: syntax, MX, SMTP, disposable, free provider
- **Missing**: nothing, but the 100/month limit is brutal

### 3. Mailcheck.ai

- **Free tier**: 200 requests/month
- Covers: syntax, MX, disposable
- **Missing**: SMTP probing

### 4. Verifalia

- **Free tier**: 25 one-shot credits (not per month — total)
- Covers: syntax, MX, SMTP, disposable
- **Missing**: usable free tier for production

### 5. Hunter.io Email Verifier

- **Free tier**: 50 requests/month
- Covers: syntax, MX, SMTP
- **Missing**: disposable detection (Hunter is lead-generation-first)

### 6. ZeroBounce

- **Free tier**: 100 one-shot credits
- Covers: syntax, MX, SMTP, spam-trap
- **Missing**: usable free tier for production

## Why SignupDoggy's free tier is different

Most "free tier" APIs give you **N requests per month** (N is small — 25 to 200). After that, you pay.

SignupDoggy gives you:

- **Unlimited free in-browser disposable email checks** at /disposable-checker (no signup)
- **5,000 free API calls if you sign up** for a Solo pack ($5)
- **No monthly cap** on the free tier at /disposable-checker (because it's client-side — the 200K domain blocklist ships in the JS bundle)

If you only need disposable email + role-based + free provider detection (which is 95% of the actual problem), the in-browser tool covers you forever, no signup.

If you need MX, SMTP, spam-trap, catch-all detection, that's a different product (and we don't currently do SMTP probing — it's slow and risks blacklisting).

## When to use the in-browser checker vs the paid API

**Use /disposable-checker (free, in-browser)** when:
- You need disposable email detection at signup
- You want zero latency overhead (no API roundtrip)
- You're processing high volume (the in-browser tool has zero server cost)
- You want zero data sharing (the check happens entirely client-side)

**Use the SignupDoggy paid API** when:
- You also need IP risk scoring (Tor/VPN detection)
- You need phone number validation
- You want server-side enforcement (the in-browser tool can be bypassed by a determined attacker)

The two complement each other. Most production SaaS uses both: the in-browser checker as a UX nicety (instant feedback to the user) + the API as the authoritative gate.

## How to use the free in-browser checker

1. Go to https://signupdoggy.pages.dev/disposable-checker
2. Type or paste an email
3. Get instant verdict: SAFE / DISPOSABLE / ROLE-BASED / FREE PROVIDER

No signup, no API key, no tracking, no data sent to our servers. The check happens entirely in your browser using the 200K domain blocklist that ships with the page.

For production use, sign up at /pricing and get 1,000 API calls for $5. Credits never expire.

## How to integrate the paid API

If you outgrow the free in-browser tool, the paid API is one POST call:

\`\`\`js
const r = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip: req.ip }),
}).then(r => r.json());

if (r.recommendation === 'block') return res.status(400).json({ error: 'Invalid email' });
\`\`\`

That's it. Sub-50ms p95. $0.01/call. $5 minimum. No monthly fee.

## What about SMTP probing?

We deliberately don't do SMTP probing. Here's why:

- **Slow** — 100ms to 2 seconds per check
- **Risky** — your IP gets blacklisted by major ESPs (Gmail, Outlook, Yahoo) if you probe too aggressively
- **Unreliable** — catch-all domains (which accept all addresses) make SMTP probe results meaningless
- **Privacy** — you're pinging someone's mail server without their consent

For disposable email + role-based + free provider detection, you don't need SMTP. You have the blocklist. The blocklist is updated daily, the check is 5ms, and it's free.

For SMTP probing specifically, use a dedicated service like ZeroBounce or Kickbox. We don't pretend to do everything — we do disposable + role + free + IP + phone, and we do it well.

## Get started

[Try the free disposable email checker →](/disposable-checker) — no signup, no API key, no tracking.

[Buy credits at /pricing →](/pricing) — $5 minimum, credits never expire.

Or [read the integration tutorial →](/blog/disposable-email-detection-nodejs-tutorial) for Node.js code, or [Supabase Auth integration →](/blog/signup-validation-supabase-auth-integration) for Supabase code.`;

export default function FreeEmailVerification() {
  return (
    <StaticPage
      config={SEO_ROUTES.freeEmailVerification}
      body={BODY}
      bannerCmd="./email --verify --free"
      bannerStatus="BROWSER-SIDE · NO SIGNUP"
    />
  );
}