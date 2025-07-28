const request = require("supertest");
const express = require("express");
const authMiddleware = require("../../../src/middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

describe("Auth Middleware", () => {
  let app;
  let originalJwtSecret;

  beforeEach(() => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-secret";
    
    app = express();
    app.use(express.json());
    app.get("/protected", authMiddleware, (req, res) => {
      res.json({ message: "Protected route accessed", user: req.user });
    });
  });

  afterEach(() => {
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("Valid token scenarios", () => {
    it("should allow access with valid Bearer token", async () => {
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Protected route accessed");
      expect(response.body.user.id).toBe("123");
    });

    it("should handle token with string user ID", async () => {
      const token = jwt.sign({ id: "user123", email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe("user123");
    });
  });

  describe("Invalid token scenarios", () => {
    it("should return 401 when no Authorization header", async () => {
      const response = await request(app).get("/protected");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 when Authorization header doesn't start with Bearer", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "InvalidFormat token123");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer' without token", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 when Authorization header is just 'Bearer ' with space", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer ");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 with token signed with wrong secret", async () => {
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "wrong-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should return 401 with malformed token", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer malformed.token.here");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should return 401 with completely invalid token structure", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer not-a-jwt-token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should return 401 with invalid token format", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("JWT specific error handling", () => {
    it("should handle JsonWebTokenError", async () => {
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "wrong-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should handle TokenExpiredError", async () => {
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "test-secret", { expiresIn: "0s" });

      // Wait a moment for token to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Token expired");
    });

    it("should handle NotBeforeError", async () => {
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "test-secret", { notBefore: "1h" });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should handle generic JWT errors", async () => {
      // Create a token that will cause a generic error
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "test-secret");
      
      // Mock jwt.verify to throw a generic error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error("Generic JWT error");
        error.name = "GenericError";
        throw error;
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");

      // Restore original method
      jwt.verify = originalVerify;
    });

    it("should handle unknown JWT errors", async () => {
      // Create a token that will cause an unknown error
      const token = jwt.sign({ id: "123", email: "test@example.com" }, "test-secret");
      
      // Mock jwt.verify to throw an unknown error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error("Unknown JWT error");
        error.name = "UnknownError";
        throw error;
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");

      // Restore original method
      jwt.verify = originalVerify;
    });
  });

  describe("Edge cases", () => {
    it("should handle token with missing user ID", async () => {
      const token = jwt.sign({ email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token: missing user id");
    });

    it("should handle token with null user ID", async () => {
      const token = jwt.sign({ id: null, email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token: missing user id");
    });

    it("should handle token with empty string user ID", async () => {
      const token = jwt.sign({ id: "", email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token: missing user id");
    });

    it("should handle token with undefined user ID", async () => {
      const token = jwt.sign({ id: undefined, email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token: missing user id");
    });

    it("should handle token with whitespace-only user ID", async () => {
      const token = jwt.sign({ id: "   ", email: "test@example.com" }, "test-secret");

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token: missing user id");
    });
  });
}); 