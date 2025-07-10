// Configuration PostgreSQL uniquement - pas de SQLite
console.log('=== Configuration Base de Données ===');
console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Forcer PostgreSQL uniquement
console.log('🚀 Utilisation de PostgreSQL uniquement');
const postgres = require('./postgres-init');
const db = postgres.pool;
const initDatabase = postgres.initDatabase;

console.log('===================================');

module.exports = { db, initDatabase };