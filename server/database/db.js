console.log('=== Configuration Base de Données ===');
console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Logique de sélection de base de données
let db, initDatabase;

if (process.env.DATABASE_URL) {
    // Utiliser PostgreSQL si DATABASE_URL est configuré
    console.log('🚀 Utilisation de PostgreSQL (DATABASE_URL configuré)');
    const postgres = require('./postgres-init');
    db = postgres.pool;
    initDatabase = postgres.initDatabase;
} else {
    // Utiliser SQLite par défaut (développement local)
    console.log('🚀 Utilisation de SQLite (développement local)');
    const sqlite = require('./init');
    db = sqlite.db;
    initDatabase = sqlite.initDatabase;
}

console.log('===================================');

module.exports = { db, initDatabase };