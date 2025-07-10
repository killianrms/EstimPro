// Adaptateur de base de données qui choisit automatiquement entre SQLite et PostgreSQL
const path = require('path');

let db, initDatabase;

// Log détaillé pour déboguer
console.log('=== Configuration Base de Données ===');
console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL (masked):', process.env.DATABASE_URL ? '***' + process.env.DATABASE_URL.slice(-20) : 'non défini');

// Forcer PostgreSQL sur Render même si DATABASE_URL n'est pas encore configurée
const isRenderProduction = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

if (process.env.DATABASE_URL || process.env.FORCE_POSTGRES === 'true') {
  // Mode PostgreSQL (production/Render)
  console.log('🚀 Mode PRODUCTION: Utilisation de PostgreSQL');
  const postgres = require('./postgres-init');
  db = postgres.pool;
  initDatabase = postgres.initDatabase;
} else if (isRenderProduction) {
  // Mode de secours : SQLite sur Render en attendant PostgreSQL
  console.log('⚠️ Mode SECOURS: Utilisation de SQLite sur Render');
  console.log('🔧 IMPORTANT: Configurez DATABASE_URL pour PostgreSQL et persistance');
  console.log('📋 Données perdues à chaque redéploiement avec SQLite !');
  const sqlite = require('./init');
  db = sqlite.db;
  initDatabase = sqlite.initDatabase;
} else {
  // Mode SQLite (développement local)
  console.log('💻 Mode DÉVELOPPEMENT: Utilisation de SQLite');
  const sqlite = require('./init');
  db = sqlite.db;
  initDatabase = sqlite.initDatabase;
}

console.log('===================================');

module.exports = { db, initDatabase };