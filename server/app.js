require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDatabase } = require('./database/init');
const estimationRoutes = require('./routes/estimation');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
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
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Fix for deployment - handle different deployment environments
let publicPath;
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected');
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // List directory contents to debug
    console.log('Contents of current directory:', fs.readdirSync(process.cwd()));
    console.log('Contents of parent directory:', fs.readdirSync(path.join(process.cwd(), '..')));
    
    // Try multiple possible paths
    const possiblePaths = [
        path.join(__dirname, '../public'),
        path.join(process.cwd(), 'public'),
        path.join(process.cwd(), '../public'),
        '/opt/render/project/src/public',
        '/opt/render/project/public'
    ];
    
    for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            publicPath = testPath;
            console.log('Found public directory at:', publicPath);
            break;
        }
    }
    
    if (!publicPath) {
        console.error('Could not find public directory!');
        publicPath = path.join(__dirname, '../public');
    }
} else {
    publicPath = path.join(__dirname, '../public');
}

app.use(express.static(publicPath));

// Authentication middleware
app.use(requireAuth);

app.use('/api', estimationRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/admin', adminRoutes);

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

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        console.log(`📊 Interface admin: http://localhost:${PORT}/admin`);
    });
}).catch(error => {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
});