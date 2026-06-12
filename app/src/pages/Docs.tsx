import { useState } from 'react';

const curlCheck = `curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check \\
  -H "x-api-key: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`;

const jsonResp = `{
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
}`;

const nodeExample = `const res = await fetch('https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': 'sd_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    ip: '1.2.3.4',
  }),
});
const data = await res.json();
console.log(data.recommendation);`;

const pyExample = `import requests

res = requests.post(
    'https://signupdoggy-api.jeffrinjames99.workers.dev/v1/check',
    headers={'x-api-key': 'sd_your_key_here'},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
print(data['recommendation'])`;

const blacklistCurl = `curl -X POST https://signupdoggy-api.jeffrinjames99.workers.dev/v1/blacklist \\
  -H "x-api-key: sd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "email", "value": "bad@actor.com"}'`;

const statsCurl = `curl https://signupdoggy-api.jeffrinjames99.workers.dev/v1/stats \\
  -H "x-api-key: sd_your_key_here"`;

export default function Docs() {
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl');
  const codeMap = { curl: curlCheck, node: nodeExample, python: pyExample };

  return (
    <div className="docs-page">
      <h1>API Reference</h1>
      <p className="docs-lead">
        SignupDoggy is a REST API. Authenticate with your API key, send us an
        email or IP address, and get a fraud assessment back in under 50ms.
      </p>

      {/* Authentication */}
      <h2>Authentication</h2>
      <p>
        Every request requires an API key sent via the <code>x-api-key</code>
        header. You can create a key from the dashboard after signing up.
      </p>
      <pre>
        <code>{'x-api-key: sd_your_key_here'}</code>
        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText('x-api-key: sd_your_key_here')}
        >Copy</button>
      </pre>

      {/* Endpoints */}
      <h2>Endpoints</h2>

      <h3>Check a signup</h3>
      <div className="endpoint-group">
        <div className="endpoint">
          <span className="method post">POST</span>
          <code>/v1/check</code>
          <span className="endpoint-desc">Evaluate an email and/or IP address for fraud risk</span>
        </div>
      </div>

      <p>
        The main endpoint. Pass an email, an IP, or both. The API returns
        risk scores for each signal plus an overall recommendation.
      </p>

      <h4>Request body</h4>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>email</code></td>
            <td>string</td>
            <td>No*</td>
            <td>Email address to check (required if IP is not provided)</td>
          </tr>
          <tr>
            <td><code>ip</code></td>
            <td>string</td>
            <td>No*</td>
            <td>IP address to check (required if email is not provided)</td>
          </tr>
        </tbody>
      </table>

      <h4>Response</h4>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>email.is_disposable</code></td>
            <td>boolean</td>
            <td>Whether the email domain is a known disposable provider</td>
          </tr>
          <tr>
            <td><code>email.domain</code></td>
            <td>string</td>
            <td>The domain portion of the email address</td>
          </tr>
          <tr>
            <td><code>email.risk_score</code></td>
            <td>number</td>
            <td>0-100 score based on email signals</td>
          </tr>
          <tr>
            <td><code>ip.is_tor</code></td>
            <td>boolean</td>
            <td>Whether the IP is a known Tor exit node</td>
          </tr>
          <tr>
            <td><code>ip.is_proxy</code></td>
            <td>boolean</td>
            <td>Whether the IP belongs to a VPN or proxy service</td>
          </tr>
          <tr>
            <td><code>ip.is_hosting</code></td>
            <td>boolean</td>
            <td>Whether the IP is from a cloud hosting provider</td>
          </tr>
          <tr>
            <td><code>ip.asn</code></td>
            <td>string|null</td>
            <td>ASN identifier if available</td>
          </tr>
          <tr>
            <td><code>ip.risk_score</code></td>
            <td>number</td>
            <td>0-100 score based on IP signals</td>
          </tr>
          <tr>
            <td><code>overall_risk</code></td>
            <td>string</td>
            <td>low, medium, or high</td>
          </tr>
          <tr>
            <td><code>recommendation</code></td>
            <td>string</td>
            <td>allow, review, or block</td>
          </tr>
        </tbody>
      </table>

      <div className="code-showcase">
        <div className="code-tabs">
          <span className={'code-tab' + (tab === 'curl' ? ' active' : '')} onClick={() => setTab('curl')}>cURL</span>
          <span className={'code-tab' + (tab === 'node' ? ' active' : '')} onClick={() => setTab('node')}>Node.js</span>
          <span className={'code-tab' + (tab === 'python' ? ' active' : '')} onClick={() => setTab('python')}>Python</span>
        </div>
        <div className="pre-group">
          <pre><code>{codeMap[tab]}</code></pre>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(codeMap[tab])}
          >Copy</button>
        </div>
        {tab === 'curl' && (
          <div className="pre-group">
            <pre><code>{jsonResp}</code></pre>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(jsonResp)}
            >Copy</button>
          </div>
        )}
      </div>

      {/* Blacklist */}
      <h2>Custom Blacklists</h2>

      <h3>Add a blacklist entry</h3>
      <div className="endpoint-group">
        <div className="endpoint">
          <span className="method post">POST</span>
          <code>/v1/blacklist</code>
          <span className="endpoint-desc">Add an email or IP to your personal blacklist</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>type</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>email or ip</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>The email address or IP to block</td>
          </tr>
        </tbody>
      </table>

      <div className="pre-group">
        <pre><code>{blacklistCurl}</code></pre>
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(blacklistCurl)}>Copy</button>
      </div>

      <h3>Get stats</h3>
      <div className="endpoint-group">
        <div className="endpoint">
          <span className="method get">GET</span>
          <code>/v1/stats</code>
          <span className="endpoint-desc">View usage statistics and remaining free tier quota</span>
        </div>
      </div>

      <div className="pre-group">
        <pre><code>{statsCurl}</code></pre>
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(statsCurl)}>Copy</button>
      </div>

      {/* Rate limits */}
      <h2>Rate Limits</h2>
      <p>
        Free tier accounts are limited to 1,000 requests per day. Paid
        accounts have no daily cap. Rate limit status is returned in the
        response headers of every <code>/v1/check</code> request:
      </p>
      <table>
        <thead>
          <tr>
            <th>Header</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>X-RateLimit-Limit</code></td>
            <td>Your daily request limit</td>
          </tr>
          <tr>
            <td><code>X-RateLimit-Remaining</code></td>
            <td>Requests remaining for today</td>
          </tr>
          <tr>
            <td><code>X-Fraud-Blocked-Today</code></td>
            <td>Number of requests blocked by fraud detection today</td>
          </tr>
        </tbody>
      </table>

      {/* Errors */}
      <h2>Errors</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>400</code></td>
            <td>Bad request. Missing or invalid parameters.</td>
          </tr>
          <tr>
            <td><code>401</code></td>
            <td>Unauthorized. Missing or invalid API key.</td>
          </tr>
          <tr>
            <td><code>429</code></td>
            <td>Rate limit exceeded for free tier.</td>
          </tr>
          <tr>
            <td><code>500</code></td>
            <td>Internal server error. Check back soon.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
