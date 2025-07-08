const bcrypt = require('bcryptjs');

async function generatePassword(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log('\n🔐 Configuration du mot de passe administrateur\n');
    console.log('Mot de passe:', password);
    console.log('Hash généré:', hash);
    console.log('\n📝 Instructions:');
    console.log('1. Ajoutez cette variable d\'environnement:');
    console.log(`   ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('2. Ou modifiez le fichier server/middleware/auth.js');
    console.log('\n⚠️  Gardez ce mot de passe en sécurité!\n');
}

const password = process.argv[2] || 'admin123';
generatePassword(password).catch(console.error);