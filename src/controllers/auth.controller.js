const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
