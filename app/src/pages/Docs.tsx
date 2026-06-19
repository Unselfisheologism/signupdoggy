import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

// Base URL must match the actual deployed Worker. The previous
// `api.signupdoggy.dev` and `signupdoggy.dev` hostnames were never
// provisioned in DNS — copying them produced 6/UNKNOWN. The Worker
// is deployed at `signupdoggy-api.<account>.workers.dev`. If a
// custom domain is later attached to the Worker, update the two
// consts below in one place and the rest of this page follows.
const API_BASE = 'https://signupdoggy-api.jeffrinjames99.workers.dev';

const curlCheck = `curl -X POST ${API_BASE}/v1/check \\
  -H "x-api-key: $SIGNUPDOGGY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "ip": "1.2.3.4"}'`;

const jsonResp = `{
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
}`;

const nodeExample = `const res = await fetch('${API_BASE}/v1/check', {
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
if (data.recommendation === 'block') return block(data);`;

const pyExample = `import os, requests

res = requests.post(
    '${API_BASE}/v1/check',
    headers={'x-api-key': os.environ['SIGNUPDOGGY_KEY']},
    json={'email': 'user@example.com', 'ip': '1.2.3.4'}
)
data = res.json()
if data['recommendation'] == 'block':
    return block_user(data)`;

const blacklistAddCurl = `curl -X POST ${API_BASE}/v1/blacklist \\
  -H "x-api-key: $SIGNUPDOGGY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "email", "value": "bad@actor.com", "action": "add"}'`;

const blacklistRemoveCurl = `curl -X POST ${API_BASE}/v1/blacklist \\
  -H "x-api-key: $SIGNUPDOGGY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "ip", "value": "1.2.3.4", "action": "remove"}'`;

const keysCurl = `curl -X POST ${API_BASE}/v1/keys`;

