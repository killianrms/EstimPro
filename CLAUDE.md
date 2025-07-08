# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
- `npm start` - Start the production server on port 3000
- `npm run dev` - Start development server with nodemon for auto-restart

### Dependencies
- `npm install` - Install all dependencies (automatically initializes SQLite database via postinstall)
- `npm run build` - Placeholder script (no build step currently required)

### Database
- Database auto-initializes on `npm install` via `postinstall` script
- Manual initialization: `node server/database/init.js`
- SQLite database files are gitignored - each deployment starts fresh

## Architecture Overview

This is a French real estate estimation web application ("EstimPro") built with Node.js/Express backend and vanilla JavaScript frontend.

### Core Components

**Backend Structure:**
- `server/app.js` - Main Express server with security middleware (helmet, rate limiting, session management)
- `server/database/init.js` - SQLite database initialization with pre-populated price data for major French cities
- `server/routes/estimation.js` - API endpoint for property estimation calculations
- `server/routes/admin.js` - Admin panel APIs (statistics, export, deletion)
- `server/routes/auth.js` - Authentication for admin panel
- `server/middleware/auth.js` - Authentication middleware with bcrypt password hashing

**Frontend Structure:**
- `public/index.html` - Main user-facing estimation form (9-step wizard)
- `public/admin.html` - Admin dashboard for managing estimations
- `public/js/script.js` - Multi-step form logic and validation
- `public/js/google-places.js` - Google Places API integration for address autocomplete

### Database Schema

**Tables:**
- `estimations` - Stores all property estimations with user details and calculated prices
- `price_data` - Pre-populated price per square meter data for French cities by property type

### Key Features

**Estimation Logic:**
- Base price calculated from surface area × price per m² (city-specific)
- Condition multipliers: excellent (+10%), good (0%), average (-10%), renovation needed (-20%)
- Age multipliers: <5 years (+5%), >30 years (-5%)
- Final estimate includes ±10% variance for min/max range

**Property Types Supported:**
- appartement, maison, terrain, immeuble, commerce

**Security Features:**
- Session-based admin authentication
- Rate limiting on API endpoints
- Input validation with express-validator
- Helmet for security headers
- CORS configuration

### Admin Panel

**Default Credentials:**
- Username: admin
- Password: admin123 (hash stored in auth.js)

**Features:**
- View all estimations with pagination
- Export to Excel (XLSX format)
- Delete estimations
- Statistics by city and property type

### Configuration

**Environment Variables:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to "development" or "production"
- `SESSION_SECRET` - Session secret for production
- `ADMIN_USERNAME` - Admin username (default: admin)
- `ADMIN_PASSWORD_HASH` - Bcrypt hash of admin password
  - Generate hash: `node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"`
- `GOOGLE_PLACES_API_KEY` - Required for address autocomplete functionality

### Google Places Integration

The application integrates with Google Places API for address autocomplete. Configuration is handled in `public/js/google-places.js` and requires API key setup (see `GOOGLE_PLACES_SETUP.md`).

## Development Notes

- The application uses SQLite for data persistence with automatic database initialization
- Price data is pre-populated for major French cities (Paris, Lyon, Marseille, etc.)
- Frontend uses vanilla JavaScript with no framework dependencies
- Admin panel requires authentication but has no user registration flow
- All text and UI is in French as this is a French real estate application

## Deployment

**Supported Platforms:**
- Railway: Configuration in `railway.json` (NIXPACKS builder, auto-restart on failure)
- Render: Configuration in `render.yaml` (auto-generates SESSION_SECRET)
- PM2 (for VPS deployment):
  ```bash
  pm2 start server/app.js --name "estimpro"
  pm2 startup
  pm2 save
  ```

## Development Roadmap

Key priorities from TODO.md:
- **Testing**: No tests currently exist - Jest for unit tests and Cypress for E2E tests are planned
- **TypeScript Migration**: Future consideration for better type safety
- **ML Integration**: Plans to integrate machine learning for more accurate price predictions
- **Enhanced Admin Features**: Chart.js visualizations, multi-admin support, email notifications
- **Additional Property Criteria**: Transport proximity, sun exposure, view quality
- **Multi-language Support**: Currently French-only, internationalization planned

## Repository Information

- **GitHub**: https://github.com/killianrms/EstimPro
- **Author**: Killian (killianrms)
- **License**: MIT