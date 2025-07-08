const express = require('express');
const XLSX = require('xlsx');
const { db } = require('../database/init');

const router = express.Router();

router.get('/estimations', (req, res) => {
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
    
    const validSortColumns = ['createdAt', 'firstName', 'lastName', 'city', 'propertyType', 'status', 'estimatedPrice'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const countQuery = `SELECT COUNT(*) as total FROM estimations ${whereClause}`;
    const dataQuery = `
        SELECT * FROM estimations 
        ${whereClause}
        ORDER BY ${sortColumn} ${order} 
        LIMIT ? OFFSET ?
    `;
    
    db.get(countQuery, whereParams, (err, countRow) => {
        if (err) {
            console.error('Erreur comptage:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        db.all(dataQuery, [...whereParams, limit, offset], (err, rows) => {
            if (err) {
                console.error('Erreur récupération données:', err);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }
            
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
        });
    });
});

router.get('/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM estimations',
        byType: 'SELECT propertyType, COUNT(*) as count FROM estimations GROUP BY propertyType',
        byCity: 'SELECT city, COUNT(*) as count FROM estimations GROUP BY city ORDER BY count DESC LIMIT 10',
        avgPrice: 'SELECT AVG(estimatedPrice) as avg, propertyType FROM estimations GROUP BY propertyType',
        recent: 'SELECT COUNT(*) as count FROM estimations WHERE createdAt > datetime("now", "-7 days")'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], (err, rows) => {
            if (err) {
                console.error(`Erreur stats ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json({ success: true, stats: results });
            }
        });
    });
});

router.get('/export', (req, res) => {
    const query = `
        SELECT 
            id, address, propertyType, surface, rooms, condition, year,
            firstName, lastName, email, phone,
            estimatedPrice, estimatedPriceMax, pricePerSqm,
            city, postalCode, createdAt
        FROM estimations 
        ORDER BY createdAt DESC
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Erreur export:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        const worksheet = XLSX.utils.json_to_sheet(rows.map(row => ({
            'ID': row.id,
            'Adresse': row.address,
            'Type': row.propertyType,
            'Surface (m²)': row.surface,
            'Pièces': row.rooms,
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
            'Date création': row.createdAt
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimations');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=estimations.xlsx');
        res.send(buffer);
    });
});

router.delete('/estimation/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM estimations WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Erreur suppression:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Estimation non trouvée' });
        }
        
        res.json({ success: true, message: 'Estimation supprimée' });
    });
});

// Changer le statut d'une estimation
router.put('/estimation/:id/status', (req, res) => {
    const id = req.params.id;
    const { status, notes } = req.body;
    
    const validStatuses = ['nouveau', 'en-cours', 'traite', 'rejete'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    
    const processedAt = status === 'traite' ? new Date().toISOString() : null;
    
    db.run(
        'UPDATE estimations SET status = ?, notes = ?, processedAt = ? WHERE id = ?', 
        [status, notes || null, processedAt, id], 
        function(err) {
            if (err) {
                console.error('Erreur mise à jour statut:', err);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Estimation non trouvée' });
            }
            
            res.json({ success: true, message: 'Statut mis à jour' });
        }
    );
});

// Obtenir les villes disponibles pour les filtres
router.get('/cities', (req, res) => {
    db.all('SELECT DISTINCT city FROM estimations WHERE city IS NOT NULL ORDER BY city', (err, rows) => {
        if (err) {
            console.error('Erreur récupération villes:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        res.json({ success: true, cities: rows.map(row => row.city) });
    });
});

module.exports = router;