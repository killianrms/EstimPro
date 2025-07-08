# 🏠 EstimPro - Plateforme d'Estimation Immobilière

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-orange.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 À propos

**EstimPro** est une plateforme web moderne et intuitive qui permet aux particuliers d'obtenir **gratuitement** une estimation précise de leur bien immobilier en quelques minutes seulement.

🌟 **Pourquoi EstimPro ?**
- Interface **simple et guidée** en 9 étapes
- Estimation **instantanée** basée sur les données du marché
- **Autocomplétion intelligente** des adresses
- Panneau d'administration **professionnel** pour la gestion
- **100% gratuit** et sans engagement

## ✨ Fonctionnalités

### 🎯 Pour les utilisateurs
- **Formulaire interactif** en 9 étapes avec validation
- **Autocomplétion d'adresses** via Google Places API
- **Estimation automatique** basée sur les prix du marché local
- **Interface responsive** et moderne
- **Calcul personnalisé** selon l'état du bien et l'année de construction
- **Résultat instantané** avec fourchette de prix

### 👨‍💼 Pour les administrateurs
- **Tableau de bord** avec statistiques en temps réel
- **Gestion des estimations** avec système de statuts
- **Filtres avancés** (recherche, ville, statut, date)
- **Tri par colonnes** (date, nom, ville, prix, etc.)
- **Export Excel** des données
- **Suppression sécurisée** des estimations
- **Notes de traitement** pour chaque estimation

## 🚀 Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de données
- **bcryptjs** - Chiffrement des mots de passe
- **express-validator** - Validation des données
- **helmet** - Sécurité HTTP
- **express-rate-limit** - Limitation des requêtes

### Frontend
- **HTML5/CSS3** - Interface utilisateur
- **JavaScript ES6** - Interactions dynamiques
- **Google Places API** - Autocomplétion d'adresses

### Sécurité
- **Authentification** par session
- **Validation** des données côté serveur
- **Rate limiting** sur les API
- **CSP (Content Security Policy)**
- **Protection CSRF**

## 📦 Installation

### Prérequis
- Node.js (v14+)
- npm ou yarn

### Installation locale

1. **Cloner le projet**
```bash
git clone https://github.com/killianrms/EstimPro.git
cd EstimPro
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Modifier les valeurs dans .env
```

4. **Démarrer l'application**
```bash
npm start
```

L'application sera disponible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Google Places API
GOOGLE_PLACES_API_KEY=votre_cle_api_google

# Configuration Admin
ADMIN_USERNAME=votre_username
ADMIN_PASSWORD_HASH=hash_bcrypt_du_mot_de_passe

# Configuration Serveur
PORT=3000
NODE_ENV=production
SESSION_SECRET=votre_secret_ultra_secure
```

### Obtenir une clé Google Places API

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Places API" et "Maps JavaScript API"
4. Créez une clé API dans "Identifiants"
5. Configurez les restrictions pour sécuriser votre clé

## 🗄️ Structure de la base de données

### Table `estimations`
- Informations du bien (adresse, type, surface, etc.)
- Données client (nom, email, téléphone)
- Prix estimés et métadonnées
- Statut de traitement (nouveau, en-cours, traité, rejeté)
- Notes de traitement

### Table `price_data`
- Prix au m² par ville et type de bien
- Données pré-remplies pour les principales villes françaises

## 📊 Administration

### Accès à l'interface d'administration
- URL : `http://localhost:3000/admin`
- Connexion avec les identifiants configurés dans `.env`

### Fonctionnalités admin
- **Statistiques** : Total, nouveaux, par ville, par type
- **Filtres** : Recherche, statut, ville, pagination
- **Actions** : Changer statut, ajouter notes, supprimer
- **Export** : Télécharger les données en Excel

## 🔧 Scripts disponibles

```bash
# Démarrer en mode production
npm start

# Démarrer en mode développement (avec nodemon)
npm run dev

# Générer un hash de mot de passe pour l'admin
node -e "console.log(require('bcryptjs').hashSync('votre_mot_de_passe', 10))"
```

## 🚀 Déploiement

### Déploiement sur Heroku, Railway, ou Render

1. **Configurer les variables d'environnement** sur la plateforme
2. **Pusher le code** vers le dépôt connecté
3. **Vérifier que PORT** est configuré automatiquement
4. **Tester l'application** déployée

### Déploiement sur VPS

1. **Cloner le projet** sur le serveur
2. **Installer les dépendances** : `npm install --production`
3. **Configurer les variables d'environnement**
4. **Utiliser PM2** pour la gestion des processus :
```bash
npm install -g pm2
pm2 start server/app.js --name "estimpro"
pm2 startup
pm2 save
```

## 🧪 Calcul d'estimation

L'estimation est calculée selon la formule :

**Prix de base** = Prix au m² × Surface

**Multiplicateurs appliqués** :
- **État du bien** : Excellent (+10%), Bon (0%), Moyen (-10%), À rénover (-20%)
- **Âge du bien** : < 5 ans (+5%), > 30 ans (-5%)
- **Fourchette finale** : ±10% pour obtenir min/max

## 🔒 Sécurité

- **Authentification** sécurisée par bcrypt
- **Sessions** avec secret configuré
- **Rate limiting** pour éviter le spam
- **Validation** stricte des données
- **CSP** configuré pour éviter les attaques XSS
- **HTTPS** recommandé en production

## 📝 Données pré-configurées

Le système inclut des prix au m² pour les principales villes françaises :
- Paris, Lyon, Marseille, Toulouse, Nice
- Nantes, Strasbourg, Montpellier, Bordeaux
- Lille, Rennes, et autres villes importantes

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une [issue GitHub](https://github.com/killianrms/EstimPro/issues)
- Contacter [Killian](https://github.com/killianrms)

---

<div align="center">

**EstimPro** - Estimation immobilière simplifiée 🏠✨

Made with ❤️ by [Killian](https://github.com/killianrms)

[⭐ Star ce projet](https://github.com/killianrms/EstimPro) • [🐛 Reporter un bug](https://github.com/killianrms/EstimPro/issues) • [💡 Suggérer une fonctionnalité](https://github.com/killianrms/EstimPro/issues)

</div>