Backend structure (professional layout)

- src/server.js: process bootstrap and HTTP startup
- src/app.js: express app composition
- src/config/: env and database integration
- src/routes/: centralized API route registration
- src/middlewares/: request logger, API 404, global error handler
- src/modules/: domain modules (auth, products, cart, orders)

Compatibility layers in ../models, ../middleware, and ../config are still reused by some modules.

