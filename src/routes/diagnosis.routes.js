const express = require("express");
const { body, query } = require("express-validator");
const diagnosisController = require("../controllers/diagnosis.controller");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/diagnose",
  authMiddleware,
  [
    body("symptoms").isArray({ min: 1 }),
    body("symptoms.*").isString().trim().isLength({ min: 2, max: 100 }),
  ],
  validate,
  diagnosisController.diagnose,
);

router.get(
  "/history",
  authMiddleware,
  [
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  validate,
  diagnosisController.history,
);

module.exports = router;
