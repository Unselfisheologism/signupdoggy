# SignupDoggy API Documentation

> One endpoint. One API key. One decision: `allow` · `review` · `block`. P95 latency: 40 ms. Average response: 4 KB.

<!-- aeo:source=app/src/pages/Docs.tsx -->

## Authentication

Pass your API key in the `X-API-Key` header. Create a key from the dashboard after buying credits.

```http
X-API-Key: $SIGNUPDOGGY_KEY
```

The key is a 48-character hex string prefixed with `sd_`. It is bound to your account and is rate-limited per-key.

## Endpoints

### `POST /v1/check` — Evaluate a signup

Pass an email, an IP, or both. Return a 0–1 risk score plus per-signal breakdown. **This is the only endpoint most users need.**

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | No* | Email address to check |
| `ip` | string | No* | IP address to check |
| `phone` | string | No | Phone number to check (E.164 format, e.g. `+14155551234`) |

*At least one of `email` or `ip` is required. `phone` is optional and only used when present.

**Response (200 OK)**

```json
{
  "recommendation": "block",
  "risk_score": 0.97,
  "latency_ms": 38,
  "signals": {
    "disposable_email": true,
    "vpn_or_proxy": true,
    "tor_exit_node": true,
    "role_based": false
  },
  "email": {
    "domain": "10minutemail.com",
    "risk_score": 95
  },
  "ip": {
    "asn": "AS9009",
    "risk_score": 88
  }
}
```

| Field | Type | Description |
|---|---|---|
| `recommendation` | `"allow"` \| `"review"` \| `"block"` | Discrete decision. `allow` if score < 0.3, `review` if 0.3–0.7, `block` if ≥ 0.7. |
| `risk_score` | 0–1 | Overall risk. Weighted sum of the per-signal scores. |
| `latency_ms` | number | Time taken on our end, in milliseconds. |
| `signals.disposable_email` | boolean | True if the email domain is in our blocklist. |
| `signals.vpn_or_proxy` | boolean | True if the IP is in a known VPN / hosting / proxy ASN. |
| `signals.tor_exit_node` | boolean | True if the IP is a current Tor exit node. |
| `signals.role_based` | boolean | True if the email is `admin@`, `info@`, `support@`, etc. |
| `email.domain` | string | The domain part of the email address. |
| `email.risk_score` | 0–100 | Per-email risk score. |
| `ip.asn` | string | The Autonomous System Number for the IP. |
| `ip.risk_score` | 0–100 | Per-IP risk score. |

### Examples

**cURL**

```bash
curl -X POST https://api.signupdoggy.dev/v1/check \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
```

**Node.js**

```js
const res = await fetch('https://api.signupdoggy.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.SIGNUPDOGGY_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    ip: '1.2.3.4',
  }),
});
const data = await res.json();
if (data.risk_score > 0.7) return block(data);
```

**Python**

```python
import requests

res = requests.post(
    'https://api.signupdoggy.dev/v1/check',
    headers={'x-api-key': os.environ['SIGNUPDOGGY_KEY']},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
if data['risk_score'] > 0.7:
    return block_user(data)
```

### `POST /v1/blacklist` — Add to your account blacklist

Add an email or IP to your per-account blacklist. Blacklisted values always return `block` regardless of other signals.

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `"email"` or `"ip"` |
| `value` | string | Yes | The value to block |

**cURL**

```bash
curl -X POST https://api.signupdoggy.dev/v1/blacklist \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "email", "value": "bad@actor.com"}'
```

Bulk import (1000+ entries) is available on the Scale plan via the dashboard.

### `GET /v1/stats` — Check credits and usage

Returns your current credit balance, month-to-date usage, and per-endpoint counters.

**cURL**

```bash
curl https://api.signupdoggy.dev/v1/stats \
  -H "x-api-key: $SIGNUPDOGGY_KEY"
```

**Response (200 OK)**

```json
{
  "credits_remaining": 4732,
  "credits_used_mtd": 268,
  "requests_by_endpoint": {
    "check": 250,
    "blacklist": 14,
    "stats": 4
  },
  "rate_limit": {
    "limit_per_minute": 600,
    "remaining_this_minute": 596
  }
}
```

## Pricing (inline)

**$0.01 per request** after your credits run out. Credits never expire. No monthly fee. No sales call. See the full [Pricing page](./pricing.md) for the three top-up packs (Solo / Pro / Scale) and the three monthly subscriptions (Plus / Super / Ultra).

## Errors

| Status | Meaning |
|---|---|
| `400` | Bad request. Missing or invalid parameters. |
| `401` | Unauthorized. Missing or invalid API key. |
| `402` | Out of credits. Buy more. |
| `429` | Rate limited. Back off. Default: 600 requests per minute per key. |
| `500` | Internal error. Email [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com) — Jeffrin answers support directly. |

## Rate limits

| Plan | Per-minute | Per-day | Burst |
|---|---|---|---|
| Solo | 60 | 5,000 | 10 |
| Pro | 300 | 50,000 | 50 |
| Scale | 1,200 | 500,000 | 200 |
| Subscription (Plus/Super/Ultra) | 300 | 50,000 | 50 |

Rate-limited responses include a `Retry-After` header (in seconds).

## SDKs

We do not ship official SDKs. The API is plain HTTPS + JSON; the snippets above are 5 lines in any language. If you need a typed wrapper, a `fetch()` call is enough.

## Webhooks (Scale plan)

The Scale plan can register a webhook URL. SignupDoggy POSTs to your URL whenever a check returns a `recommendation: "block"`, so you can run a downstream side-effect (e.g. auto-quarantine the user, log to your SIEM, page your team).

```http
POST /your-webhook-url HTTP/1.1
Content-Type: application/json
X-Signupdoggy-Signature: hmac-sha256=...

{
  "event": "check.block",
  "timestamp": "2026-06-17T10:42:18Z",
  "data": { /* same body as the /v1/check response */ }
}
```

The `X-Signupdoggy-Signature` header is an HMAC-SHA256 of the body using your API key as the secret. Verify it before processing the payload.

## About this API

This API is the public reference for the SignupDoggy fraud-detection service. It is the same API used by the SignupDoggy dashboard, the live playground on the homepage, and every paying customer. The endpoint is hosted on Cloudflare Workers; the blocklists are stored in Cloudflare KV and refreshed on a cron schedule.

For questions, write to [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com). For the legal terms of using this API, see the [Terms of Service](./terms.md). For what data we collect and what we don't, see the [Privacy Policy](./privacy.md).
