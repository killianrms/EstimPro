const express = require('express');
const XLSX = require('xlsx');
const { get, all, run } = require('../database/query-adapter');

const router = express.Router();

router.get('/estimations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';
        const statusFilter = req.query.status;
        const cityFilter = req.query.city;
        const search = req.query.search;
        
        let whereClause = '';
        let whereParams = [];
        
        const filters = [];
        if (statusFilter) {
            filters.push('status = ?');
            whereParams.push(statusFilter);
        }
        if (cityFilter) {
            filters.push('city LIKE ?');
            whereParams.push(`%${cityFilter}%`);
        }
        if (search) {
            filters.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?)');
            whereParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (filters.length > 0) {
            whereClause = 'WHERE ' + filters.join(' AND ');
        }
        
        const validSortColumns = ['createdAt', 'firstName', 'lastName', 'city', 'propertyType', 'status', 'estimatedPrice', 'surface', 'phone', 'email'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        const countQuery = `SELECT COUNT(*) as total FROM estimations ${whereClause}`;
        const dataQuery = `
            SELECT * FROM estimations 
            ${whereClause}
            ORDER BY ${sortColumn} ${order} 
            LIMIT ? OFFSET ?
        `;
        
        const countRow = await get(countQuery, whereParams);
        const rows = await all(dataQuery, [...whereParams, limit, offset]);
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total: countRow.total,
                pages: Math.ceil(countRow.total / limit)
            }
        });
    } catch (err) {
        console.error('Erreur récupération estimations:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const { isPostgres } = require('../database/query-adapter');
        
        const queries = {
            total: 'SELECT COUNT(*) as count FROM estimations',
            byType: 'SELECT propertyType, COUNT(*) as count FROM estimations GROUP BY propertyType',
            byCity: 'SELECT city, COUNT(*) as count FROM estimations GROUP BY city ORDER BY count DESC LIMIT 10',
            avgPrice: 'SELECT AVG(estimatedPrice) as avg, propertyType FROM estimations GROUP BY propertyType',
            recent: isPostgres 
                ? 'SELECT COUNT(*) as count FROM estimations WHERE createdAt > NOW() - INTERVAL \'7 days\''
                : 'SELECT COUNT(*) as count FROM estimations WHERE createdAt > datetime("now", "-7 days")'
        };
        
        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            try {
                results[key] = await all(query);
            } catch (err) {
                console.error(`Erreur stats ${key}:`, err);
                results[key] = [];
            }
        }
        
        res.json({ success: true, stats: results });
    } catch (err) {
        console.error('Erreur stats:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.get('/export', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, address, propertyType, surface, rooms, bedrooms, floor, dpe, condition, year,
                firstName, lastName, email, phone,
                estimatedPrice, estimatedPriceMax, pricePerSqm,
                city, postalCode, 
                balconsCount, terrassesCount, cavesCount, garagesCount, boxesCount, parkingCount,
                elevator, multiFloor, workNeeded, importantWorkTypes, refreshmentWorkTypes,
                estimationReason, projectTimeline, status, notes, createdAt
            FROM estimations 
            ORDER BY createdAt DESC
        `;
        
        const rows = await all(query);
        
        const worksheet = XLSX.utils.json_to_sheet(rows.map(row => ({
            'ID': row.id,
            'Adresse': row.address,
            'Type': row.propertyType,
            'Surface (m²)': row.surface,
            'Pièces': row.rooms || 'N/A',
            'Chambres': row.bedrooms || 'N/A',
            'Étage': row.floor || 'N/A',
            'DPE': row.dpe || 'N/A',
            'État': row.condition,
            'Année': row.year || 'N/A',
            'Prénom': row.firstName,
            'Nom': row.lastName,
            'Email': row.email,
            'Téléphone': row.phone,
            'Prix estimé (min)': row.estimatedPrice,
            'Prix estimé (max)': row.estimatedPriceMax,
            'Prix au m²': row.pricePerSqm,
            'Ville': row.city,
            'Code postal': row.postalCode,
            'Balcons': row.balconsCount || 0,
            'Terrasses': row.terrassesCount || 0,
            'Caves': row.cavesCount || 0,
            'Garages': row.garagesCount || 0,
            'Boxes': row.boxesCount || 0,
            'Places parking': row.parkingCount || 0,
            'Ascenseur': row.elevator || 'N/A',
            'Multi-étages': row.multiFloor || 'N/A',
            'Travaux': row.workNeeded || 'N/A',
            'Travaux importants': row.importantWorkTypes || 'N/A',
            'Travaux rafraîchissement': row.refreshmentWorkTypes || 'N/A',
            'Raison estimation': row.estimationReason || 'N/A',
            'Délai projet': row.projectTimeline || 'N/A',
            'Statut': row.status || 'nouveau',
            'Notes': row.notes || '',
            'Date création': row.createdAt
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimations');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=estimations.xlsx');
        res.send(buffer);
    } catch (err) {
        console.error('Erreur export:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.delete('/estimation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const result = await run('DELETE FROM estimations WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Estimation non trouvée' });
        }
        
        res.json({ success: true, message: 'Estimation supprimée' });
    } catch (err) {
        console.error('Erreur suppression:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Changer le statut d'une estimation
router.put('/estimation/:id/status', async (req, res) => {
    try {
        const id = req.params.id;
        const { status, notes } = req.body;
        
        const validStatuses = ['nouveau', 'en-cours', 'traite', 'rejete'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }
        
        const processedAt = status === 'traite' ? new Date().toISOString() : null;
        
        const result = await run(
            'UPDATE estimations SET status = ?, notes = ?, processedAt = ? WHERE id = ?', 
            [status, notes || null, processedAt, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Estimation non trouvée' });
        }
        
        res.json({ success: true, message: 'Statut mis à jour' });
    } catch (err) {
        console.error('Erreur mise à jour statut:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir les villes disponibles pour les filtres
router.get('/cities', async (req, res) => {
    try {
        const rows = await all('SELECT DISTINCT city FROM estimations WHERE city IS NOT NULL ORDER BY city COLLATE NOCASE ASC');
        
        res.json({ success: true, cities: rows.map(row => row.city) });
    } catch (err) {
        console.error('Erreur récupération villes:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir les détails complets d'une estimation
router.get('/estimation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const row = await get('SELECT * FROM estimations WHERE id = ?', [id]);
        
        if (!row) {
            return res.status(404).json({ success: false, message: 'Estimation non trouvée' });
        }
        
        res.json({ success: true, estimation: row });
    } catch (err) {
        console.error('Erreur récupération estimation:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;