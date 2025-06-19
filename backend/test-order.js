const axios = require('axios');

// Test order creation with 3 Château Margaux wines
async function testOrderCreation() {
  try {
    const orderData = {
      userId: 'cmc0x7gq0000b1uf60jwkfh9n', // Berta's ID
      items: [
        {
          itemId: '18', // Château Margaux 2015
          quantity: 3
        }
      ]
    };

    console.log('Sending order request:', JSON.stringify(orderData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/order', orderData, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'cmc0x7gq0000b1uf60jwkfh9n' // Required for auth
      }
    });

    console.log('Order created successfully:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Expected total: 3 × 133.80 = 401.40
    const expectedTotal = 3 * 133.80;
    console.log(`Expected total: €${expectedTotal}`);
    console.log(`Actual total: €${response.data.order.total}`);
    
  } catch (error) {
    console.error('Error creating order:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOrderCreation();
