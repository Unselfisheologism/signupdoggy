import DodoPayments from 'dodopayments';

const client = new DodoPayments({ bearerToken: 'YY11Zu3bUrqNj_bT.cpmJ56WYxxnsoAWy_9oMbgMXB8uS623UoHxZGTvnN9cbgCSz' });

async function main() {
  try {
    const products = [];
    for await (const product of client.products.list()) {
      products.push(product);
    }
    console.log('Products count:', products.length);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.status) console.error('Status:', err.status);
    if (err.body) console.error('Body:', err.body);
  }
}

main();
