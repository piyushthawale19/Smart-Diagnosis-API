const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;
let app;
let User;
let Diagnosis;

jest.setTimeout(30000);

describe("Smart Diagnosis API", () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();

    const connectDatabase = require("../../src/config/database");
    app = require("../../src/app");
    User = require("../../src/models/User");
    Diagnosis = require("../../src/models/Diagnosis");

    await connectDatabase();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Diagnosis.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  test("register, login, diagnose, and history flow", async () => {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "user@example.com",
      password: "StrongPass123",
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.token).toBeTruthy();

    const loginRes = await request(app).post("/auth/login").send({
      email: "user@example.com",
      password: "StrongPass123",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.data.token).toBeTruthy();

    const token = loginRes.body.data.token;

    const diagnoseRes = await request(app)
      .post("/diagnose")
      .set("Authorization", `Bearer ${token}`)
      .send({
        symptoms: ["fever", "cough", "fatigue"],
      });

    expect(diagnoseRes.statusCode).toBe(200);
    expect(diagnoseRes.body.data.conditions.length).toBeGreaterThanOrEqual(2);
    expect(diagnoseRes.body.data.conditions.length).toBeLessThanOrEqual(3);

    const historyRes = await request(app)
      .get("/history?page=1&pageSize=10")
      .set("Authorization", `Bearer ${token}`);

    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.data.total).toBe(1);
    expect(historyRes.body.data.items[0].symptoms).toContain("fever");
  });

  test("reject protected endpoint without token", async () => {
    const response = await request(app)
      .post("/diagnose")
      .send({
        symptoms: ["headache"],
      });

    expect(response.statusCode).toBe(401);
  });

  test("supports history date filters", async () => {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Date User",
      email: "date@example.com",
      password: "StrongPass123",
    });

    const token = registerRes.body.data.token;

    await request(app)
      .post("/diagnose")
      .set("Authorization", `Bearer ${token}`)
      .send({ symptoms: ["cough", "runny nose"] });

    const from = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const to = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const response = await request(app)
      .get(
        `/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.items.length).toBeGreaterThan(0);
  });
});
