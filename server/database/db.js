// Adaptateur de base de données qui choisit automatiquement entre SQLite et PostgreSQL
const path = require('path');

let db, initDatabase;

if (process.env.DATABASE_URL) {
  // Mode PostgreSQL (production/Render)
  console.log('Utilisation de PostgreSQL');
  const postgres = require('./postgres-init');
  db = postgres.pool;
  initDatabase = postgres.initDatabase;
} else {
  // Mode SQLite (développement local)
  console.log('Utilisation de SQLite');
  const sqlite = require('./init');
  db = sqlite.db;
  initDatabase = sqlite.initDatabase;
}

module.exports = { db, initDatabase };