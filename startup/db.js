const dns = require("node:dns");
const mongoose = require("mongoose");

let connectionPromise;

module.exports = function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  // Force Node to use DNS servers that support MongoDB Atlas SRV records.
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  // Reuse an existing connection.
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  // Reuse an in-progress connection.
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    })
    .then((mongooseInstance) => {
      console.log("Connected to MongoDB Atlas.");
      return mongooseInstance.connection;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error("MongoDB Atlas connection failed:", error.message);
      throw error;
    });

  return connectionPromise;
};