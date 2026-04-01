const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

if (process.env.NODE_ENV !== "test") {
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

const jwtSecret = process.env.JWT_SECRET || "test_secret_for_ci_only";

if (jwtSecret.length < 32 && process.env.NODE_ENV !== "test") {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_diagnosis_test",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  aiMode: process.env.AI_MODE || "mock",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  historyPageSizeMax: Number(process.env.HISTORY_PAGE_SIZE_MAX || 50),
};
