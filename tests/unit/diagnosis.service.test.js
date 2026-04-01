const {
  normalizeSymptoms,
  rankConditions,
} = require("../../src/services/diagnosis.service");

describe("diagnosis service", () => {
  test("normalizes symptom list", () => {
    const normalized = normalizeSymptoms(["  Fever", "", "COUGH "]);
    expect(normalized).toEqual(["fever", "cough"]);
  });

  test("returns 2 to 3 ranked conditions", () => {
    const ranked = rankConditions(["fever", "cough", "fatigue"]);
    expect(ranked.length).toBeGreaterThanOrEqual(2);
    expect(ranked.length).toBeLessThanOrEqual(3);
  });
});
