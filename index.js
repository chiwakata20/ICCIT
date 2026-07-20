const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env")
});

const express = require("express");
const mongoose = require("mongoose");

const app = express();

console.log(
  "MONGODB_URI configured:",
  Boolean(process.env.MONGODB_URI)
);

// Initialize application configuration.
require("./startup/config")();
require("./startup/validation")();

// Initialize MongoDB only once.
const databasePromise = require("./startup/db")();

databasePromise.catch((error) => {
  console.error("MongoDB startup error:", error.message);
});

// Health routes should be registered before any 404 middleware.
app.get("/", async (req, res) => {
  try {
    await databasePromise;

    res.status(200).json({
      success: true,
      message: "ICCIT API is running",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await databasePromise;

    res.status(200).json({
      success: true,
      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      database: "connection failed",
      timestamp: new Date().toISOString()
    });
  }
});

// Register application routes and production middleware.
require("./startup/routes")(app);
require("./startup/prod")(app);

// Only open a port during local development.
if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
}

// Vercel uses this exported Express application.
module.exports = app;