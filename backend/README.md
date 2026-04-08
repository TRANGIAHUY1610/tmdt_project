# GymStore Backend

## Professional Structure

- src/server.js: application bootstrap and HTTP server lifecycle
- src/app.js: express app wiring
- src/config/: env and database access (source of truth)
- src/routes/: centralized API routes
- src/middlewares/: request logger, 404 handler, global error handler
- src/modules/: domain-oriented folders for future refactor
- models/, middleware/, config/: compatibility layers for legacy imports

## Architecture Note

- New code should import shared runtime dependencies from src/.
- Example: use src/config/database.js as the primary database module.
- backend/config/database.js is kept only for backward compatibility.

## Run

1. Copy .env.example to .env
2. Configure MySQL values in .env
3. Import SQL in phpMyAdmin:
   - ../database/tmdt_project.sql
4. Install dependencies and start:

npm install
npm run dev

# Quick checks
npm run check
npm run smoke
npm test

## Health checks

- App root: http://localhost:5000
- API health: http://localhost:5000/api/health

## Notes

- Frontend is served by backend on the same origin.
- API lives under /api.

