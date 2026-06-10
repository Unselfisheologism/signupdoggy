export default function Docs() {
  const curlCheck = `curl -X POST https://registerguardian-api.jeffrinjames99.workers.dev/v1/check \\
  -H "x-api-key: rg_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`;

  const curlKey = `curl -X POST https://registerguardian-api.jeffrinjames99.workers.dev/v1/keys`;

  const nodeExample = `const res = await fetch('https://registerguardian-api.jeffrinjames99.workers.dev/v1/check', {
  method: 'POST',
  headers: {
    'x-api-key': 'rg_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    ip: '1.2.3.4',
  }),
});
const data = await res.json();
console.log(data.recommendation); // "allow" | "review" | "block"`;

  const pyExample = `import requests

res = requests.post(
    'https://registerguardian-api.jeffrinjames99.workers.dev/v1/check',
    headers={'x-api-key': 'rg_your_key_here'},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
print(data['recommendation'])  # "allow" | "review" | "block"`;

  function copy(text: string) {
    return `javascript:void(navigator.clipboard.writeText(\`${text.replace(/`/g, '\\`')}\`))`;
  }

  return (
    <div className="docs-page">
      <h1>📖 Documentation</h1>
      <p>Get started in 5 minutes. No SDK install required — just an HTTP call.</p>

      <h2>🚀 Quick Start</h2>
      <p>Generate an API key and make your first check:</p>

      <h3>1. Get an API key</h3>
      <pre>
        <code>{curlKey}</code>
        <button className="copy-btn" style={{float:'right'}} onClick={() => navigator.clipboard.writeText(curlKey)}>Copy</button>
      </pre>

      <h3>2. Check a signup</h3>
      <pre>
        <code>{curlCheck}</code>
        <button className="copy-btn" style={{float:'right'}} onClick={() => navigator.clipboard.writeText(curlCheck)}>Copy</button>
      </pre>

      <h2>📡 API Endpoints</h2>

      <div className="endpoint">
        <span className="method">POST</span><code>/v1/check</code>
        <p>Check an email address and/or IP address for fraud signals. Returns risk scores and a recommendation.</p>
      </div>

      <div className="endpoint">
        <span className="method">POST</span><code>/v1/keys</code>
        <p>Generate a new API key. No authentication required. Key is shown once.</p>
      </div>

      <div className="endpoint">
        <span className="method">POST</span><code>/v1/blacklist</code>
        <p>Add or remove emails/IPs from your personal blacklist. Requires API key auth.</p>
      </div>

      <div className="endpoint">
        <span className="method">GET</span><code>/v1/stats</code>
        <p>View today's usage: total requests, blocked counts, and estimated cost.</p>
      </div>

      <div className="endpoint">
        <span className="method">GET</span><code>/openapi.json</code>
        <p>Download the OpenAPI 3.0 specification for tooling and code generation.</p>
      </div>

      <h2>📋 Authentication</h2>
      <p>All endpoints except <code>/v1/keys</code> require an API key sent via the <code>x-api-key</code> header. Keys are 51-character strings starting with <code>rg_</code>.</p>

      <h2>🔑 Request Body</h2>
      <table>
        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>email</code></td><td>string</td><td>No*</td><td>Email address to check for disposable domain</td></tr>
        <tr><td><code>ip</code></td><td>string</td><td>No*</td><td>IP address to check for Tor/VPN/proxy</td></tr>
      </table>
      <p><em>* At least one of email or ip is required.</em></p>

      <h2>📤 Response</h2>
      <table>
        <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>email.is_disposable</code></td><td>boolean</td><td>Whether the email domain is a known disposable provider</td></tr>
        <tr><td><code>email.risk_score</code></td><td>0-100</td><td>Risk score specifically for the email check</td></tr>
        <tr><td><code>ip.is_tor</code></td><td>boolean</td><td>Whether the IP is a known Tor exit node</td></tr>
        <tr><td><code>ip.is_proxy</code></td><td>boolean</td><td>Whether the IP belongs to a hosting/VPN provider</td></tr>
        <tr><td><code>overall_risk</code></td><td>string</td><td>low | medium | high</td></tr>
        <tr><td><code>recommendation</code></td><td>string</td><td>allow | review | block</td></tr>
      </table>

      <h2>📊 Response Headers</h2>
      <table>
        <tr><th>Header</th><th>Description</th></tr>
        <tr><td><code>X-Fraud-Blocked-Today</code></td><td>Total blocked requests today</td></tr>
        <tr><td><code>X-Fraud-Blocked-Reason</code></td><td>Why this request was flagged</td></tr>
        <tr><td><code>X-Estimated-Cost</code></td><td>Estimated cost of today's usage</td></tr>
      </table>

      <h2>🔢 HTTP Status Codes</h2>
      <table>
        <tr><th>Code</th><th>Description</th></tr>
        <tr><td>200</td><td>Success</td></tr>
        <tr><td>201</td><td>Resource created (API key)</td></tr>
        <tr><td>400</td><td>Bad request — check request body</td></tr>
        <tr><td>401</td><td>Missing or invalid API key</td></tr>
      </table>

      <h2>💻 SDK Examples</h2>

      <h3>Node.js / TypeScript</h3>
      <pre>
        <code>{nodeExample}</code>
        <button className="copy-btn" style={{float:'right'}} onClick={() => navigator.clipboard.writeText(nodeExample)}>Copy</button>
      </pre>

      <h3>Python</h3>
      <pre>
        <code>{pyExample}</code>
        <button className="copy-btn" style={{float:'right'}} onClick={() => navigator.clipboard.writeText(pyExample)}>Copy</button>
      </pre>

      <div className="footer">
        <p>🛡️ RegisterGuardian API — Built on Cloudflare Workers. Powered by open data.</p>
      </div>
    </div>
  );
}
