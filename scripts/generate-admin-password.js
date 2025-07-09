const bcrypt = require('bcryptjs');

async function generatePassword(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hash generated:');
    console.log(hash);
    console.log('\nAdd this to your environment variables:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

const password = process.argv[2] || 'admin123';
generatePassword(password).catch(console.error);