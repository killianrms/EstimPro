# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
- `npm start` - Start the production server on port 3000
- `npm run dev` - Start development server with nodemon for auto-restart

### Dependencies
- `npm install` - Install all dependencies

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
- `SESSION_SECRET` - Session secret for production
- `ADMIN_USERNAME` - Admin username (default: admin)
- `ADMIN_PASSWORD_HASH` - Bcrypt hash of admin password

### Google Places Integration

The application integrates with Google Places API for address autocomplete. Configuration is handled in `public/js/google-places.js` and requires API key setup (see `GOOGLE_PLACES_SETUP.md`).

## Development Notes

- The application uses SQLite for data persistence with automatic database initialization
- Price data is pre-populated for major French cities (Paris, Lyon, Marseille, etc.)
- Frontend uses vanilla JavaScript with no framework dependencies
- Admin panel requires authentication but has no user registration flow
- All text and UI is in French as this is a French real estate application