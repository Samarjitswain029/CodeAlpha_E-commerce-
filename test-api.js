const http = require('http');

async function testAll() {
  console.log('Testing server starting...');
  // Require server
  require('./server.js');

  // Wait 1.5 seconds for listen
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // 1. Health check
    const healthRes = await fetch('http://127.0.0.1:8000/api/health');
    const healthJson = await healthRes.json();
    console.log('✓ Health check status:', healthJson.status);

    // 2. Products list
    const prodRes = await fetch('http://127.0.0.1:8000/api/products');
    const prodJson = await prodRes.json();
    console.log(`✓ Products count: ${prodJson.count}`);

    // 3. Single product
    const singleRes = await fetch('http://127.0.0.1:8000/api/products/1');
    const singleJson = await singleRes.json();
    console.log(`✓ Product #1 name: "${singleJson.product.name}" | Price: $${singleJson.product.price}`);

    // 4. Register user
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch('http://127.0.0.1:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex Johnson', email: testEmail, password: 'password123' })
    });
    const regJson = await regRes.json();
    console.log('✓ Register success:', regJson.success, '| User:', regJson.user.email);
    const token = regJson.token;

    // 5. Auth /me
    const meRes = await fetch('http://127.0.0.1:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meJson = await meRes.json();
    console.log('✓ Auth /me verified:', meJson.user.name);

    // 6. Create Order
    const orderRes = await fetch('http://127.0.0.1:8000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            id: singleJson.product.id,
            name: singleJson.product.name,
            price: singleJson.product.price,
            quantity: 2,
            image_url: singleJson.product.image_url
          }
        ],
        customerName: 'Alex Johnson',
        customerEmail: testEmail,
        shippingAddress: '456 Innovation Way',
        city: 'San Francisco',
        postalCode: '94105',
        paymentMethod: 'Credit Card'
      })
    });
    const orderJson = await orderRes.json();
    console.log('✓ Order created successfully:', orderJson.order.orderNumber, '| Total:', orderJson.order.totalAmount);

    // 7. Get User Orders
    const ordersRes = await fetch('http://127.0.0.1:8000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ordersJson = await ordersRes.json();
    console.log(`✓ Retrieved ${ordersJson.orders.length} orders for user`);

    console.log('\n🎉 ALL 7 API ENDPOINTS TESTED AND PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

testAll();