const statsCurl = `curl ${API_BASE}/v1/stats \\
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
      <SEO config={SEO_ROUTES.docs} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./docs --api-reference
          <span className="banner-status">● REST API · 40MS P95</span>
        </div>

        <h1 className="docs-h1">API REFERENCE</h1>
        <p className="docs-lead">
          ONE ENDPOINT. ONE API KEY. ONE DECISION: ALLOW · REVIEW · BLOCK.
        </p>

        <h2 className="docs-h2"># BASE URL</h2>
        <p className="docs-p">
          ALL REQUESTS GO TO THE PUBLIC WORKER DEPLOYMENT BELOW. PASS YOUR API
          KEY IN THE <code>X-API-KEY</code> HEADER.
        </p>
        <div className="docs-code-block">
          <pre className="docs-code-pre"><code>{API_BASE}</code></pre>
        </div>

        <h2 className="docs-h2"># AUTHENTICATION</h2>
        <p className="docs-p">
          PASS YOUR API KEY IN THE <code>X-API-KEY</code> HEADER. KEYS ARE
          52-CHARACTER STRINGS PREFIXED WITH <code>SD_</code>. CREATE A KEY FROM
          THE DASHBOARD OR VIA <code>POST /v1/keys</code> BELOW.
        </p>
        <div className="docs-code-block">
          <pre className="docs-code-pre"><code>{'x-api-key: $SIGNUPDOGGY_KEY'}</code></pre>
          <button className="docs-copy-btn" onClick={handleSdkCopy}>
            [{sdkCopied ? 'COPIED' : 'COPY'}]
          </button>
        </div>

        <h2 className="docs-h2"># ENDPOINTS</h2>

        <h3 className="docs-h3">CHECK A SIGNUP</h3>
        <Endpoint method="POST" path="/v1/check" desc="EVALUATE EMAIL, IP, AND/OR PHONE IN ONE CALL" />
        <p className="docs-p">
          PASS AT LEAST ONE OF <code>email</code>, <code>ip</code>, OR
          <code> phone</code>. RETURNS PER-INPUT SIGNALS, AN OVERALL RISK BAND,
          AND A RECOMMENDATION. COSTS ONE CREDIT.
        </p>

        <h4 className="docs-h4">REQUEST BODY</h4>
        <FieldTable rows={[
          ['email', 'string', 'NO*', 'EMAIL TO CHECK'],
          ['ip', 'string', 'NO*', 'IPV4 ADDRESS TO CHECK'],
          ['phone', 'string', 'NO*', 'PHONE NUMBER TO CHECK (E.164, E.G. +14155551234)'],
        ]} />
        <p className="docs-p" style={{ opacity: 0.7 }}>
          *AT LEAST ONE OF <code>email</code>, <code>ip</code>, OR <code>phone</code> IS REQUIRED.
        </p>

        <h4 className="docs-h4">RESPONSE</h4>
        <FieldTable rows={[
          ['email', 'object | null', 'EMAIL FINDINGS (NULL IF NOT SENT)'],
          ['email.is_disposable', 'boolean', 'DOMAIN IS IN OUR DISPOSABLE LIST'],
          ['email.domain', 'string', 'NORMALIZED DOMAIN'],
          ['email.risk_score', '0–100', 'EMAIL RISK (100 = DEFINITELY BAD)'],
          ['ip', 'object | null', 'IP FINDINGS (NULL IF NOT SENT)'],
          ['ip.is_tor', 'boolean', 'CURRENT TOR EXIT NODE'],
          ['ip.is_proxy', 'boolean', 'KNOWN VPN / PROXY IP'],
          ['ip.is_hosting', 'boolean', 'COMMERCIAL HOSTING IP (AWS / DO / HETZNER / ETC)'],
          ['ip.asn', 'string | null', 'AUTONOMOUS SYSTEM NUMBER'],
          ['ip.risk_score', '0–100', 'IP RISK'],
          ['phone', 'object | null', 'PHONE FINDINGS (NULL IF NOT SENT)'],
          ['phone.is_disposable', 'boolean', 'VIRTUAL / DISPOSABLE NUMBER'],
          ['phone.number', 'string', 'NORMALIZED E.164 NUMBER'],
          ['phone.risk_score', '0–100', 'PHONE RISK'],
          ['overall_risk', '"low" | "medium" | "high"', 'MAX SCORE BUCKETED (≥70 HIGH, ≥30 MEDIUM)'],
          ['recommendation', '"allow" | "review" | "block"', 'DECISION (MAX ≥80 OR OVERALL=HIGH → BLOCK)'],
        ]} />

        <h4 className="docs-h4">RESPONSE HEADERS</h4>
        <FieldTable rows={[
          ['X-Fraud-Blocked-Today', 'NUMBER', 'CUMULATIVE BLOCKS ON YOUR KEY TODAY'],
          ['X-Fraud-Blocked-Reason', 'STRING', 'REASON FOR THE BLOCK (disposable_email / tor_exit / proxy / custom_blacklist / disposable_phone) OR "none"'],
          ['X-Estimated-Cost', 'USD', 'ESTIMATED SPEND SO FAR TODAY'],
          ['X-Credit-Balance', 'NUMBER', 'CREDITS REMAINING AFTER THIS CALL'],
          ['X-Founder-Bypass', '"true" | "false"', 'INTERNAL — WHETHER THE FOUNDER BYPASS SKIPPED CREDIT DEDUCTION'],
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

        <h3 className="docs-h3">CREATE AN API KEY</h3>
        <Endpoint method="POST" path="/v1/keys" desc="MINT A NEW API KEY. NO AUTH HEADER REQUIRED. RETURNS 201." />
        <p className="docs-p">
          THE RESPONSE BODY INCLUDES THE PLAIN <code>api_key</code> — SAVE IT
          NOW, IT IS NEVER SHOWN AGAIN.
        </p>
        <FieldTable rows={[
          ['api_key', 'string', 'THE NEW KEY, PREFIXED WITH sd_'],
          ['user_id', 'string', 'INTERNAL USER ID THE KEY IS BOUND TO'],
          ['created', 'YYYY-MM-DD', 'KEY CREATION DATE'],
          ['message', 'string', 'HUMAN-READABLE REMINDER TO SAVE THE KEY'],
        ]} />
        <CodeBlock code={keysCurl} label="CURL" />

        <h2 className="docs-h2"># CUSTOM BLACKLISTS</h2>
        <h3 className="docs-h3">ADD OR REMOVE A BLACKLIST ENTRY</h3>
        <Endpoint method="POST" path="/v1/blacklist" desc="ADD OR REMOVE AN EMAIL / IP / PHONE ON YOUR ACCOUNT BLACKLIST" />
        <p className="docs-p">
          BLACKLISTED VALUES RETURN <code>recommendation: "block"</code>
          {' '}WHATEVER THE OTHER SIGNALS SAY.
        </p>
        <FieldTable rows={[
          ['type', 'string', 'YES', '"email" | "ip" | "phone"'],
          ['value', 'string', 'YES', 'THE VALUE TO BLACKLIST (LOWERCASED)'],
          ['action', 'string', 'YES', '"add" | "remove"'],
        ]} />
        <CodeBlock code={blacklistAddCurl} label="ADD — CURL" />
        <CodeBlock code={blacklistRemoveCurl} label="REMOVE — CURL" />

        <h2 className="docs-h2"># USAGE</h2>
        <h3 className="docs-h3">GET TODAY'S USAGE</h3>
        <Endpoint method="GET" path="/v1/stats" desc="REQUESTS, BLOCKS (BY REASON), AND ESTIMATED COST FOR TODAY (UTC)" />
        <FieldTable rows={[
          ['period', 'YYYY-MM-DD', 'THE UTC DAY THIS REPORT COVERS'],
          ['total_requests', 'number', 'CALLS YOU HAVE MADE TODAY'],
          ['blocked_count', 'number', 'CALLS THAT RETURNED recommendation: "block"'],
          ['blocked_by_reason.disposable_email', 'number', 'BLOCKS FOR DISPOSABLE EMAIL'],
          ['blocked_by_reason.tor_exit', 'number', 'BLOCKS FOR TOR EXIT NODE'],
          ['blocked_by_reason.proxy', 'number', 'BLOCKS FOR VPN / PROXY / HOSTING IP'],
          ['blocked_by_reason.custom_blacklist', 'number', 'BLOCKS FOR YOUR PERSONAL BLACKLIST'],
          ['blocked_by_reason.disposable_phone', 'number', 'BLOCKS FOR DISPOSABLE PHONE'],
          ['estimated_cost_usd', 'number', "TODAY'S SPEND AT $0.01/REQUEST"],
        ]} />
        <CodeBlock code={statsCurl} label="CURL" />

        <h2 className="docs-h2"># PRICING INLINE</h2>
        <p className="docs-p">
          <strong>$0.01 PER REQUEST</strong>, DEDUCTED FROM YOUR PRE-PAID CREDIT
          BALANCE. CREDITS NEVER EXPIRE. NO MONTHLY FEE. NO SALES CALL.
        </p>
        <p className="docs-p">
          <Link to="/pricing">SEE THE THREE SIZES →</Link>
        </p>

        <h2 className="docs-h2"># ERRORS</h2>
        <FieldTable headers={['STATUS', 'MEANING']} rows={[
          ['400', 'BAD REQUEST. INVALID JSON OR NO EMAIL/IP/PHONE SUPPLIED.'],
          ['401', 'UNAUTHORIZED. MISSING OR INVALID API KEY.'],
          ['402', 'OUT OF CREDITS. TOP UP AT /BILLING OR VIA THE DASHBOARD. RESPONSE: { "error": "Insufficient credits — top up at https://signupdoggy.pages.dev/billing", "code": "insufficient_credits" }'],
          ['500', 'INTERNAL ERROR. EMAIL JEFFRINJAMES99@GMAIL.COM.'],
        ]} />
      </div>
    </AppLayout>
  );
}
