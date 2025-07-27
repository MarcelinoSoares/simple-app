const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../src/middlewares/authMiddleware");

describe("Auth Middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Add a test route that uses the auth middleware
    app.use("/protected", authMiddleware);
    app.get("/protected", (req, res) => {
      res.json({ user: req.user });
    });
  });

  describe("Valid token scenarios", () => {
    it("should allow access with valid Bearer token", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("id", "user123");
    });

    it("should set user data in request", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty("id", "user123");
      expect(res.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should work with custom JWT_SECRET from environment", async () => {
      process.env.JWT_SECRET = "custom-secret-key";
      
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        "custom-secret-key",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
    });

    it("should work with fallback secret when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;
      
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        "secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
    });
  });

  describe("Invalid token scenarios", () => {
    it("should return 401 when no Authorization header", async () => {
      const res = await request(app).get("/protected");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "InvalidFormat token123");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer' without token", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer ' with space", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer ");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 with invalid token format", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid.token.format");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with expired token", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "0s" }
      );

      // Wait a bit to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Token expired");
    });

    it("should return 401 with token signed with wrong secret", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        "wrong-secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with malformed token", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer malformed.token.here");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with token that has invalid signature", async () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1NjY3ODQsImV4cCI6MTYzNDU3MDM4NH0.invalid-signature";

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with completely invalid token structure", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer completely-invalid");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Edge cases", () => {
    it("should handle case-insensitive Authorization header", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("authorization", `bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should handle Authorization header with extra spaces", async () => {
      const token = jwt.sign(
        { id: "user123", email: "test@example.com" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `  Bearer  ${token}  `);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should handle empty string as token", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer ");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });
}); 