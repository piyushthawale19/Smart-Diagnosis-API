const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "Route not found"));
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    message,
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  if (err instanceof ApiError) {
    return res.status(statusCode).json(response);
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
