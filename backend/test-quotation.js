const axios = require('axios');

async function testQuotation() {
  try {
    const res = await axios.post('http://localhost:4000/api/quotations', {
      customerId: 1,
      motorcycleId: 1,
      items: [
        {
          itemType: 'PART',
          itemName: 'Test Part',
          quantity: 1,
          unitPrice: 10,
          partId: 1
        }
      ],
      jobId: 13,
      createdById: 1
    }, {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    console.log('SUCCESS:', res.data);
  } catch (e) {
    if (e.response) {
      console.error('API ERROR:', e.response.status, e.response.data);
    } else {
      console.error('NETWORK ERROR:', e.message);
    }
  }
}

testQuotation();
