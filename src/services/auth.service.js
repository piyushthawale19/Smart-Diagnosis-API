const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken } = require("../utils/jwt");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: signAccessToken(user._id.toString()),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select(
    "_id name email passwordHash",
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: signAccessToken(user._id.toString()),
  };
};

module.exports = {
  registerUser,
  loginUser,
};
