const http = require('https');

const data = JSON.stringify({
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '1418691730318317',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15551593351',
              phone_number_id: '1280204118498625',
            },
            messages: [
              {
                from: '917236998742',
                id: `test-hi-${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                text: { body: 'Hi' },
                type: 'text',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
});

const req = http.request(
  {
    hostname: 'us-central1-clinic-desk-os.cloudfunctions.net',
    path: '/whatsappWebhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = '';
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('BODY:', body || '(empty)');
    });
  },
);

req.on('error', (error) => {
  console.error('REQUEST ERROR:', error);
});

req.write(data);
req.end();
