const request = require("supertest");
const app = require("../../../src/app");
const Task = require("../../../src/models/Task");
const User = require("../../../src/models/User");
const jwt = require("jsonwebtoken");

describe("Task Routes Integration Tests", () => {
  let authToken;
  let userId;
  let testTask;

  beforeEach(async () => {
    // Clean up database
    await Task.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const user = await User.create({
      email: "test@example.com",
      password: "password123"
    });
    userId = user._id;

    // Generate auth token
    authToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    // Create a test task
    testTask = await Task.create({
      title: "Test task",
      description: "Test description",
      completed: false,
      userId: user._id
    });
  });

  describe("GET /api/tasks", () => {
    it("should get all tasks for authenticated user", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe("Test task");
    });

    it("should handle internal server error during task fetching", async () => {
      // Mock Task.find to throw an error
      const originalFind = Task.find;
      Task.find = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");

      // Restore original method
      Task.find = originalFind;
    });
  });

  describe("POST /api/tasks", () => {
    it("should create new task successfully", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New task",
          description: "New description"
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("New task");
      expect(response.body.description).toBe("New description");
      expect(response.body.completed).toBe(false);
    });

    it("should create task with minimal data", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Minimal task"
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Minimal task");
      expect(response.body.description).toBe("");
      expect(response.body.completed).toBe(false);
    });

    it("should reject task creation without title", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          description: "No title"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title is required");
    });

    it("should handle internal server error during task creation", async () => {
      // Create a task and mock its save method to throw an error
      const mockTask = {
        save: jest.fn().mockRejectedValue(new Error("Save error"))
      };
      
      // Mock Task constructor to return our mock task
      const originalTask = Task;
      Task = jest.fn().mockImplementation(() => mockTask);

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New task"
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");

      // Restore original constructor
      Task = originalTask;
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update existing task", async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated task",
          completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated task");
      expect(response.body.completed).toBe(true);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "60f7b3b3b3b3b3b3b3b3b3b3";
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated task"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete existing task", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify task was deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "60f7b3b3b3b3b3b3b3b3b3b3";
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Task not found");
    });
  });
}); 