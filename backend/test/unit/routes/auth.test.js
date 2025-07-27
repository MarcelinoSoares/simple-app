const request = require("supertest");
const app = require("../../../src/app");
const User = require("../../../src/models/User");

describe("POST /api/auth/login", () => {
  let originalJwtSecret;

  beforeEach(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
  });

  afterEach(() => {
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("should login with existing user", async () => {
    // Create a user first
    await User.create({ email: "test@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "123456" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should reject login with wrong password for existing user", async () => {
    // Create a user first
    await User.create({ email: "wrongpass@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrongpass@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should reject login when user exists but password is different", async () => {
    // Create a user first
    await User.create({ email: "different@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "different@example.com", password: "differentpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should reject login when user exists with different password in database", async () => {
    // Create a user with one password
    const user = await User.create({ email: "original@example.com", password: "original123" });
    
    // Update the user's password directly in the database to simulate a different scenario
    await User.findByIdAndUpdate(user._id, { password: "modified456" });

    // Try to login with the original password
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "original@example.com", password: "original123" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should work with custom JWT_SECRET from environment", async () => {
    // Set a custom JWT_SECRET
    process.env.JWT_SECRET = "custom-secret-key";
    
    // Create a user first
    await User.create({ email: "custom@example.com", password: "123456" });
    
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "custom@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should work with fallback secret when JWT_SECRET is not set", async () => {
    // Remove JWT_SECRET to test fallback
    delete process.env.JWT_SECRET;
    
    // Create a user first
    await User.create({ email: "fallback@example.com", password: "123456" });
    
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "fallback@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should handle missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle empty request body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle null email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: null, password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle null password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: null });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle empty string email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle empty string password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });
});

describe("POST /api/auth/register", () => {
  let originalJwtSecret;

  beforeEach(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
  });

  afterEach(() => {
    if (originalJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("should create new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "newuser@example.com", password: "newpassword" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");

    // Verify user was created
    const createdUser = await User.findOne({ email: "newuser@example.com" });
    expect(createdUser).toBeTruthy();
    expect(createdUser.password).toBe("newpassword");
  });

  it("should reject registration for existing user", async () => {
    // Create a user first
    await User.create({ email: "existing@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "existing@example.com", password: "newpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("should handle missing email in registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "newpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle missing password in registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "newuser@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });
}); 