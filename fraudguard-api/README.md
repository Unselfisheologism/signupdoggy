# 🛡️ RegisterGuardian API

> Stop fake signups in **5 minutes**. One API call. **$0.01/request**. No minimum. No contract.

**Built for builders. Priced for startups. Powered by open data.**

RegisterGuardian is a serverless fraud prevention API that detects disposable emails, Tor exit nodes, hosting/VPN providers, and custom blacklisted entities — all from a single endpoint. Runs on Cloudflare Workers with zero external dependencies.

---

## ⚡ Quick Start

```bash
# Get your API key (shown once)
curl -X POST https://registerguardian.dev/v1/keys

# Check an email and IP address
curl -X POST https://registerguardian.dev/v1/check \
  -H "x-api-key: rg_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'

# See the result
# → { "email": { "is_disposable": false, ... }, "overall_risk": "low", "recommendation": "allow" }
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Disposable Email Detection** | Checks against 100,000+ known disposable email domains. Synced daily from open-source blocklists. |
| **Tor Exit Node Detection** | Real-time Tor exit node IPs. Updated hourly from `check.torproject.org`. |
| **VPN/Proxy/Hosting Detection** | Identifies commercial hosting provider IPs (AWS, DigitalOcean, GCP, Azure, Hetzner, OVH, Linode, and 100+ more). |
| **Custom Blacklists** | Per-user email and IP blacklists managed via API. |
| **Rate Limiting** | No rate limits. You pay per request — $0.01 each. |
| **Usage Stats** | Response headers + `/v1/stats` endpoint — no dashboard needed. |

---

## 📋 API Reference

### `POST /v1/check` — Main fraud check

**Headers:**
- `x-api-key` (required) — Your API key
- `Content-Type: application/json`

**Body:** (at least one field required)
```json
{ "email": "user@example.com", "ip": "1.2.3.4" }
```

**Response:**
```json
{
  "email": {
    "is_disposable": true,
    "domain": "tempmail.com",
    "risk_score": 85
  },
  "ip": {
    "is_tor": false,
    "is_proxy": true,
    "is_hosting": true,
    "asn": "AS16509",
    "risk_score": 72
  },
  "overall_risk": "high",
  "recommendation": "block"
}
```

**Response Headers:**
| Header | Description |
|---|---|
| `X-Fraud-Blocked-Today` | Total blocks today on your account |
| `X-Fraud-Blocked-Reason` | Reason this request was blocked |
| `X-Estimated-Cost` | Estimated cost of today's usage |

### `POST /v1/keys` — Create API key
```bash
curl -X POST https://registerguardian.dev/v1/keys
# → { "api_key": "fg_...", "user_id": "user_...", "created": "2024-01-01" }
```

### `POST /v1/blacklist` — Custom blacklist management
```bash
curl -X POST https://registerguardian.dev/v1/blacklist \
  -H "x-api-key: rg_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"type": "email", "value": "bad@spammer.com", "action": "add"}'
```

### `GET /v1/stats` — Usage statistics
```bash
curl -H "x-api-key: rg_your_key_here" https://registerguardian.dev/v1/stats
```

---

## 💰 Pricing

| Price | What you get |
|---|---|
| **$0.01/request** | No tiers. No minimum. No subscription. You pay exactly $0.01 per API call. |

**Why this is cheaper than SignupGate:**
SignupGate charges $29/month minimum even if you use 100 requests. RegisterGuardian charges a flat $0.01/request — at 1k requests that's $10. **No minimum. No commitment. No tiers.**

Infrastructure cost at 1M requests: **< $5/month** (Cloudflare KV + Workers).

---

## 🛠️ SDK Examples

### Node.js
```typescript
const res = await fetch('https://registerguardian.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': 'rg_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'user@example.com', ip: '1.2.3.4' }),
});
const data = await res.json();
console.log(data.recommendation); // "allow" | "review" | "block"
```

### Python
```python
import requests

res = requests.post(
    'https://registerguardian.dev/v1/check',
    headers={'x-api-key': 'rg_your_key_here'},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
print(data['recommendation'])
```

### cURL
```bash
curl -X POST https://registerguardian.dev/v1/check \
  -H "x-api-key: rg_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
```

---

## 🚀 One-Command Deploy

```bash
# Prerequisites: Node.js 18+, a Cloudflare account, and wrangler logged in

git clone https://github.com/yourusername/registerguardian-api.git
cd registerguardian-api

# Install dependencies
npm install --include=dev

# Create KV namespaces (one-time setup)
npx wrangler kv:namespace create "DISPOSABLE_EMAILS"
npx wrangler kv:namespace create "TOR_EXIT_NODES"
npx wrangler kv:namespace create "HOSTING_IP_RANGES"
npx wrangler kv:namespace create "API_KEYS"
npx wrangler kv:namespace create "USAGE_LOG"
npx wrangler kv:namespace create "USER_BLACKLISTS"
npx wrangler kv:namespace create "SYNC_LOGS"

# Copy the returned IDs into wrangler.toml under each [[kv_namespaces]] block

# Deploy
npx wrangler deploy

# Verify it works
curl https://registerguardian.dev/v1/keys
```

---

## 🧪 Testing

```bash
# Unit + integration tests
npx vitest run

# Load test (requires k6: https://k6.io)
k6 run tests/load/k6-script.js
```

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client    │────▶│  Cloudflare      │────▶│  KV Store    │
│ (your app)  │     │  Worker (Hono)   │     │  (7 namesp.) │
└─────────────┘     │                  │     └──────────────┘
                    │  POST /v1/check  │     ┌──────────────┐
                    │  POST /v1/keys   │     │  Cron Trig.  │
                    │  POST /v1/black. │     │  (daily/hrly)│
                    │  GET  /v1/stats  │     └──────────────┘
                    │  GET  /docs      │
                    │  GET  /openapi   │
                    └──────────────────┘
```

**Data sync flow:**
1. Daily at 3 AM UTC: Sync disposable email domains from GitHub
2. Hourly: Sync Tor exit nodes from Tor Project
3. Monthly: Sync MaxMind ASN data for hosting provider detection

All data cached in Cloudflare KV for O(1) lookups with <50ms p95 latency.

---

## 🔒 Authentication

- API keys are 48-character random strings prefixed with `rg_`
- Pass via `x-api-key` header on every request (except `/v1/keys`)
- Keys are stored in KV and shown only once on creation
- All keys billed at $0.01 per request — no tiers, no limits

---

## 📊 Success Metrics

| Metric | Target |
|---|---|
| P95 Latency | <50ms under 100 req/sec load |
| Billing Accuracy | Each request tracked at $0.01 |
| Blocklist Sync | Runs automatically on schedule |
| Time to Integrate | <5 minutes from first API call |
| Infra Cost | <$5/month at 1M requests |
| Stats Accuracy | Real-time, matches response headers |

---

## 📄 License

MIT — Built with ❤️ for indie hackers and bootstrapped startups.

---

## 🔗 Links

- [OpenAPI Spec](/openapi.json)
- [API Documentation](/docs)
- [GitHub](https://github.com/yourusername/registerguardian-api)
