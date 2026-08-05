const http = require('https');

const apiKey = 'AIzaSyBmlJYSQPcyNP0332P3Y7pSLe4wRUCkZwE';
const data = JSON.stringify({
  email: 'admin@clinic.com',
  password: 'password123',
  returnSecureToken: true
});

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  path: `/v1/accounts:signUp?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('User created successfully!');
      console.log('Response:', JSON.parse(body));
    } else {
      console.log(`Failed to create user. Status Code: ${res.statusCode}`);
      console.log('Error details:', JSON.parse(body));
    }
  });
});

req.on('error', error => {
  console.error('Request error:', error);
});

req.write(data);
req.end();
