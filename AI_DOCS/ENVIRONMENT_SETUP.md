# Environment Setup for Type Trainer

This document explains how to set up environment variables for the Type Trainer application.

## Environment Variables

### Frontend (Vite)

Create a `.env` file in the root directory with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=Type Trainer
VITE_APP_VERSION=1.0.0
```

### Backend (Node.js)

Create a `.env` file in the `server` directory with the following variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./typing_trainer.db

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Environment Files

### .env.example

This file serves as a template for environment variables. Copy it to `.env` and update the values:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your specific values
nano .env
```

### .gitignore

The following environment files are ignored by Git:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Configuration Files

### Frontend Configuration

The frontend uses `src/config/environment.ts` to manage environment variables:

```typescript
import { config } from '../config/environment';

// Access configuration
console.log(config.apiBaseUrl); // http://localhost:3001/api
console.log(config.appName);    // Type Trainer
```

### Backend Configuration

The backend uses `server/config.js` to manage environment variables:

```javascript
const config = require('./config');

// Access configuration
console.log(config.port);     // 3001
console.log(config.dbPath);   // ./typing_trainer.db
```

## Development vs Production

### Development

For development, use the default values or create a `.env.development` file:

```bash
# Development environment
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001/api
```

### Production

For production, create a `.env.production` file:

```bash
# Production environment
NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
PORT=3001
```

## Security Considerations

1. **Never commit `.env` files** - They contain sensitive information
2. **Use different values** for development and production
3. **Validate environment variables** - The app will warn about missing required variables
4. **Use strong passwords** for production databases
5. **Limit CORS origins** in production

## Troubleshooting

### Missing Environment Variables

If you see warnings about missing environment variables:

1. Check that your `.env` file exists
2. Verify the variable names match exactly
3. Restart the development server after adding variables

### API Connection Issues

If the frontend can't connect to the backend:

1. Check `VITE_API_BASE_URL` in your `.env` file
2. Verify the backend server is running
3. Check CORS configuration in `server/config.js`

### Database Issues

If the database isn't working:

1. Check `DB_PATH` in your server `.env` file
2. Verify the database file exists
3. Check file permissions

## Example .env Files

### Root Directory (.env)

```bash
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Type Trainer
VITE_APP_VERSION=1.0.0
```

### Server Directory (.env)

```bash
# Backend Environment Variables
PORT=3001
NODE_ENV=development
DB_PATH=./typing_trainer.db
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```
