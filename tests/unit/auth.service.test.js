const bcrypt = require("bcrypt");

describe("auth password hashing", () => {
  test("bcrypt hashes and verifies password", async () => {
    const hash = await bcrypt.hash("StrongPass123", 12);
    const valid = await bcrypt.compare("StrongPass123", hash);

    expect(hash).toBeTruthy();
    expect(valid).toBe(true);
  });
});
