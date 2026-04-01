const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 64 }),
  ],
  validate,
  authController.register,
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
  ],
  validate,
  authController.login,
);

module.exports = router;
