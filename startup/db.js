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

  console.error("MongoDB connection failed:", {
    name: error.name,
    message: error.message,
    code: error.code
  });

  if (error.reason && error.reason.servers) {
    for (const [address, server] of error.reason.servers.entries()) {
      console.error("MongoDB server error:", {
        address,
        type: server.type,
        message: server.error?.message,
        code: server.error?.code
      });
    }
  }

  throw error;
});
  }

  return connectionPromise;
};