const mongoose = require("mongoose");
const Task = require("../../../src/models/Task");
const User = require("../../../src/models/User");

describe("Task Model Integration Tests", () => {
  let userId;
  let testEmail;

  beforeAll(async () => {
    // Ensure we're connected to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test");
    }
  });

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
  });

  afterEach(async () => {
    // Clean database after each test
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Task Creation", () => {
    it("should create a task with valid data", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        completed: false,
        userId
      };

      const task = await Task.create(taskData);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.completed).toBe(taskData.completed);
      expect(task.userId.toString()).toBe(userId.toString());
      expect(task._id).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it("should create a task with minimal data", async () => {
      const taskData = {
        title: "Minimal Task",
        userId
      };

      const task = await Task.create(taskData);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.userId.toString()).toBe(userId.toString());
      expect(task.completed).toBe(false); // default value
      expect(task.description).toBeUndefined();
    });

    it("should create multiple tasks for the same user", async () => {
      const tasksData = [
        { title: "Task 1", userId },
        { title: "Task 2", userId },
        { title: "Task 3", userId }
      ];

      const tasks = await Task.create(tasksData);

      expect(tasks).toHaveLength(3);
      tasks.forEach((task, index) => {
        expect(task.title).toBe(`Task ${index + 1}`);
        expect(task.userId.toString()).toBe(userId.toString());
      });
    });
  });

  describe("Task Queries", () => {
    beforeEach(async () => {
      // Create tasks for testing
      await Task.create([
        { title: "Task 1", userId },
        { title: "Task 2", userId },
        { title: "Task 3", userId, completed: true }
      ]);
    });

    it("should find all tasks for a user", async () => {
      const tasks = await Task.find({ userId });

      expect(tasks).toHaveLength(3);
      expect(tasks.map(t => t.title)).toContain("Task 1");
      expect(tasks.map(t => t.title)).toContain("Task 2");
      expect(tasks.map(t => t.title)).toContain("Task 3");
    });

    it("should find completed tasks", async () => {
      const completedTasks = await Task.find({ userId, completed: true });

      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe("Task 3");
    });

    it("should find incomplete tasks", async () => {
      const incompleteTasks = await Task.find({ userId, completed: false });

      expect(incompleteTasks).toHaveLength(2);
      expect(incompleteTasks.map(t => t.title)).toContain("Task 1");
      expect(incompleteTasks.map(t => t.title)).toContain("Task 2");
    });

    it("should find task by title", async () => {
      const task = await Task.findOne({ userId, title: "Task 1" });

      expect(task).toBeDefined();
      expect(task.title).toBe("Task 1");
      expect(task.userId.toString()).toBe(userId.toString());
    });

    it("should return null for non-existent task", async () => {
      const task = await Task.findOne({ userId, title: "Non-existent Task" });

      expect(task).toBeNull();
    });
  });

  describe("Task Updates", () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Original Task",
        description: "Original description",
        userId
      });
      taskId = task._id;
    });

    it("should update task title", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { title: "Updated Task" },
        { new: true }
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe("Updated Task");
      expect(updatedTask.description).toBe("Original description");
    });

    it("should update task completion status", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { completed: true },
        { new: true }
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask.completed).toBe(true);
    });

    it("should update multiple fields", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          title: "Updated Task",
          description: "Updated description",
          completed: true
        },
        { new: true }
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe("Updated Task");
      expect(updatedTask.description).toBe("Updated description");
      expect(updatedTask.completed).toBe(true);
    });
  });

  describe("Task Deletion", () => {
    it("should delete task by id", async () => {
      const task = await Task.create({
        title: "Task to Delete",
        userId
      });

      await Task.findByIdAndDelete(task._id);

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it("should delete task by title", async () => {
      await Task.create({
        title: "Task to Delete",
        userId
      });

      await Task.deleteOne({ userId, title: "Task to Delete" });

      const deletedTask = await Task.findOne({ userId, title: "Task to Delete" });
      expect(deletedTask).toBeNull();
    });

    it("should delete all tasks for a user", async () => {
      await Task.create([
        { title: "Task 1", userId },
        { title: "Task 2", userId },
        { title: "Task 3", userId }
      ]);

      await Task.deleteMany({ userId });

      const remainingTasks = await Task.find({ userId });
      expect(remainingTasks).toHaveLength(0);
    });
  });

  describe("Task Relationships", () => {
    let otherUserId;

    beforeEach(async () => {
      const otherUser = await User.create({
        email: `other${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: "123456"
      });
      otherUserId = otherUser._id;
    });

    it("should only return tasks for specific user", async () => {
      await Task.create([
        { title: "My Task 1", userId },
        { title: "My Task 2", userId },
        { title: "Other Task", userId: otherUserId }
      ]);

      const myTasks = await Task.find({ userId });

      expect(myTasks).toHaveLength(2);
      expect(myTasks.map(t => t.title)).toContain("My Task 1");
      expect(myTasks.map(t => t.title)).toContain("My Task 2");
      expect(myTasks.map(t => t.title)).not.toContain("Other Task");
    });

    it("should not return other user's tasks when querying by user", async () => {
      await Task.create([
        { title: "My Task", userId },
        { title: "Other Task", userId: otherUserId }
      ]);

      const otherUserTasks = await Task.find({ userId: otherUserId });

      expect(otherUserTasks).toHaveLength(1);
      expect(otherUserTasks[0].title).toBe("Other Task");
    });
  });

  describe("Database Operations", () => {
    it("should handle concurrent task creation", async () => {
      const tasksData = Array.from({ length: 5 }, (_, i) => ({
        title: `Concurrent Task ${i + 1}`,
        userId
      }));

      const tasks = await Promise.all(
        tasksData.map(taskData => Task.create(taskData))
      );

      expect(tasks).toHaveLength(5);
      tasks.forEach((task, index) => {
        expect(task.title).toBe(`Concurrent Task ${index + 1}`);
        expect(task.userId.toString()).toBe(userId.toString());
      });
    });

    it("should handle bulk operations", async () => {
      const tasksData = Array.from({ length: 10 }, (_, i) => ({
        title: `Bulk Task ${i + 1}`,
        userId
      }));

      const tasks = await Task.insertMany(tasksData);

      expect(tasks).toHaveLength(10);
      tasks.forEach((task, index) => {
        expect(task.title).toBe(`Bulk Task ${index + 1}`);
        expect(task.userId.toString()).toBe(userId.toString());
      });
    });
  });
}); 