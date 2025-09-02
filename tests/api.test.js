const request = require("supertest");
const app = require("../app");

describe("API Tests", () => {
  test("Health endpoint works", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  test("Can create and retrieve items", async () => {
    const newItem = { name: "Test", description: "Test item" };
    const createRes = await request(app).post("/api/items").send(newItem);
    expect(createRes.status).toBe(201);

    const getRes = await request(app).get("/api/items");
    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBeGreaterThan(0);
  });
});
