const express = require("express");
const cors = require("cors");
const path = require("path");
const { dbHelpers } = require("./config/database");

const requestLogger = require("./middlewares/requestLogger");
const notFoundApi = require("./middlewares/notFoundApi");
const errorHandler = require("./middlewares/errorHandler");
const apiRoutes = require("./routes/api");

const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

// ===== CONTACT API =====

// POST: nhận dữ liệu từ form
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message } = req.body;

      await dbHelpers.execute(
        "INSERT INTO contacts (name, email, message) VALUES (@name, @email, @message)",
        { name, email, message }
      );

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });

// GET: admin lấy danh sách
  app.get('/api/contact', async (req, res) => {
    try {
      const data = await dbHelpers.query(
        "SELECT * FROM contacts ORDER BY id DESC"
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });

  app.patch('/api/contact/:id', async (req, res) => {
    try {
      const id = req.params.id;

      await dbHelpers.execute(
        "UPDATE contacts SET status = 'done' WHERE id = @id",
        { id }
      );

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });

  app.use("/api", apiRoutes);

  app.use(express.static(FRONTEND_DIR));

  app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    return res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  app.use("/api/*", notFoundApi);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
