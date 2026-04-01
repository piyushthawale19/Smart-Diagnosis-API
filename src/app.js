const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const diagnosisRoutes = require("./routes/diagnosis.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const diagnosisRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/auth", authRateLimiter, authRoutes);
app.use("/", diagnosisRateLimiter, diagnosisRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
