const request = require("supertest");
const createApp = require("../app");

describe("API validation", () => {
  const app = createApp();

  test("GET /api/health should return 200", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/auth/login should return 400 for empty payload", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
  });

  test("POST /api/auth/register should return 400 for invalid payload", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test("GET /api/products/search should return 400 when q is missing", async () => {
    const res = await request(app).get("/api/products/search");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
  });

  test("GET /api/cart should return 401 without token", async () => {
    const res = await request(app).get("/api/cart");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("success", false);
  });

  test("GET /api/admin/dashboard should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/dashboard");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("success", false);
  });
});

