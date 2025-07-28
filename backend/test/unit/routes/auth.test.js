const request = require("supertest");
const app = require("../../../src/app");
const User = require("../../../src/models/User");

describe("POST /api/auth/login", () => {
  let originalJwtSecret;

  beforeEach(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    await User.deleteMany({});
  });

  afterEach(() => {
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("should login successfully with valid credentials", async () => {
    // Create a user first
    await User.create({
      email: "test@example.com",
      password: "password123"
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("should reject login with non-existent user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should reject login with wrong password", async () => {
    // Create a user first
    await User.create({
      email: "test@example.com",
      password: "password123"
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should reject login with missing email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        password: "password123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should reject login with missing password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should reject login with empty request body", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should handle missing JWT_SECRET environment variable", async () => {
    delete process.env.JWT_SECRET;
    
    // Create a user first
    await User.create({
      email: "test@example.com",
      password: "password123"
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should handle custom JWT_SECRET from environment", async () => {
    process.env.JWT_SECRET = "custom-secret";
    
    // Create a user first
    await User.create({
      email: "test@example.com",
      password: "password123"
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should handle internal server error during login", async () => {
    // Create a user first
    await User.create({
      email: "test@example.com",
      password: "password123"
    });

    // Mock User.findOne to throw an error
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");

    // Restore original method
    User.findOne = originalFindOne;
  });
});

describe("POST /api/auth/register", () => {
  let originalJwtSecret;

  beforeEach(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    await User.deleteMany({});
  });

  afterEach(() => {
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("should register new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "password123"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  it("should reject registration for existing user", async () => {
    // Create a user first
    await User.create({
      email: "existing@example.com",
      password: "password123"
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "existing@example.com",
        password: "password123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should reject registration with missing email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        password: "password123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should reject registration with missing password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should reject registration with empty request body", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  it("should handle missing JWT_SECRET during registration", async () => {
    delete process.env.JWT_SECRET;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "password123"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  it("should handle custom JWT_SECRET during registration", async () => {
    process.env.JWT_SECRET = "custom-secret";

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "password123"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });
}); 