const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("_id email name");

    if (!user) {
      throw new ApiError(401, "Invalid authentication token");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
