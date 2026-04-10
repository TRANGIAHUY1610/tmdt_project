require("./config/env");

const createApp = require("./app");
const env = require("./config/env");
const { connectDB, dbHelpers } = require("./config/database");
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

    const http = require("http");
    const { Server } = require("socket.io");

    const app = createApp();
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*"
      }
    });

    // 🔥 SOCKET CHAT
    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("send_message", async (data) => {
        try {
          await dbHelpers.execute(
            "INSERT INTO chat_messages (sender, message) VALUES (@sender, @message)",
            {
              sender: data.sender,
              message: data.message
            }
          );

          io.emit("receive_message", data);

        } catch (err) {
          console.error(err);
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
    
    const port = env.port || 5000;

    httpServer.listen(port, () => {
      console.log("\n==========================================");
      console.log(" GymStore Server Started Successfully");
      console.log("==========================================");
      console.log(` Server:   http://localhost:${port}`);
      console.log(` Frontend: http://localhost:${port}`);
      console.log(` Health:   http://localhost:${port}/api/health`);
      console.log("==========================================\n");
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down server...`);
      httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    return { app, server: httpServer };

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
