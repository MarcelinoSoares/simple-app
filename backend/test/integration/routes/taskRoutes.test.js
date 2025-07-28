const request = require("supertest");
const app = require("../../../src/app");
const User = require("../../../src/models/User");
const Task = require("../../../src/models/Task");
const jwt = require("jsonwebtoken");

describe("Task Routes", () => {
  let token;
  let userId;
  let testEmail;

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
    await Task.deleteMany({});
    
    // Generate unique email for each test using timestamp + random
    testEmail = `test${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
    
    // Create a test user
    const user = await User.create({
      email: testEmail,
      password: "123456"
    });
    userId = user._id;

    // Generate token with correct structure
    token = jwt.sign(
      { id: userId.toString(), email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
  });

  afterEach(async () => {
    // Clean database after each test
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  describe("GET /api/tasks", () => {
    it("should return user's tasks", async () => {
      // Create tasks for the user using Task.create directly
      const task1 = await Task.create({
        title: "Task 1",
        description: "Description 1",
        userId: userId
      });
      
      const task2 = await Task.create({
        title: "Task 2", 
        description: "Description 2",
        userId: userId
      });

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("title", "Task 1");
      expect(res.body[1]).toHaveProperty("title", "Task 2");
    });

    it("should return empty array when user has no tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it("should not return tasks from other users", async () => {
      // Create another user
      const otherUser = await User.create({
        email: `other${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: "123456"
      });

      // Create tasks for both users
      await Task.create([
        { title: "My Task", description: "My description", userId: userId },
        { title: "Other Task", description: "Other description", userId: otherUser._id }
      ]);

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("title", "My Task");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/tasks");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "New Task",
        description: "Task description",
        completed: false
      };

      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(taskData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "New Task");
      expect(res.body).toHaveProperty("description", "Task description");
      expect(res.body).toHaveProperty("completed", false);
      expect(res.body).toHaveProperty("userId", userId.toString());
    });

    it("should create task with minimal data", async () => {
      const taskData = { title: "Simple Task" };

      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(taskData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "Simple Task");
      expect(res.body).toHaveProperty("completed", false);
      expect(res.body).toHaveProperty("userId", userId.toString());
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update task successfully", async () => {
      const task = await Task.create({
        title: "Original Task",
        description: "Original description",
        userId: userId
      });

      const updateData = {
        title: "Updated Task",
        description: "Updated description",
        completed: true
      };

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Task");
      expect(res.body).toHaveProperty("description", "Updated description");
      expect(res.body).toHaveProperty("completed", true);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Task" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Task not found");
    });

    it("should not update task from other user", async () => {
      const otherUser = await User.create({
        email: `other${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: "123456"
      });

      const task = await Task.create({
        title: "Other User Task",
        userId: otherUser._id
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Task" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Task not found");
    });

    it("should return 401 without token", async () => {
      const task = await Task.create({
        title: "Test Task",
        userId: userId
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send({ title: "Updated Task" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete task successfully", async () => {
      const task = await Task.create({
        title: "Task to Delete",
        userId: userId
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      // Verify task was actually deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Task not found");
    });

    it("should not delete task from other user", async () => {
      const otherUser = await User.create({
        email: `other${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: "123456"
      });

      const task = await Task.create({
        title: "Other User Task",
        userId: otherUser._id
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Task not found");
    });

    it("should return 401 without token", async () => {
      const task = await Task.create({
        title: "Test Task",
        userId: userId
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });
}); 