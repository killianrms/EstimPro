const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; // 'admin123'

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par fenêtre
    message: {
        error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const requireAuth = (req, res, next) => {
    // Exclure la page de login et les routes d'authentification
    if (req.originalUrl === '/admin/login' || 
        req.originalUrl === '/api/admin/login' || 
        req.originalUrl === '/api/admin/status') {
        return next();
    }
    
    const isAdminRoute = req.originalUrl.startsWith('/admin') || req.originalUrl.startsWith('/api/admin');
    
    if (isAdminRoute && !req.session.isAuthenticated) {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentification requise' 
            });
        }
        return res.redirect('/admin/login');
    }
    
    next();
};

const authenticateAdmin = async (username, password) => {
    if (username !== ADMIN_USERNAME) {
        return false;
    }
    
    try {
        return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } catch (error) {
        console.error('Erreur authentification:', error);
        return false;
    }
};

const generatePasswordHash = async (password) => {
    return await bcrypt.hash(password, 10);
};

module.exports = {
    requireAuth,
    authenticateAdmin,
    loginLimiter,
    generatePasswordHash
};