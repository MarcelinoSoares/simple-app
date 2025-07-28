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

  it("should verify password hashing works correctly", async () => {
    // Create a user with password hashing
    const userData = { email: "test@example.com", password: "123456" };
    const user = await User.create(userData);
    
    // Verify password was hashed
    expect(user.password).not.toBe("123456");
    expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    
    // Verify password comparison works
    const isMatch = await user.comparePassword("123456");
    expect(isMatch).toBe(true);
    
    const isWrongMatch = await user.comparePassword("wrongpassword");
    expect(isWrongMatch).toBe(false);
  });

  it("should login with existing user", async () => {
    // Create a user first with proper password hashing
    const userData = { email: "test@example.com", password: "123456" };
    await User.create(userData);

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
    await User.create({ email: "test2@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test2@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should reject login when user exists but password is different", async () => {
    // Create a user with different password
    await User.create({ email: "test3@example.com", password: "different" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test3@example.com", password: "123456" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should reject login when user exists with different password in database", async () => {
    // Create a user with different password
    await User.create({ email: "test4@example.com", password: "different" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test4@example.com", password: "123456" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should work with custom JWT_SECRET from environment", async () => {
    process.env.JWT_SECRET = "custom-secret";
    
    // Create a user first
    await User.create({ email: "custom@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "custom@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should work with fallback secret when JWT_SECRET is not set", async () => {
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
  it("should create new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "newuser@example.com", password: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject registration for existing user", async () => {
    // Create user first
    await User.create({ email: "existing@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "existing@example.com", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("should handle missing email in registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });

  it("should handle missing password in registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Email and password are required");
  });
}); 