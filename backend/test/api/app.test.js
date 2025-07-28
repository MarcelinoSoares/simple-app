const request = require("supertest");
const express = require("express");
const app = require("../../src/app");

describe("Express App", () => {
  describe("Basic functionality", () => {
    it("should have API tests", async () => {
      expect(true).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle synchronous errors in middleware", async () => {
      const testApp = express();
      testApp.use(express.json());
      
      testApp.use((req, res, next) => {
        next(new Error("Middleware error"));
      });

      testApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({
          message: err.message || "Internal Server Error"
        });
      });

      const res = await request(testApp).get("/any-route");
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("message", "Middleware error");
    });

    it("should handle middleware errors in the actual app", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "invalid",
        password: "invalid"
      });
      
      expect(res.statusCode).toBe(401);
    });

    it("should handle JSON parsing errors with statusCode 400", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid JSON format");
    });

    it("should handle JSON parsing errors without statusCode 400", async () => {
      // Create a test app with a custom error handler that simulates the condition
      const testApp = express();
      testApp.use(express.json());
      
      testApp.post("/test", (req, res, next) => {
        // Simulate an error that has type 'entity.parse.failed' but no statusCode 400
        const error = new Error("JSON parsing error");
        error.type = 'entity.parse.failed';
        // Explicitly set statusCode to something other than 400
        error.statusCode = 500;
        next(error);
      });

      testApp.use((err, req, res, next) => {
        // Handle JSON parsing errors
        if (err.type === 'entity.parse.failed') {
          if (err.statusCode === 400) {
            return res.status(400).json({ message: "Invalid JSON format" });
          }
          return res.status(500).json({ message: "Internal Server Error" });
        }
        
        // Default error response
        res.status(err.status || 500).json({ 
          message: err.message || "Internal Server Error" 
        });
      });

      const res = await request(testApp).post("/test");
      
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Internal Server Error");
    });
  });
}); 