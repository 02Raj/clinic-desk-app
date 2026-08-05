const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// We don't have the service account, wait.
// I can just query it through an HTTP function or just trust that it worked.
