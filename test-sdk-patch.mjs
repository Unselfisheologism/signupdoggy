import { DodoPayments } from 'dodopayments';

const client = new DodoPayments({ bearerToken: 'YY11Zu3bUrqNj_bT.cpmJ56WYxxnsoAWy_9oMbgMXB8uS623UoHxZGTvnN9cbgCSz' });

// Patch the undici fetch to log URLs
const origFetch = client.fetch;
client.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input?.url || String(input);
  if (url.includes('dodopayments')) {
    console.log('SDK req:', init?.method || 'GET', url);
    console.log('  headers:', JSON.stringify(init?.headers));
    if (init?.body) console.log('  body:', init.body.slice(0, 200));
  }
  return origFetch.call(client, input, init);
};

async function main() {
  // Make one request to trigger the logging
  try {
    const products = [];
    for await (const p of client.products.list()) {
      products.push(p);
      break; // just one
    }
    console.log('Got 1 product');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
