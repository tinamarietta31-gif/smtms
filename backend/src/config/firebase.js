const admin = require('firebase-admin');
const config = require('./index');

// Initialize Firebase Admin without credentials locally
// This will allow token verification assuming the default service account or just via projectId.
const firebaseConfig = {
    projectId: 'smartmtms'
};

admin.initializeApp(firebaseConfig);

module.exports = admin;
