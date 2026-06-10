import { DodoPayments } from 'dodopayments';

const client = new DodoPayments({ bearerToken: 'YY11Zu3bUrqNj_bT.cpmJ56WYxxnsoAWy_9oMbgMXB8uS623UoHxZGTvnN9cbgCSz' });

console.log('SDK Base URL:', client.baseURL);

// Monkey-patch global fetch to log Dodo API calls
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url?.url;
  if (urlStr && (urlStr.includes('dodopayments') || urlStr.includes('live.dodopayments'))) {
    console.log('\n>>> DODO REQUEST >>>');
    console.log('URL:', urlStr);
    console.log('Method:', opts?.method || 'GET');
    const headers = opts?.headers || {};
    const h = typeof headers === 'object' && headers.entries ? Object.fromEntries(headers.entries()) : headers;
    console.log('Headers:', JSON.stringify(h, null, 2));
    if (opts?.body) console.log('Body:', opts.body.slice(0, 200));
  }
  return origFetch(url, opts);
};

async function main() {
  try {
    // Try listing customers
    const customers = [];
    for await (const c of client.customers.list()) {
      customers.push(c);
      if (customers.length >= 2) break;
    }
    console.log('\nCustomers found:', customers.length);
    for (const c of customers) {
      console.log(' -', c.id, c.email);
    }
  } catch (err) {
    console.error('\nError:', err.message);
    if (err.status) console.error('Status:', err.status);
    if (err.body) console.error('Body:', err.body?.slice(0, 300));
  }
}

main();
