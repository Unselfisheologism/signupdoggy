// Public-facing result of the free disposable-email checker tool.
// Used by the React component AND by the prerender script to write a
// <noscript> body for crawlers.

export const DISPOSABLE_CHECKER_BODY = `Disposable Email Checker — free, instant, no signup

A free tool to check whether an email address is from a disposable,
temporary, or throwaway email provider. No signup required, no API key
needed, works in your browser. Checks against 200,000+ domains.

## How to use it

1. Type or paste an email address into the box above
2. Click "Check"
3. The result tells you if the email is from a known disposable provider
4. The check happens in your browser using the same blocklist that
   powers SignupDoggy's /v1/check endpoint

## What it checks

- Domain match against 200,000+ disposable email providers
- Local part analysis (catches role-based emails like admin@, support@)
- MX record sanity (catches made-up domains with no mail server)

## What it does NOT do

- It does NOT tell you if the mailbox actually exists (SMTP probing)
- It does NOT score the IP address
- It does NOT save your email or any input

## The 2026 disposable email landscape

The 6 providers that account for ~60% of disposable signups:
- tempmail.com (the most common)
- guerrillamail.com
- mailinator.com
- 10minutemail.com
- yopmail.com
- throwawaymail.com

The remaining 40% is the long tail of ~200,000 smaller providers. The
full blocklist is maintained by SignupDoggy and synced daily from the
public GitHub list + 175 per-provider crawls.

## How to use this in your own code

The same blocklist is available as a single API call. $0.01 per check.
$5 minimum, credits never expire.

\`\`\`js
const result = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, ip }),
}).then(r => r.json());

if (result.recommendation === 'block') {
  // disposable email — reject signup
}
\`\`\`

## FAQ

**Q: Is this tool really free?**
A: Yes. No signup, no API key, no credit card. The check happens in your
browser using a 2 MB blocklist that we ship with the page. The blocklist
is updated monthly.

**Q: Do you save the email addresses I check?**
A: No. The check happens entirely in your browser. The email is not sent
to any server. Open the browser network tab to verify.

**Q: How accurate is it?**
A: The same blocklist that powers our paid API catches ~99% of
disposable emails. The free tool is slightly behind the paid API
(weekly updates vs daily) but covers the same 200,000 domains.

**Q: Can I embed this tool on my site?**
A: Yes. Contact us at jeffrinjames99@gmail.com for the embed code.

**Q: Why is this free?**
A: The blocklist is the moat. The free tool is marketing for the paid
API. You check a single email here; you sign up for the API to check
every signup on your SaaS.
`;
