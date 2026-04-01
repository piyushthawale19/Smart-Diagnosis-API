const Diagnosis = require("../models/Diagnosis");
const ApiError = require("../utils/ApiError");
const { enhanceDiagnosis } = require("./ai.service");
const env = require("../config/env");

const CONDITION_KB = [
  {
    name: "Common Cold",
    symptomKeywords: [
      "cough",
      "runny nose",
      "sneezing",
      "sore throat",
      "congestion",
    ],
    next_steps:
      "Rest, hydration, and consult a general physician if symptoms persist beyond 5 days",
  },
  {
    name: "Flu",
    symptomKeywords: [
      "fever",
      "body ache",
      "fatigue",
      "chills",
      "headache",
      "cough",
    ],
    next_steps:
      "Take flu test, rest, fluids, and consult an internal medicine doctor",
  },
  {
    name: "Allergic Rhinitis",
    symptomKeywords: [
      "sneezing",
      "itchy eyes",
      "runny nose",
      "watery eyes",
      "congestion",
    ],
    next_steps:
      "Allergy panel test and consultation with an allergy specialist",
  },
  {
    name: "Migraine",
    symptomKeywords: [
      "headache",
      "nausea",
      "light sensitivity",
      "aura",
      "vomiting",
    ],
    next_steps: "Neurology consultation if recurrent; keep a headache diary",
  },
  {
    name: "Gastroenteritis",
    symptomKeywords: [
      "vomiting",
      "diarrhea",
      "abdominal pain",
      "nausea",
      "fever",
    ],
    next_steps:
      "Oral rehydration, stool test if severe, and consult a general physician",
  },
  {
    name: "Viral Infection",
    symptomKeywords: ["fever", "fatigue", "cough", "sore throat", "headache"],
    next_steps: "CBC test and general physician consultation if fever persists",
  },
];

const normalizeSymptoms = (symptoms) =>
  symptoms.map((item) => String(item).trim().toLowerCase()).filter(Boolean);

const rankConditions = (symptoms) => {
  const ranked = CONDITION_KB.map((condition) => {
    const overlap = condition.symptomKeywords.filter((keyword) =>
      symptoms.includes(keyword),
    ).length;
    const symptomCount = Math.max(symptoms.length, 1);
    const rawScore = overlap / symptomCount;

    return {
      ...condition,
      score: rawScore,
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((condition) => ({
      name: condition.name,
      probability: `${Math.min(95, Math.max(10, Math.round(condition.score * 100 || 25)))}%`,
      next_steps: condition.next_steps,
    }));

  if (ranked.length < 2) {
    ranked.push(
      {
        name: "Viral Infection",
        probability: "30%",
        next_steps:
          "CBC test and general physician consultation if fever persists",
      },
      {
        name: "Common Cold",
        probability: "25%",
        next_steps:
          "Rest, hydration, and consult a general physician if symptoms persist beyond 5 days",
      },
    );
  }

  return ranked.slice(0, 3);
};

const runDiagnosis = async ({ userId, symptoms }) => {
  const normalizedSymptoms = normalizeSymptoms(symptoms);

  if (normalizedSymptoms.length === 0) {
    throw new ApiError(400, "Symptoms list cannot be empty");
  }

  const baselineConditions = rankConditions(normalizedSymptoms);
  const aiConditions = await enhanceDiagnosis({
    symptoms: normalizedSymptoms,
    baselineConditions,
  });

  const persisted = await Diagnosis.create({
    user: userId,
    symptoms: normalizedSymptoms,
    baselineConditions,
    conditions: aiConditions,
    aiMode: env.aiMode === "gemini" ? "gemini" : "mock",
  });

  return {
    diagnosisId: persisted._id,
    conditions: persisted.conditions,
  };
};

const getHistory = async ({ userId, page, pageSize, from, to }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(
    env.historyPageSizeMax,
    Math.max(1, Number(pageSize) || 10),
  );

  const query = { user: userId };

  if (from || to) {
    query.createdAt = {};

    if (from) {
      query.createdAt.$gte = new Date(from);
    }

    if (to) {
      query.createdAt.$lte = new Date(to);
    }
  }

  const [items, total] = await Promise.all([
    Diagnosis.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safePageSize)
      .limit(safePageSize)
      .lean(),
    Diagnosis.countDocuments(query),
  ]);

  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.ceil(total / safePageSize) || 1,
    items,
  };
};

module.exports = {
  runDiagnosis,
  getHistory,
  normalizeSymptoms,
  rankConditions,
};
