const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    probability: { type: String, required: true },
    next_steps: { type: String, required: true },
  },
  { _id: false },
);

const diagnosisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symptoms: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one symptom is required",
      },
    },
    baselineConditions: {
      type: [conditionSchema],
      required: true,
    },
    conditions: {
      type: [conditionSchema],
      required: true,
    },
    aiMode: {
      type: String,
      enum: ["mock", "gemini"],
      default: "mock",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

diagnosisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
