const mongoose = require("mongoose");

let connectionPromise = null;

module.exports = function connectDatabase() {
  // Reuse an existing MongoDB connection.
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(
      new Error("MONGODB_URI environment variable is missing")
    );
  }

  // Prevent multiple connections during concurrent Vercel requests.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
      })
      .then(() => {
        console.log("Connected to MongoDB Atlas");
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};