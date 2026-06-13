import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

const curlCheck = `curl -X POST https://api.signupdoggy.dev/v1/check \\
  -H "x-api-key: $SIGNUPDOGGY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`;

const jsonResp = `{
  "recommendation": "block",
  "risk_score": 0.97,
  "latency_ms": 38,
  "signals": {
    "disposable_email": true,
    "vpn_or_proxy": true,
    "tor_exit_node": true,
    "role_based": false
  },
  "email": { "domain": "10minutemail.com", "risk_score": 95 },
  "ip": { "asn": "AS9009", "risk_score": 88 }
}`;

const nodeExample = `const res = await fetch('https://api.signupdoggy.dev/v1/check', {
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
if (data.risk_score > 0.7) return block(data);`;

const pyExample = `import requests

res = requests.post(
    'https://api.signupdoggy.dev/v1/check',
    headers={'x-api-key': os.environ['SIGNUPDOGGY_KEY']},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
if data['risk_score'] > 0.7:
    return block_user(data)`;

const blacklistCurl = `curl -X POST https://api.signupdoggy.dev/v1/blacklist \\
  -H "x-api-key: $SIGNUPDOGGY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "email", "value": "bad@actor.com"}'`;

const statsCurl = `curl https://api.signupdoggy.dev/v1/stats \\
  -H "x-api-key: $SIGNUPDOGGY_KEY"`;

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
    navigator.clipboard.writeText('x-api-key: $SIGNUPDOGGY_KEY');
    setSdkCopied(true);
    setTimeout(() => setSdkCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./docs --api-reference
          <span className="banner-status">● REST API · 40MS P95</span>
        </div>

        <h1 className="docs-h1">API REFERENCE</h1>
        <p className="docs-lead">
          ONE ENDPOINT. ONE API KEY. ONE DECISION: ALLOW · REVIEW · BLOCK.
        </p>

        <h2 className="docs-h2"># AUTHENTICATION</h2>
        <p className="docs-p">
          PASS YOUR API KEY IN THE <code>X-API-KEY</code> HEADER. CREATE A KEY FROM THE DASHBOARD AFTER BUYING CREDITS.
        </p>
        <div className="docs-code-block">
          <pre className="docs-code-pre"><code>{'x-api-key: $SIGNUPDOGGY_KEY'}</code></pre>
          <button className="docs-copy-btn" onClick={handleSdkCopy}>
            [{sdkCopied ? 'COPIED' : 'COPY'}]
          </button>
        </div>

        <h2 className="docs-h2"># ENDPOINTS</h2>

        <h3 className="docs-h3">CHECK A SIGNUP</h3>
        <Endpoint method="POST" path="/v1/check" desc="EVALUATE EMAIL + IP IN ONE CALL" />
        <p className="docs-p">
          PASS AN EMAIL, AN IP, OR BOTH. RETURN A 0–1 RISK SCORE PLUS PER-SIGNAL BREAKDOWN.
        </p>

        <h4 className="docs-h4">REQUEST BODY</h4>
        <FieldTable rows={[
          ['email', 'string', 'NO*', 'EMAIL TO CHECK'],
          ['ip', 'string', 'NO*', 'IP ADDRESS TO CHECK'],
          ['phone', 'string', 'NO', 'PHONE NUMBER TO CHECK'],
        ]} />

        <h4 className="docs-h4">RESPONSE</h4>
        <FieldTable rows={[
          ['recommendation', '"allow"|"review"|"block"', 'DECISION'],
          ['risk_score', '0–1', 'OVERALL RISK'],
          ['latency_ms', 'number', 'TIME TAKEN'],
          ['signals.disposable_email', 'boolean', 'DISPOSABLE DOMAIN?'],
          ['signals.vpn_or_proxy', 'boolean', 'VPN / PROXY?'],
          ['signals.tor_exit_node', 'boolean', 'TOR EXIT?'],
          ['signals.role_based', 'boolean', 'ADMIN@ / INFO@ / ETC'],
        ]} />

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

        <h2 className="docs-h2"># CUSTOM BLACKLISTS</h2>
        <h3 className="docs-h3">ADD A BLACKLIST ENTRY</h3>
        <Endpoint method="POST" path="/v1/blacklist" desc="ADD EMAIL OR IP TO YOUR ACCOUNT BLACKLIST" />
        <FieldTable rows={[
          ['type', 'string', 'YES', '"email" OR "ip"'],
          ['value', 'string', 'YES', 'THE VALUE TO BLOCK'],
        ]} />
        <CodeBlock code={blacklistCurl} label="CURL" />

        <h2 className="docs-h2"># USAGE</h2>
        <h3 className="docs-h3">GET USAGE + REMAINING CREDITS</h3>
        <Endpoint method="GET" path="/v1/stats" desc="CHECK CREDITS, USAGE, AND LIMITS" />
        <CodeBlock code={statsCurl} label="CURL" />

        <h2 className="docs-h2"># PRICING INLINE</h2>
        <p className="docs-p">
          <strong>$0.01 PER REQUEST</strong> AFTER YOUR CREDITS RUN OUT. CREDITS NEVER EXPIRE. NO MONTHLY FEE. NO SALES CALL.
        </p>
        <p className="docs-p">
          <Link to="/pricing">SEE THE THREE SIZES →</Link>
        </p>

        <h2 className="docs-h2"># ERRORS</h2>
        <FieldTable headers={['STATUS', 'MEANING']} rows={[
          ['400', 'BAD REQUEST. MISSING OR INVALID PARAMETERS.'],
          ['401', 'UNAUTHORIZED. MISSING OR INVALID API KEY.'],
          ['402', 'OUT OF CREDITS. BUY MORE.'],
          ['429', 'RATE LIMITED. BACK OFF.'],
          ['500', 'INTERNAL ERROR. EMAIL JEFFRINJAMES99@GMAIL.COM.'],
        ]} />
      </div>
    </AppLayout>
  );
}
