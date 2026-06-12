import { useState } from 'react';
import AppLayout from '../components/AppLayout';

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

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="docs-code-block">
      {label && <div className="docs-code-label">{label}</div>}
      <pre className="docs-code-pre"><code>{code}</code></pre>
      <button className="docs-copy-btn" onClick={handleCopy}>
        [{copied ? 'COPIED' : 'COPY'}]
      </button>
    </div>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const mClass = method === 'POST' ? 'endpoint-post' : method === 'GET' ? 'endpoint-get' : 'endpoint-del';
  return (
    <div className="docs-endpoint">
      <span className={`docs-method ${mClass}`}>{method}</span>
      <code className="docs-path">{path}</code>
      <span className="docs-endpoint-desc">{desc}</span>
    </div>
  );
}

function FieldTable({ rows, headers = ['FIELD', 'TYPE', 'REQUIRED', 'DESCRIPTION'] }: { rows: (string | undefined)[][]; headers?: string[] }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            {headers.map(h => (<th key={h}>{h}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 1 ? 'docs-row-alt' : ''}>
              {r.map((c, j) => (
                <td key={j}>{j === 0 ? <code>{c}</code> : c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Docs() {
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl');
  const codeMap = { curl: curlCheck, node: nodeExample, python: pyExample };
  const [sdkCopied, setSdkCopied] = useState(false);
  const handleSdkCopy = () => {
    navigator.clipboard.writeText('x-api-key: sd_your_key_here');
    setSdkCopied(true);
    setTimeout(() => setSdkCopied(false), 2000);
  };

  return (
    <AppLayout title="docs.signupdoggy.pages.dev">
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./docs --api-reference
          <span className="banner-status">● REST API</span>
        </div>

        <h1 className="docs-h1">API REFERENCE</h1>
        <p className="docs-lead">
          SIGNUPDOGGY IS A REST API. AUTHENTICATE WITH YOUR API KEY, SEND US AN
          EMAIL OR IP ADDRESS, AND GET A FRAUD ASSESSMENT BACK IN UNDER 50MS.
        </p>

        {/* Authentication */}
        <h2 className="docs-h2"># AUTHENTICATION</h2>
        <p className="docs-p">
          EVERY REQUEST REQUIRES AN API KEY SENT VIA THE <code>X-API-KEY</code> HEADER.
          CREATE A KEY FROM THE DASHBOARD AFTER SIGNING UP.
        </p>
        <div className="docs-code-block">
          <pre className="docs-code-pre"><code>{'x-api-key: sd_your_key_here'}</code></pre>
          <button className="docs-copy-btn" onClick={handleSdkCopy}>
            [{sdkCopied ? 'COPIED' : 'COPY'}]
          </button>
        </div>

        {/* Endpoints */}
        <h2 className="docs-h2"># ENDPOINTS</h2>

        <h3 className="docs-h3">## CHECK A SIGNUP</h3>
        <Endpoint method="POST" path="/v1/check" desc="EVALUATE AN EMAIL AND/OR IP ADDRESS FOR FRAUD RISK" />
        <p className="docs-p">
          THE MAIN ENDPOINT. PASS AN EMAIL, AN IP, OR BOTH. THE API RETURNS
          RISK SCORES FOR EACH SIGNAL PLUS AN OVERALL RECOMMENDATION.
        </p>

        <h4 className="docs-h4">REQUEST BODY</h4>
        <FieldTable rows={[
          ['email', 'string', 'NO*', 'EMAIL TO CHECK (REQUIRED IF NO IP)'],
          ['ip', 'string', 'NO*', 'IP ADDRESS TO CHECK (REQUIRED IF NO EMAIL)'],
        ]} />

        <h4 className="docs-h4">RESPONSE</h4>
        <FieldTable rows={[
          ['email.is_disposable', 'boolean', 'WHETHER EMAIL DOMAIN IS DISPOSABLE'],
          ['email.domain', 'string', 'DOMAIN PORTION OF THE EMAIL'],
          ['email.risk_score', 'number', '0-100 SCORE FROM EMAIL SIGNALS'],
          ['ip.is_tor', 'boolean', 'WHETHER IP IS A TOR EXIT NODE'],
          ['ip.is_proxy', 'boolean', 'WHETHER IP IS VPN/PROXY'],
          ['ip.is_hosting', 'boolean', 'WHETHER IP IS CLOUD HOSTING'],
          ['ip.asn', 'string|null', 'ASN IDENTIFIER'],
          ['ip.risk_score', 'number', '0-100 SCORE FROM IP SIGNALS'],
          ['overall_risk', 'string', 'LOW / MEDIUM / HIGH'],
          ['recommendation', 'string', 'ALLOW / REVIEW / BLOCK'],
        ]} />

        {/* Code Tabs */}
        <div className="docs-code-tabs">
          <div className="docs-tab-bar">
            {(['curl', 'node', 'python'] as const).map(t => (
              <button
                key={t}
                className={`docs-tab ${tab === t ? 'docs-tab-active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'curl' ? 'CURL' : t === 'node' ? 'NODE.JS' : 'PYTHON'}
              </button>
            ))}
          </div>
          <CodeBlock code={codeMap[tab]} />
          {tab === 'curl' && <CodeBlock code={jsonResp} label="EXAMPLE RESPONSE" />}
        </div>

        {/* Blacklists */}
        <h2 className="docs-h2"># CUSTOM BLACKLISTS</h2>
        <h3 className="docs-h3">## ADD A BLACKLIST ENTRY</h3>
        <Endpoint method="POST" path="/v1/blacklist" desc="ADD EMAIL/IP TO YOUR PERSONAL BLACKLIST" />
        <FieldTable rows={[
          ['type', 'string', 'YES', 'email OR ip'],
          ['value', 'string', 'YES', 'THE VALUE TO BLOCK'],
        ]} />
        <CodeBlock code={blacklistCurl} label="CURL" />

        <h3 className="docs-h3">## GET STATS</h3>
        <Endpoint method="GET" path="/v1/stats" desc="VIEW USAGE + REMAINING FREE QUOTA" />
        <CodeBlock code={statsCurl} label="CURL" />

        {/* Rate Limits */}
        <h2 className="docs-h2"># RATE LIMITS</h2>
        <p className="docs-p">
          FREE TIER: 1,000 REQUESTS/DAY. PAID: NO DAILY CAP. RATE LIMIT STATUS
          IS RETURNED IN RESPONSE HEADERS.
        </p>
        <FieldTable headers={['FIELD', 'DESCRIPTION']} rows={[
          ['X-RateLimit-Limit', 'YOUR DAILY REQUEST LIMIT'],
          ['X-RateLimit-Remaining', 'REQUESTS REMAINING TODAY'],
          ['X-Fraud-Blocked-Today', 'BLOCKED REQUESTS TODAY'],
        ]} />

        {/* Errors */}
        <h2 className="docs-h2"># ERRORS</h2>
        <FieldTable headers={['STATUS', 'MEANING']} rows={[
          ['400', 'BAD REQUEST. MISSING/INVALID PARAMETERS.'],
          ['401', 'UNAUTHORIZED. MISSING/INVALID API KEY.'],
          ['429', 'RATE LIMIT EXCEEDED.'],
          ['500', 'INTERNAL SERVER ERROR.'],
        ]} />
      </div>
    </AppLayout>
  );
}
