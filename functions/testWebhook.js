const http = require('https');

const data = JSON.stringify({
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1418691730318317",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551593351",
              "phone_number_id": "1280204118498625"
            },
            "messages": [
              {
                "from": "917236998742",
                "id": "wamid.HBgMOTE3MjM2OTk4NzQyFQIAEhggQUM2RTgyNjk2OEUzRTE3MjM4RUZGMDVEN0MxREZCQUMA",
                "timestamp": "1785319193",
                "text": {
                  "body": "2"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
});

const options = {
  hostname: 'us-central1-clinic-desk-os.cloudfunctions.net',
  path: '/whatsappWebhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
