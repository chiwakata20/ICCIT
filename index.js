const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
  override: true,
});

const express = require("express");
const mongoose = require("mongoose");

const app = express();

console.log("MONGODB_URI configured:", Boolean(process.env.MONGODB_URI));

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ICCIT API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "connecting",
    timestamp: new Date().toISOString(),
  });
});

// Start the server locally, but not when imported by Vercel.
if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
}

module.exports = app;