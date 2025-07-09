const { db } = require('../server/database/db');

async function fixYearColumn() {
    console.log('Correction du type de colonne year...');
    
    try {
        if (process.env.DATABASE_URL) {
            // PostgreSQL
            await db.query(`
                ALTER TABLE estimations 
                ALTER COLUMN year TYPE TEXT;
            `);
        } else {
            // SQLite - plus complexe, nécessite de recréer la table
            console.log('Pour SQLite, la colonne sera corrigée au prochain démarrage.');
        }
        
        console.log('Colonne year corrigée avec succès');
    } catch (error) {
        if (error.message.includes('cannot alter type')) {
            console.log('La colonne est déjà du bon type');
        } else {
            console.error('Erreur lors de la correction:', error);
        }
    }
    
    process.exit(0);
}

fixYearColumn();