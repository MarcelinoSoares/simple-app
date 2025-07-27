const request = require("supertest");
const app = require("../../../src/app");
const jwt = require("jsonwebtoken");

describe("Auth Middleware Integration Tests", () => {
  describe("Protected Routes", () => {
    it("should return 401 with expired token", async () => {
      const expiredToken = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "0s" }
      );

      // Wait a bit to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Token expired");
    });

    it("should return 401 with token signed with wrong secret", async () => {
      const wrongSecretToken = jwt.sign(
        { id: "user123", email: "test@example.com" },
        "wrong-secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${wrongSecretToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with malformed token", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer malformed.token.here");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with token that has invalid signature", async () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1NjY3ODQsImV4cCI6MTYzNDU3MDM4NH0.invalid-signature";

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with completely invalid token structure", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer completely-invalid");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 when no Authorization header", async () => {
      const res = await request(app).get("/api/tasks");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "InvalidFormat token123");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer' without token", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer ' with space", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer ");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 with invalid token format", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer invalid.token.format");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });
  });
}); 