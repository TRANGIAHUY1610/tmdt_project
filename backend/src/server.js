require("./config/env");

const createApp = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/database");
const validateEnv = require("./config/validateEnv");

function listenWithFallback(app, preferredPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryListen = (port) => {
      const server = app.listen(port, () => {
        resolve({ server, port });
      });

      server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && attempts < maxAttempts - 1) {
          attempts += 1;
          const nextPort = port + 1;
          console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
          tryListen(nextPort);
          return;
        }

        reject(error);
      });
    };

    tryListen(preferredPort);
  });
}

async function startServer() {
  try {
    validateEnv();
    console.log("Connecting to MySQL...");
    await connectDB();

    const app = createApp();
    const { server, port } = await listenWithFallback(app, env.port, 10);

    console.log("\n==========================================");
    console.log(" GymStore Server Started Successfully");
    console.log("==========================================");
    console.log(` Server:   http://localhost:${port}`);
    console.log(` Frontend: http://localhost:${port}`);
    console.log(` Health:   http://localhost:${port}/api/health`);
    console.log("==========================================\n");

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down server...`);
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    return { app, server };
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
