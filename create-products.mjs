import DodoPayments from 'dodopayments';

const client = new DodoPayments({ bearerToken: 'YY11Zu3bUrqNj_bT.cpmJ56WYxxnsoAWy_9oMbgMXB8uS623UoHxZGTvnN9cbgCSz' });

async function main() {
  try {
    // STEP 1: Create Credit Entitlement
    console.log('=== Creating Credit Entitlement ===');
    const entitlement = await client.creditEntitlements.create({
      name: 'API Requests',
      unit: 'requests',
      precision: 0,
      rollover_enabled: true,
      rollover_percentage: 100,
      rollover_timeframe_count: 1,
      rollover_timeframe_interval: 'Month',
      max_rollover_count: 12,
      overage_enabled: true,
      overage_behavior: 'invoice_at_billing',
      currency: 'USD',
      price_per_unit: '0.01',
      description: 'RegisterGuardian API request credits. 1 credit = 1 API request.',
    });
    console.log('Created:', entitlement.id, '-', entitlement.name);
    console.log(JSON.stringify(entitlement, null, 2));
    const entitlementId = entitlement.id;

    // STEP 2: Create Products with different credit packs
    console.log('\n=== Creating Products ===');

    // Product 1: Starter Pack - $10 for 1,000 requests
    const starter = await client.products.create({
      name: 'Starter Pack',
      description: '1,000 API requests for RegisterGuardian',
      tax_category: 'saas',
      price: {
        type: 'one_time_price',
        price: 1000,   // $10.00 in cents
        currency: 'USD',
        discount: 0,
        purchasing_power_parity: false,
      },
      credit_entitlements: [{
        credit_entitlement_id: entitlementId,
        credits_amount: '1000',
      }],
    });
    console.log('Starter Pack:', starter.product_id);

    // Product 2: Growth Pack - $50 for 5,500 requests (10% bonus)
    const growth = await client.products.create({
      name: 'Growth Pack',
      description: '5,500 API requests ($0.009/req with 10% bonus)',
      tax_category: 'saas',
      price: {
        type: 'one_time_price',
        price: 5000,   // $50.00 in cents
        currency: 'USD',
        discount: 0,
        purchasing_power_parity: false,
      },
      credit_entitlements: [{
        credit_entitlement_id: entitlementId,
        credits_amount: '5500',
      }],
    });
    console.log('Growth Pack:', growth.product_id);

    // Product 3: Pro Pack - $100 for 12,000 requests (20% bonus)
    const pro = await client.products.create({
      name: 'Pro Pack',
      description: '12,000 API requests ($0.0083/req with 20% bonus)',
      tax_category: 'saas',
      price: {
        type: 'one_time_price',
        price: 10000,  // $100.00 in cents
        currency: 'USD',
        discount: 0,
        purchasing_power_parity: false,
      },
      credit_entitlements: [{
        credit_entitlement_id: entitlementId,
        credits_amount: '12000',
      }],
    });
    console.log('Pro Pack:', pro.product_id);

    console.log('\n=== All Done! ===');
    console.log(`Entitlement ID: ${entitlementId}`);
    console.log(`Starter: ${starter.product_id}`);
    console.log(`Growth: ${growth.product_id}`);
    console.log(`Pro: ${pro.product_id}`);

  } catch (err) {
    console.error('Error:', err.message);
    if (err.status) console.error('Status:', err.status);
    if (err.body) console.error('Body:', err.body);
  }
}

main();
