const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

let geminiClient = null;

if (env.geminiApiKey) {
  geminiClient = new GoogleGenerativeAI(env.geminiApiKey);
}

const normalizeProbability = (value) => {
  const numeric = Number(String(value).replace("%", ""));

  if (Number.isNaN(numeric)) {
    return null;
  }

  const bounded = Math.min(99, Math.max(1, Math.round(numeric)));
  return `${bounded}%`;
};

const enforceBaselineCandidates = (baselineConditions, candidateConditions) => {
  const baselineMap = new Map(
    baselineConditions.map((condition) => [
      condition.name.toLowerCase(),
      condition,
    ]),
  );

  const enhanced = [];

  candidateConditions.forEach((candidate) => {
    const baseline = baselineMap.get(
      String(candidate.name || "").toLowerCase(),
    );

    if (!baseline) {
      return;
    }

    enhanced.push({
      name: baseline.name,
      probability:
        normalizeProbability(candidate.probability) || baseline.probability,
      next_steps:
        typeof candidate.next_steps === "string" && candidate.next_steps.trim()
          ? candidate.next_steps.trim()
          : baseline.next_steps,
    });
  });

  return enhanced;
};

const mockEnhancement = async (baselineConditions) => {
  const adjusted = baselineConditions.map((condition, idx) => {
    const percentage = Number(condition.probability.replace("%", ""));
    const variance = idx === 0 ? 3 : idx === 1 ? -2 : -1;
    const normalized = Math.min(99, Math.max(1, percentage + variance));

    return {
      ...condition,
      probability: `${normalized}%`,
      next_steps: `${condition.next_steps}. Monitor symptoms for 24-48 hours and seek care sooner if worsening.`,
    };
  });

  return adjusted;
};

const extractJsonPayload = (rawText) => {
  const trimmed = String(rawText || "").trim();

  if (!trimmed) {
    return "{}";
  }

  const markdownMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);

  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }

  return trimmed;
};

const geminiEnhancement = async (symptoms, baselineConditions) => {
  if (!geminiClient) {
    return mockEnhancement(baselineConditions);
  }

  const prompt = [
    "You are a medical triage assistant. Improve the explanation and probability formatting only.",
    "Do not add any new condition names.",
    'Return JSON only with shape: {"conditions":[{"name":"","probability":"","next_steps":""}]}',
    `Symptoms: ${symptoms.join(", ")}`,
    `Baseline: ${JSON.stringify(baselineConditions)}`,
  ].join("\n");

  const model = geminiClient.getGenerativeModel({ model: env.geminiModel });
  const response = await model.generateContent(prompt);
  const rawText = response.response?.text() || "{}";
  const parsed = JSON.parse(extractJsonPayload(rawText));
  const candidates = Array.isArray(parsed.conditions) ? parsed.conditions : [];

  const enforced = enforceBaselineCandidates(baselineConditions, candidates);

  if (enforced.length === 0) {
    return mockEnhancement(baselineConditions);
  }

  return enforced;
};

const enhanceDiagnosis = async ({ symptoms, baselineConditions }) => {
  if (env.aiMode === "gemini") {
    try {
      return await geminiEnhancement(symptoms, baselineConditions);
    } catch {
      return mockEnhancement(baselineConditions);
    }
  }

  return mockEnhancement(baselineConditions);
};

module.exports = {
  enhanceDiagnosis,
  enforceBaselineCandidates,
  normalizeProbability,
};
