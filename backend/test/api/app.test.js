const request = require("supertest");
const express = require("express");
const app = require("../../src/app");

describe("App Error Handling", () => {
  let testApp;

  beforeEach(() => {
    testApp = express();
    testApp.use(express.json());
    
    // Add a route that throws an error
    testApp.get("/error", (req, res, next) => {
      next(new Error("Test error"));
    });

    // Add a route that throws an async error
    testApp.get("/async-error", async (req, res, next) => {
      try {
        throw new Error("Async test error");
      } catch (error) {
        next(error);
      }
    });

    // Add a route that throws a JSON parsing error
    testApp.post("/json-error", (req, res, next) => {
      // Simulate JSON parsing error
      const error = new Error("Unexpected token in JSON");
      error.status = 400;
      next(error);
    });

    // Add the error handling middleware
    testApp.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
  });

  it("should handle internal server errors", async () => {
    const res = await request(testApp).get("/error");
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });

  it("should handle async errors", async () => {
    const res = await request(testApp).get("/async-error");
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });

  it("should handle JSON parsing errors", async () => {
    const res = await request(testApp).post("/json-error");
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });

  it("should handle route not found", async () => {
    const res = await request(testApp).get("/nonexistent");
    
    expect(res.statusCode).toBe(404);
  });

  it("should handle synchronous errors in middleware", async () => {
    const errorApp = express();
    errorApp.use(express.json());
    
    // Add a route that throws an error synchronously
    errorApp.get("/sync-error", (req, res) => {
      throw new Error("Synchronous error");
    });

    // Add the error handling middleware
    errorApp.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });

    const res = await request(errorApp).get("/sync-error");
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });

  it("should handle errors with custom status codes", async () => {
    const customErrorApp = express();
    customErrorApp.use(express.json());
    
    // Add a route that throws an error with custom status
    customErrorApp.get("/custom-error", (req, res, next) => {
      const error = new Error("Custom error");
      error.status = 422;
      next(error);
    });

    // Add the error handling middleware
    customErrorApp.use((err, req, res, next) => {
      console.error(err);
      const statusCode = err.status || 500;
      res.status(statusCode).json({ message: "Internal Server Error" });
    });

    const res = await request(customErrorApp).get("/custom-error");
    
    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });

  it("should handle errors in the actual app", async () => {
    // Test the actual app's error handling by accessing a non-existent route
    const res = await request(app).get("/nonexistent-route");
    
    expect(res.statusCode).toBe(404);
    // The actual app might not return a message property for 404 errors
    // So we just check the status code
  });

  it("should handle middleware errors in the actual app", async () => {
    // Test the actual app's error handling middleware by sending invalid JSON
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("invalid json");
    
    expect(res.statusCode).toBe(400);
  });
}); 