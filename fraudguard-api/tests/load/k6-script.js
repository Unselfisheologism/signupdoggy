import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.REGISTERGUARDIAN_URL || 'https://registerguardian.dev';
const API_KEY = __ENV.REGISTERGUARDIAN_API_KEY || 'rg_test_key_placeholder';

const failRate = new Rate('failed_requests');
const latencyTrend = new Trend('latency_ms');

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Ramp up to 10 users
    { duration: '20s', target: 50 },  // Ramp to 50
    { duration: '20s', target: 100 }, // Ramp to 100
    { duration: '30s', target: 100 }, // Stay at 100
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    failed_requests: ['rate<0.01'],  // < 1% failures
    latency_ms: ['p(95)<50'],        // p95 < 50ms
  },
};

const testPayloads = [
  { email: 'user@gmail.com', ip: '8.8.8.8' },
  { email: 'test@tempmail.com', ip: '1.2.3.4' },
  { email: 'hello@outlook.com', ip: '54.239.25.200' },
  { email: 'spam@mailinator.com', ip: '159.89.100.100' },
  { email: 'user@protonmail.com', ip: '13.107.42.14' },
  { email: 'admin@example.com', ip: '104.16.132.229' },
  { email: 'test@guerrillamail.com', ip: '34.64.4.5' },
  { email: 'info@company.org', ip: '52.84.124.11' },
  { email: 'nobody@10minutemail.com', ip: '35.190.35.1' },
  { email: 'contact@mail.com', ip: '172.217.160.14' },
];

export default function () {
  const payload = testPayloads[Math.floor(Math.random() * testPayloads.length)];

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  const res = http.post(`${BASE_URL}/v1/check`, JSON.stringify(payload), {
    headers,
  });

  const latency = res.timings.duration;
  latencyTrend.add(latency);
  failRate.add(res.status !== 200 && res.status !== 429);

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'response is JSON': (r) => r.headers['Content-Type']?.includes('json'),
    'has overall_risk field': (r) => {
      try { return JSON.parse(r.body).overall_risk !== undefined; }
      catch { return false; }
    },
    'has recommendation field': (r) => {
      try { return ['allow', 'review', 'block'].includes(JSON.parse(r.body).recommendation); }
      catch { return false; }
    },
    'has rate limit headers': (r) => r.headers['X-RateLimit-Limit'] !== undefined,
    'latency < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(0.1); // 100ms between requests per VU
}

export function handleSummary(data) {
  const p95 = data.metrics.latency_ms?.values?.['p(95)'] || 'N/A';
  const p99 = data.metrics.latency_ms?.values?.['p(99)'] || 'N/A';
  const avg = data.metrics.latency_ms?.values?.avg || 'N/A';
  const failRate = data.metrics.failed_requests?.values?.rate || 'N/A';
  const totalReqs = data.metrics.http_reqs?.values?.count || 'N/A';

  console.log(`\n=== Load Test Summary ===`);
  console.log(`Total Requests: ${totalReqs}`);
  console.log(`Avg Latency: ${avg}ms`);
  console.log(`P95 Latency: ${p95}ms`);
  console.log(`P99 Latency: ${p99}ms`);
  console.log(`Failure Rate: ${failRate}`);
  console.log(`========================\n`);

  return {
    'stdout': JSON.stringify({
      total_requests: totalReqs,
      avg_latency_ms: avg,
      p95_latency_ms: p95,
      p99_latency_ms: p99,
      failure_rate: failRate,
      thresholds_met: {
        p95_lt_50ms: typeof p95 === 'number' ? p95 < 50 : false,
        failure_rate_lt_1pct: typeof failRate === 'number' ? failRate < 0.01 : false,
      },
    }, null, 2),
  };
}
