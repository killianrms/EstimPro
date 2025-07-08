const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../server/database/estimation.db');
const db = new sqlite3.Database(dbPath);

console.log('Ajout des colonnes pour les tailles des extérieurs...');

db.serialize(() => {
    // Ajouter une colonne JSON pour stocker toutes les tailles des extérieurs
    db.run(`ALTER TABLE estimations ADD COLUMN exteriorSizes TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erreur ajout colonne exteriorSizes:', err);
        } else if (!err) {
            console.log('Colonne exteriorSizes ajoutée avec succès');
        } else {
            console.log('Colonne exteriorSizes existe déjà');
        }
    });
});

db.close(() => {
    console.log('Migration terminée');
});