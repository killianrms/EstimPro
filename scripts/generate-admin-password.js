const bcrypt = require('bcryptjs');

async function generatePassword(password) {
    const hash = await bcrypt.hash(password, 10);
    // Password hash generated
}

const password = process.argv[2] || 'admin123';
generatePassword(password).catch(console.error);