function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err && err.code === "ER_NO_SUCH_TABLE") {
    return res.status(500).json({
      success: false,
      message:
        "Database tables are missing. Please import database/tmdt_project.sql in phpMyAdmin and restart the server.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorHandler;
