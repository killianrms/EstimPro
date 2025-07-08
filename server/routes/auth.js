const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateAdmin, loginLimiter } = require('../middleware/auth');

const router = express.Router();

router.post('/login', 
    loginLimiter,
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Nom d\'utilisateur requis'),
        body('password').isLength({ min: 6 }).withMessage('Mot de passe requis')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;
        
        try {
            const isAuthenticated = await authenticateAdmin(username, password);
            
            if (isAuthenticated) {
                req.session.isAuthenticated = true;
                req.session.username = username;
                req.session.loginTime = new Date();
                
                res.json({
                    success: true,
                    message: 'Connexion réussie'
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }
);

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la déconnexion'
            });
        }
        
        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    });
});

router.get('/status', (req, res) => {
    res.json({
        isAuthenticated: !!req.session.isAuthenticated,
        username: req.session.username || null,
        loginTime: req.session.loginTime || null
    });
});

module.exports = router;