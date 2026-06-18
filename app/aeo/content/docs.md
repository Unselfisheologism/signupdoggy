# SignupDoggy API Documentation

<!-- aeo:source=app/src/pages/Docs.tsx -->

## Base URL

All requests go to the deployed Worker:

```
https://signupdoggy-api.jeffrinjames99.workers.dev
```

The previous `api.signupdoggy.dev` and `signupdoggy.dev` hostnames are not
provisioned in DNS. If a custom domain is later attached to the Worker, update
the base URL here and in `app/src/pages/Docs.tsx` in one place.

## Authentication

Pass your API key in the `X-API-Key` header. Keys are 52-character strings
prefixed with `sd_` (the prefix + 48 lowercase alphanumeric characters). Create
a key from the dashboard or by calling `POST /v1/keys` (no auth header
required).

```http
X-API-Key: $SIGNUPDOGGY_KEY
```

## Endpoints

### `POST /v1/keys` — Create a new API key

Mint a key without authentication. Returns `201 Created`. The response body
contains the plain `api_key` — it is never shown again.

```bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/keys
```

Response:

```json
{
  "api_key": "sd_abc...xyz",
  "user_id": "user_1710000000000",
  "created": "2026-06-18",
  "message": "Save this API key — it will not be shown again."
}
```

### `POST /v1/check` — Evaluate a signup

Pass at least one of `email`, `ip`, or `phone`. Returns per-input findings,
an `overall_risk` band, and a `recommendation`. Costs one credit per call.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | No* | Email address to check |
| `ip` | string | No* | IPv4 address to check |
| `phone` | string | No* | Phone number to check (E.164, e.g. `+141****1234`) |

*At least one of `email`, `ip`, or `phone` is required.

**Response (200 OK)**

```json
{
  "email": {
    "is_disposable": true,
    "domain": "10minutemail.com",
    "risk_score": 85
  },
  "ip": {
    "is_tor": true,
    "is_proxy": false,
    "is_hosting": true,
    "asn": "AS9009",
    "risk_score": 90
  },
  "phone": null,
  "overall_risk": "high",
  "recommendation": "block"
}
```

| Field | Type | Description |
|---|---|---|
| `email` | object \| null | Email findings, or null if no `email` was sent |
| `email.is_disposable` | boolean | Domain is in the disposable-email blocklist |
| `email.domain` | string | Normalized domain |
| `email.risk_score` | 0–100 | Email risk score (100 = definitely bad) |
| `ip` | object \| null | IP findings, or null if no `ip` was sent |
| `ip.is_tor` | boolean | Current Tor exit node |
| `ip.is_proxy` | boolean | Known VPN / proxy IP |
| `ip.is_hosting` | boolean | Commercial hosting IP (AWS / DO / Hetzner / etc.) |
| `ip.asn` | string \| null | Autonomous System Number |
| `ip.risk_score` | 0–100 | IP risk score |
| `phone` | object \| null | Phone findings, or null if no `phone` was sent |
| `phone.is_disposable` | boolean | Virtual / disposable number |
| `phone.number` | string | Normalized E.164 number |
| `phone.risk_score` | 0–100 | Phone risk score |
| `overall_risk` | `"low"` \| `"medium"` \| `"high"` | Max score bucketed (≥70 high, ≥30 medium) |
| `recommendation` | `"allow"` \| `"review"` \| `"block"` | `max ≥ 80` or `overall_risk="high"` → `block`; `max ≥ 50` or `overall_risk="medium"` → `review`; otherwise `allow` |

**Response headers**

| Header | Description |
|---|---|
| `X-Fraud-Blocked-Today` | Cumulative blocks on your key today |
| `X-Fraud-Blocked-Reason` | Reason for the block (`disposable_email` / `tor_exit` / `proxy` / `custom_blacklist` / `disposable_phone`) or `none` |
| `X-Estimated-Cost` | Estimated spend so far today, in USD |
| `X-Credit-Balance` | Credits remaining after this call |
| `X-Founder-Bypass` | Internal — whether the founder bypass skipped the credit deduction |

### Examples

**cURL**

```bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'
```

**Node.js**

```js
const res = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
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
if (data.recommendation === 'block') return block(data);
```

**Python**

```python
import os, requests

res = requests.post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    headers={'x-api-key': os.environ['SIGNUPDOGGY_KEY']},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
if data['recommendation'] == 'block':
    return block_user(data)
```

### `POST /v1/blacklist` — Manage your account blacklist

Add or remove an email, IP, or phone on your per-account blacklist.
Blacklisted values always return `recommendation: "block"` regardless of
other signals. All three fields are required.

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `"email"` \| `"ip"` \| `"phone"` |
| `value` | string | Yes | The value to blacklist (lowercased server-side) |
| `action` | string | Yes | `"add"` \| `"remove"` |

**Add — cURL**

```bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/blacklist \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "email", "value": "bad@actor.com", "action": "add"}'
```

**Remove — cURL**

```bash
curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/blacklist \
  -H "x-api-key: $SIGNUPDOGGY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "ip", "value": "1.2.3.4", "action": "remove"}'
```

Response:

```json
{
  "message": "email added to blacklist",
  "type": "email",
  "value": "bad@actor.com",
  "current_count": { "emails": 1, "ips": 0, "phones": 0 }
}
```

### `GET /v1/stats` — Today's usage

Returns requests, blocks (by reason), and estimated cost for the current UTC
day.

```bash
curl https://signupdoggy-api.jeffrinjames99.workers.dev/v1/stats \
  -H "x-api-key: $SIGNUPDOGGY_KEY"
```

**Response (200 OK)**

```json
{
  "period": "2026-06-18",
  "total_requests": 268,
  "blocked_count": 41,
  "blocked_by_reason": {
    "disposable_email": 30,
    "tor_exit": 3,
    "proxy": 5,
    "custom_blacklist": 2,
    "disposable_phone": 1
  },
  "estimated_cost_usd": 2.68
}
```

## Pricing (inline)

**$0.01 per request**, deducted from your pre-paid credit balance processed
by Dodo Payments. Credits never expire. No monthly fee. No sales call. See
the full [Pricing page](./pricing.md) for the three top-up packs (Solo / Pro
/ Scale).

## Errors

| Status | Meaning |
|---|---|
| `400` | Bad request. Invalid JSON or no `email` / `ip` / `phone` supplied. |
| `401` | Unauthorized. Missing or invalid API key. |
| `402` | Out of credits. Response: `{ "error": "Insufficient credits — top up at https://signupdoggy.pages.dev/billing", "code": "insufficient_credits" }`. |
| `500` | Internal error. Email [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com). |

## Rate limits

There are no API-level rate limits. You pay per request — $0.01 each, deducted
from your credit balance. The credit balance is per-user; once exhausted, the
API returns `402` until you top up.

## About this API

This API is the public reference for the SignupDoggy fraud-detection service.
It is the same API used by the SignupDoggy dashboard, the live playground on
the homepage, and every paying customer. The endpoint is hosted on Cloudflare
Workers; the blocklists are stored in Cloudflare KV and refreshed on a cron
schedule.

For questions, write to [jeffrinjames99@gmail.com](mailto:jeffrinjames99@gmail.com).
For the legal terms of using this API, see the [Terms of Service](./terms.md).
For what data we collect and what we don't, see the
[Privacy Policy](./privacy.md).
