// 

module.exports = function validateConfiguration() {
  if (!process.env.JWT_PRIVATE_KEY) {
    throw new Error(
      "FATAL ERROR: JWT_PRIVATE_KEY environment variable is missing"
    );
  }
};