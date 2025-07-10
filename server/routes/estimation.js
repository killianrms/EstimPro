const express = require('express');
const { body, validationResult } = require('express-validator');
const { get, run } = require('../database/query-adapter');

const router = express.Router();

const extractCityFromAddress = (address) => {
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1].trim();
    
    const postalCodeMatch = lastPart.match(/(\d{5})/);
    const postalCode = postalCodeMatch ? postalCodeMatch[1] : null;
    
    let city = lastPart.replace(/\d{5}/, '').trim();
    
    if (city.toLowerCase().includes('paris')) {
        city = 'Paris';
    } else if (city.toLowerCase().includes('lyon')) {
        city = 'Lyon';
    } else if (city.toLowerCase().includes('marseille')) {
        city = 'Marseille';
    } else if (city.toLowerCase().includes('toulouse')) {
        city = 'Toulouse';
    } else if (city.toLowerCase().includes('nice')) {
        city = 'Nice';
    } else if (city.toLowerCase().includes('nantes')) {
        city = 'Nantes';
    } else if (city.toLowerCase().includes('strasbourg')) {
        city = 'Strasbourg';
    } else if (city.toLowerCase().includes('montpellier')) {
        city = 'Montpellier';
    } else if (city.toLowerCase().includes('bordeaux')) {
        city = 'Bordeaux';
    } else if (city.toLowerCase().includes('lille')) {
        city = 'Lille';
    } else if (city.toLowerCase().includes('rennes')) {
        city = 'Rennes';
    }
    
    return { city, postalCode };
};

const calculateEstimation = (data, pricePerSqm) => {
    let basePrice = pricePerSqm * parseInt(data.surface);
    
    const conditionMultipliers = {
        'excellent': 1.1,
        'bon': 1.0,
        'moyen': 0.9,
        'a-renover': 0.8
    };
    
    const conditionMultiplier = conditionMultipliers[data.condition] || 1.0;
    basePrice *= conditionMultiplier;
    
    if (data.year) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - parseInt(data.year);
        
        if (age < 5) {
            basePrice *= 1.05;
        } else if (age > 30) {
            basePrice *= 0.95;
        }
    }
    
    const variance = 0.1;
    const minPrice = Math.round(basePrice * (1 - variance));
    const maxPrice = Math.round(basePrice * (1 + variance));
    
    return {
        estimatedPrice: minPrice,
        estimatedPriceMax: maxPrice,
        pricePerSqm: Math.round(pricePerSqm * conditionMultiplier)
    };
};

router.post('/estimate', [
    body('address').trim().isLength({ min: 5 }).withMessage('Adresse requise'),
    body('propertyType').isIn(['appartement', 'maison', 'terrain', 'immeuble', 'commerce']).withMessage('Type de bien invalide'),
    body('surface').isInt({ min: 10, max: 10000 }).withMessage('Surface invalide'),
    body('rooms').optional(),
    body('bedrooms').optional(),
    body('floor').optional(),
    body('condition').isIn(['excellent', 'bon', 'moyen', 'a-renover']).withMessage('État invalide'),
    body('firstName').trim().isLength({ min: 2 }).withMessage('Prénom requis'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Téléphone requis')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: errors.array()
        });
    }
    
    const data = req.body;
    
    // Utiliser d'abord la ville fournie par Google Places, sinon extraire depuis l'adresse
    let city = data.city;
    let postalCode = data.postalCode;
    
    if (!city) {
        const extracted = extractCityFromAddress(data.address);
        city = extracted.city;
        postalCode = postalCode || extracted.postalCode;
    }
    
    const query = `
        SELECT pricePerSqm FROM price_data 
        WHERE city = ? AND propertyType = ? 
        ORDER BY 
            CASE WHEN postalCode = ? THEN 0 ELSE 1 END,
            lastUpdated DESC 
        LIMIT 1
    `;
    
    get(query, [city, data.propertyType, postalCode])
        .then(row => {
            console.log('🔍 Recherche prix pour:', { city, propertyType: data.propertyType, postalCode });
            console.log('📊 Résultat de la requête:', row);
            
            let pricePerSqm = row ? row.pricePerSqm : 3000;
            
            const estimation = calculateEstimation(data, pricePerSqm);
            
            const insertQuery = `
                INSERT INTO estimations (
                    address, propertyType, surface, rooms, bedrooms, floor, dpe, 
                    condition, estimationReason, projectTimeline, year,
                    firstName, lastName, email, phone,
                    estimatedPrice, estimatedPriceMax, pricePerSqm,
                    city, postalCode,
                    balconsCount, terrassesCount, cavesCount, garagesCount, boxesCount, parkingCount,
                    elevator, multiFloor, workNeeded, importantWorkTypes, refreshmentWorkTypes,
                    exteriorSizes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            // Process work types arrays to strings
            const importantWorkTypes = data.importantWorkTypes ? (Array.isArray(data.importantWorkTypes) ? data.importantWorkTypes.join(',') : data.importantWorkTypes) : null;
            const refreshmentWorkTypes = data.refreshmentWorkTypes ? (Array.isArray(data.refreshmentWorkTypes) ? data.refreshmentWorkTypes.join(',') : data.refreshmentWorkTypes) : null;
            
            // Collecter les tailles des extérieurs
            const exteriorSizes = {};
            
            // Balcons
            for (let i = 1; i <= (data.balconsCount || 0); i++) {
                const size = data[`balconsSize${i}`];
                if (size) {
                    if (!exteriorSizes.balcons) exteriorSizes.balcons = [];
                    exteriorSizes.balcons.push(parseFloat(size));
                }
            }
            
            // Terrasses
            for (let i = 1; i <= (data.terrassesCount || 0); i++) {
                const size = data[`terrassesSize${i}`];
                if (size) {
                    if (!exteriorSizes.terrasses) exteriorSizes.terrasses = [];
                    exteriorSizes.terrasses.push(parseFloat(size));
                }
            }
            
            const exteriorSizesJson = Object.keys(exteriorSizes).length > 0 ? JSON.stringify(exteriorSizes) : null;
            
            return run(insertQuery, [
                data.address, data.propertyType, data.surface, 
                data.rooms || null, data.bedrooms || null, data.floor || null, data.dpe || null,
                data.condition, data.estimationReason || null, data.projectTimeline || null, data.year || null,
                data.firstName, data.lastName, data.email, data.phone,
                estimation.estimatedPrice, estimation.estimatedPriceMax, estimation.pricePerSqm,
                city, postalCode,
                data.balconsCount || 0, data.terrassesCount || 0, data.cavesCount || 0, 
                data.garagesCount || 0, data.boxesCount || 0, data.parkingCount || 0,
                data.elevator || null, data.multiFloor || null, data.workNeeded || null,
                importantWorkTypes, refreshmentWorkTypes,
                exteriorSizesJson
            ]).then(() => {
                res.json({
                    success: true,
                    estimation: estimation,
                    message: 'Estimation calculée avec succès'
                });
            });
        })
        .catch(err => {
            console.error('❌ Erreur base de données:', err);
            console.error('📋 Données reçues:', data);
            console.error('🏙️ Ville extraite:', city);
            console.error('📮 Code postal:', postalCode);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        });
});

module.exports = router;