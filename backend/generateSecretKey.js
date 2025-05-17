const crypto = require('crypto');
const SECRET_KEY = crypto.randomBytes(64).toString('hex');
console.log('Your secret key:', SECRET_KEY);
