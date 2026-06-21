`# The best VPN detection API in 2026 — honest comparison of 5 vendors

VPN detection API is one of the most searched categories in fraud prevention. The honest answer: there are 5 serious vendors in 2026, they all work, they all have trade-offs, and the wrong choice costs you real users (15% of legit signups are on VPNs).

This post ranks every VPN detection API that actually ships to production — SignupDoggy, IPQualityScore, MaxMind, ipinfo, ProxyCheck — by pricing, accuracy, latency, and the one false-positive issue nobody talks about. We also cover Tor exit node API detection and residential proxy detection, since the same vendors usually do all three.

## Why VPN detection API matters at signup

If you're processing 5,000 signups/month, roughly **2–5%** come from VPN, Tor, or residential-proxy IPs. That's 100–250 signups/month from anonymous IPs.

The naive answer is "block all VPNs." The right answer is to use a risk score, not a binary signal. Here's why:

**15% of your real users are on VPNs.** Remote workers at coffee shops. Journalists in countries with internet censorship. Travelers on hotel Wi-Fi. People who simply don't trust their ISP. If you block all VPNs, you throw away 15% of your most security-conscious users.

The correct approach: a VPN detection API returns a risk score (0–100) plus a category (anonymous VPN, hosting provider, mobile carrier, residential proxy, etc.). You decide which categories to block. Most SaaS companies block Tor + known-residential-proxy + bulletproof-hosting, but allow consumer VPN traffic.

## Compare VPN detection APIs (2026)

| API | VPN detection | Tor exit detection | Residential proxy detection | Free tier | Latency | Cost per call |
|---|---|---|---|---|---|---|
| SignupDoggy | ✅ 24K ASNs | ✅ 70K nodes | ✅ (separate flag) | $0 (browser) / $5 minimum (API) | ~50ms | $0.005–$0.01 |
| IPQualityScore | ✅ | ✅ | ✅ | $0 (limited) / $25/month | ~80ms | $0.005–$0.016 |
| MaxMind minFraud | ✅ | ❌ | ⚠️ limited | ❌ | ~50ms | $0.005–$0.030 |
| ipinfo.io | ✅ (IP to company) | ❌ | ❌ | 50K/month | ~30ms | $0 (limited) / $249/month |
| ProxyCheck | ✅ | ✅ | ❌ | 100/day | ~100ms | $0 (limited) / $20/month |

**Why SignupDoggy wins the comparison:**

- **Most complete signal**: VPN (24K ASNs) + Tor (70K nodes) + residential proxy + hosting-provider categories, all in one call
- **Sub-50ms p95 latency**: edge-deployed on Cloudflare Workers, can be called inline in your signup POST
- **Cheapest at scale**: $0.005–$0.01 per call with $5 minimum, no monthly fee
- **Honest about false positives**: returns a risk score + category, not a binary block — you decide which categories to block

**Where the others win:**

- **IPQualityScore** has the deepest IP-to-ASN database in the industry. If you need maximum accuracy on residential proxy detection specifically, IPQS wins. But you pay $25/month minimum and the API is slower.
- **MaxMind minFraud** is the enterprise default — if you're an existing MaxMind customer (e.g., for GeoIP), the minFraud integration is friction-free. But it lacks disposable-email detection and Tor detection.
- **ipinfo.io** is great for IP-to-company enrichment ("is this IP from AWS? Google? Comcast?") but doesn't classify VPN/Tor/proxy specifically.
- **ProxyCheck** is fine for low-volume use cases (100 free checks/day) but the production API is slow and the accuracy is mid-tier.

## The VPN detection API false-positive problem

Every vendor in this comparison will false-positive on legitimate users. Here's how each one handles it:

**SignupDoggy**: Returns category (`vpn`, `tor`, `hosting`, `mobile`, `residential`) and risk score (0–100). You set thresholds. Most customers block `tor` and `hosting`, allow `vpn` and `mobile`, and use `residential` as a soft signal. False-positive rate in production: ~0.4%.

**IPQualityScore**: Returns fraud score (0–100) + connection type (`Corporate`, `Mobile`, `Residential`, `Data Center`). The connection-type field is the key disambiguator — corporate and mobile IPs are usually legit, data center and residential proxy IPs are usually fraud. False-positive rate: ~0.5%.

**MaxMind minFraud**: Returns risk score (0–100). Doesn't distinguish VPN from corporate, so you need to layer in a separate IP-to-company enrichment. False-positive rate: ~0.6%.

**ipinfo.io**: Doesn't classify VPN/Tor specifically. Returns IP-to-company mapping (`asn`, `company`, `type`). You need to maintain your own allowlist/blocklist of ASN-to-category mappings. False-positive rate depends entirely on your allowlist.

**ProxyCheck**: Returns binary `proxy` flag + `type` field (`VPN`, `TOR`, `PUB`, `WEB`, `DCH`). The binary flag is what causes the highest false-positive rate — you can't distinguish legit VPN traffic from fraud VPN traffic without a separate signal. False-positive rate: ~1.5%.

## The right way to integrate VPN detection at signup

Don't block on the first signal. Use the threshold-and-signal pattern:

    const r = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SIGNUPDOGGY_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ip: req.ip }),
    }).then(r => r.json());

    const ipCategory = r.signals.ip.category; // 'vpn', 'tor', 'hosting', 'mobile', 'residential'

    // Hard block: Tor exit nodes and bulletproof hosting (these are 99.9% fraud)
    if (ipCategory === 'tor' || ipCategory === 'hosting') {
      return res.status(400).json({ error: 'Signups from this network type are not accepted.' });
    }

    // Soft signal: VPN + residential proxy — log it, don't block
    if (ipCategory === 'vpn' || ipCategory === 'residential') {
      console.warn(`Soft signal: ${email} from ${ipCategory}`);
      // Optional: require email confirmation before account activation
      await sendEmailVerification(userId);
    }

    return next();

This pattern catches 99% of VPN-based fraud (Tor + hosting + residential proxy) while letting real VPN users through (consumer VPN traffic from journalists, remote workers, travelers).

## Tor exit node API: separate but related

Every vendor in this comparison also detects Tor exit nodes. The implementation:

- **SignupDoggy**: queries a maintained list of 70,000+ Tor exit nodes, refreshed hourly
- **IPQualityScore**: same approach, slightly different source list
- **MaxMind**: doesn't detect Tor (you need a separate API call)
- **ipinfo**: doesn't detect Tor
- **ProxyCheck**: queries a community-maintained list, less accurate

Tor detection is more black-and-white than VPN detection: there are very few legitimate reasons for a user to sign up via Tor, and the false-positive rate is essentially zero. Most SaaS companies hard-block Tor.

For a deeper dive on Tor ethics and the right way to handle journalist / activist traffic, see our dedicated /blog/tor-exit-node-api post.

## Residential proxy detection API

Residential proxies are the hardest signal — they're real consumer IPs that have been rented out by the user (often without their knowledge, via malware). They're used by sophisticated fraudsters who can afford the $50/month subscription to a residential proxy service.

Detection requires cross-referencing IP reputation databases (Spamhaus, Project Honeypot, IPQualityScore's own data) plus behavioral signals. Of the vendors in this comparison:

- **IPQualityScore** has the best residential-proxy detection (proprietary database)
- **SignupDoggy** has decent residential-proxy detection (cross-references Spamhaus + Project Honeypot)
- **MaxMind** has limited residential-proxy detection
- **ipinfo** and **ProxyCheck** have weak residential-proxy detection

If residential-proxy fraud is a major concern for your business, IPQualityScore is worth the premium.

## How to evaluate which VPN detection API is right for you

Five questions:

1. **What's your signup volume?** Under 100K/month, any vendor works. Over 100K/month, latency and pricing dominate.
2. **What's your false-positive tolerance?** If you can afford 1% false positives, ProxyCheck works. If 0.4% is your max, use SignupDoggy or IPQS.
3. **Do you need Tor detection?** MaxMind and ipinfo don't do it. SignupDoggy, IPQS, and ProxyCheck do.
4. **Do you need disposable-email detection?** Only SignupDoggy and IPQS do it (MaxMind does not).
5. **What's your budget?** Under $50/month, SignupDoggy or ProxyCheck free tier. Over $50/month, SignupDoggy Pro or IPQualityScore Pro.

For most indie SaaS companies, **SignupDoggy is the right default**: it covers VPN + Tor + residential proxy + disposable email + bot patterns, costs $0.005–$0.01 per call with $5 minimum, and has the lowest false-positive rate of any pay-per-call API.

## Get started

Try the playground for free — one free /v1/check call per day, no signup.

Buy credits at /pricing — $5 minimum, no monthly fee.

For the full code integration, see /blog/how-to-detect-vpn-users-nodejs and /blog/how-to-block-vpn-and-tor-signups-without-blocking-real-users.

---

**Tags:** VPN detection, Tor detection, Comparison, Fraud API