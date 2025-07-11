const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'estimation.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS estimations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT NOT NULL,
                    propertyType TEXT NOT NULL,
                    surface INTEGER NOT NULL,
                    rooms TEXT,
                    bedrooms TEXT,
                    floor TEXT,
                    dpe TEXT,
                    condition TEXT NOT NULL,
                    estimationReason TEXT,
                    projectTimeline TEXT,
                    year TEXT,
                    firstName TEXT NOT NULL,
                    lastName TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    estimatedPrice INTEGER NOT NULL,
                    estimatedPriceMax INTEGER NOT NULL,
                    pricePerSqm INTEGER NOT NULL,
                    city TEXT,
                    postalCode TEXT,
                    status TEXT DEFAULT 'nouveau',
                    processedAt DATETIME,
                    notes TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    balconsCount INTEGER DEFAULT 0,
                    terrassesCount INTEGER DEFAULT 0,
                    cavesCount INTEGER DEFAULT 0,
                    garagesCount INTEGER DEFAULT 0,
                    boxesCount INTEGER DEFAULT 0,
                    parkingCount INTEGER DEFAULT 0,
                    elevator TEXT,
                    multiFloor TEXT,
                    workNeeded TEXT,
                    importantWorkTypes TEXT,
                    refreshmentWorkTypes TEXT,
                    exteriorSizes TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Erreur création table estimations:', err);
                    reject(err);
                    return;
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS price_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    city TEXT NOT NULL,
                    postalCode TEXT,
                    pricePerSqm INTEGER NOT NULL,
                    propertyType TEXT NOT NULL,
                    lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Erreur création table price_data:', err);
                    reject(err);
                    return;
                }
            });


            insertDefaultPriceData();
            resolve();
        });
    });
};

const insertDefaultPriceData = () => {
    const defaultPrices = [
        { city: 'Paris', postalCode: '75001', pricePerSqm: 12000, propertyType: 'appartement' },
        { city: 'Paris', postalCode: '75001', pricePerSqm: 11000, propertyType: 'maison' },
        { city: 'Paris', postalCode: '75016', pricePerSqm: 11500, propertyType: 'appartement' },
        { city: 'Paris', postalCode: '75016', pricePerSqm: 10500, propertyType: 'maison' },
        { city: 'Paris', postalCode: '75020', pricePerSqm: 8500, propertyType: 'appartement' },
        { city: 'Paris', postalCode: '75020', pricePerSqm: 8000, propertyType: 'maison' },
        { city: 'Lyon', postalCode: '69001', pricePerSqm: 5500, propertyType: 'appartement' },
        { city: 'Lyon', postalCode: '69001', pricePerSqm: 5000, propertyType: 'maison' },
        { city: 'Lyon', postalCode: '69002', pricePerSqm: 6000, propertyType: 'appartement' },
        { city: 'Lyon', postalCode: '69002', pricePerSqm: 5500, propertyType: 'maison' },
        { city: 'Marseille', postalCode: '13001', pricePerSqm: 4000, propertyType: 'appartement' },
        { city: 'Marseille', postalCode: '13001', pricePerSqm: 3800, propertyType: 'maison' },
        { city: 'Marseille', postalCode: '13008', pricePerSqm: 4500, propertyType: 'appartement' },
        { city: 'Marseille', postalCode: '13008', pricePerSqm: 4200, propertyType: 'maison' },
        { city: 'Toulouse', postalCode: '31000', pricePerSqm: 3800, propertyType: 'appartement' },
        { city: 'Toulouse', postalCode: '31000', pricePerSqm: 3500, propertyType: 'maison' },
        { city: 'Nice', postalCode: '06000', pricePerSqm: 5200, propertyType: 'appartement' },
        { city: 'Nice', postalCode: '06000', pricePerSqm: 4800, propertyType: 'maison' },
        { city: 'Nantes', postalCode: '44000', pricePerSqm: 4200, propertyType: 'appartement' },
        { city: 'Nantes', postalCode: '44000', pricePerSqm: 3900, propertyType: 'maison' },
        { city: 'Strasbourg', postalCode: '67000', pricePerSqm: 3600, propertyType: 'appartement' },
        { city: 'Strasbourg', postalCode: '67000', pricePerSqm: 3300, propertyType: 'maison' },
        { city: 'Montpellier', postalCode: '34000', pricePerSqm: 4100, propertyType: 'appartement' },
        { city: 'Montpellier', postalCode: '34000', pricePerSqm: 3800, propertyType: 'maison' },
        { city: 'Bordeaux', postalCode: '33000', pricePerSqm: 4800, propertyType: 'appartement' },
        { city: 'Bordeaux', postalCode: '33000', pricePerSqm: 4400, propertyType: 'maison' },
        { city: 'Lille', postalCode: '59000', pricePerSqm: 3200, propertyType: 'appartement' },
        { city: 'Lille', postalCode: '59000', pricePerSqm: 2900, propertyType: 'maison' },
        { city: 'Rennes', postalCode: '35000', pricePerSqm: 3700, propertyType: 'appartement' },
        { city: 'Rennes', postalCode: '35000', pricePerSqm: 3400, propertyType: 'maison' },
        
        // Terrains
        { city: 'Paris', postalCode: '75001', pricePerSqm: 8000, propertyType: 'terrain' },
        { city: 'Lyon', postalCode: '69001', pricePerSqm: 2500, propertyType: 'terrain' },
        { city: 'Marseille', postalCode: '13001', pricePerSqm: 1800, propertyType: 'terrain' },
        { city: 'Toulouse', postalCode: '31000', pricePerSqm: 1500, propertyType: 'terrain' },
        { city: 'Nice', postalCode: '06000', pricePerSqm: 2200, propertyType: 'terrain' },
        { city: 'Nantes', postalCode: '44000', pricePerSqm: 1600, propertyType: 'terrain' },
        { city: 'Bordeaux', postalCode: '33000', pricePerSqm: 1800, propertyType: 'terrain' },
        
        // Immeubles
        { city: 'Paris', postalCode: '75001', pricePerSqm: 10000, propertyType: 'immeuble' },
        { city: 'Lyon', postalCode: '69001', pricePerSqm: 4500, propertyType: 'immeuble' },
        { city: 'Marseille', postalCode: '13001', pricePerSqm: 3200, propertyType: 'immeuble' },
        { city: 'Toulouse', postalCode: '31000', pricePerSqm: 3000, propertyType: 'immeuble' },
        { city: 'Nice', postalCode: '06000', pricePerSqm: 4200, propertyType: 'immeuble' },
        
        // Commerces
        { city: 'Paris', postalCode: '75001', pricePerSqm: 15000, propertyType: 'commerce' },
        { city: 'Lyon', postalCode: '69001', pricePerSqm: 6000, propertyType: 'commerce' },
        { city: 'Marseille', postalCode: '13001', pricePerSqm: 4500, propertyType: 'commerce' },
        { city: 'Toulouse', postalCode: '31000', pricePerSqm: 4000, propertyType: 'commerce' },
        { city: 'Nice', postalCode: '06000', pricePerSqm: 5500, propertyType: 'commerce' }
    ];

    db.get("SELECT COUNT(*) as count FROM price_data", (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification des données:', err);
            return;
        }
        
        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO price_data (city, postalCode, pricePerSqm, propertyType) 
                VALUES (?, ?, ?, ?)
            `);
            
            defaultPrices.forEach(price => {
                stmt.run(price.city, price.postalCode, price.pricePerSqm, price.propertyType);
            });
            
            stmt.finalize();
        }
    });
};

module.exports = { db, initDatabase };