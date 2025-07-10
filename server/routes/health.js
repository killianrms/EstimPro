const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { query } = require('../database/query-adapter');

// Route de santé pour vérifier l'état de la base de données
router.get('/health', async (req, res) => {
    try {
        const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
        
        // Test de connexion
        const testQuery = dbType === 'PostgreSQL' 
            ? 'SELECT NOW() as time, current_database() as db_name'
            : "SELECT datetime('now') as time";
        
        const testResult = await query(db, testQuery);
        
        // Compter les enregistrements
        const estimationsCount = await query(db, 'SELECT COUNT(*) as count FROM estimations');
        const priceDataCount = await query(db, 'SELECT COUNT(*) as count FROM price_data');
        
        // Vérifier les dernières estimations
        const lastEstimationQuery = dbType === 'PostgreSQL'
            ? 'SELECT id, createdAt FROM estimations ORDER BY id DESC LIMIT 1'
            : 'SELECT id, createdAt FROM estimations ORDER BY id DESC LIMIT 1';
        
        let lastEstimation = null;
        try {
            const lastEstimationResult = await query(db, lastEstimationQuery);
            lastEstimation = lastEstimationResult[0] || null;
        } catch (e) {
            // Pas d'estimations
        }
        
        res.json({
            status: 'healthy',
            database: {
                type: dbType,
                connected: true,
                time: testResult[0].time,
                databaseName: testResult[0].db_name || 'SQLite'
            },
            data: {
                estimations: estimationsCount[0].count,
                priceData: priceDataCount[0].count,
                lastEstimation: lastEstimation
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                hasDatabaseUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            database: {
                type: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
                connected: false
            }
        });
    }
});

module.exports = router;