require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDatabase } = require('./database/db');
const estimationRoutes = require('./routes/estimation');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://maps.googleapis.com"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Trop de requêtes, réessayez plus tard.',
});
app.use('/api/', limiter);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre-secret-tres-securise-changez-moi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Changed to false to fix redirect issues on Render
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'lax'
    },
    name: 'estimpro.sid',
    proxy: true // Trust proxy for Render
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set public directory path
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Authentication middleware
app.use(requireAuth);

app.use('/api', estimationRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/admin/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(publicPath, 'admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

app.get('/politique-confidentialite', (req, res) => {
    res.sendFile(path.join(publicPath, 'politique-confidentialite.html'));
});

app.get('/mentions-legales', (req, res) => {
    res.sendFile(path.join(publicPath, 'mentions-legales.html'));
});

// Serve Google Maps script with API key from environment
app.get('/api/google-maps-script', (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    res.type('application/javascript');
    res.send(`
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    `);
});

// Démarrage de l'application avec initialisation de la base de données
console.log('🚀 Démarrage de l\'application EstimPro...');
console.log('📍 Environnement:', process.env.NODE_ENV || 'development');
console.log('🔧 Port:', PORT);

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
        console.log(`🌐 Application disponible sur http://localhost:${PORT}`);
        if (process.env.DATABASE_URL) {
            console.log('💾 Base de données: PostgreSQL (production)');
        } else {
            console.log('💾 Base de données: SQLite (développement)');
        }
    });
}).catch(error => {
    console.error('❌ Erreur fatale lors de l\'initialisation:', error);
    process.exit(1);
});