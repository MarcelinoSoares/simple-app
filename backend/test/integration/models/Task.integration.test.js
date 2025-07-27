const mongoose = require("mongoose");
const Task = require("../../../src/models/Task");
const User = require("../../../src/models/User");

describe("Task Model Integration Tests", () => {
  let userId;

  beforeAll(async () => {
    // Ensure we're connected to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test");
    }
  });

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      email: "test@example.com",
      password: "123456"
    });
    userId = user._id;
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
    });

    it("should return null for non-existent task", async () => {
      const task = await Task.findOne({ userId, title: "Non-existent Task" });

      expect(task).toBeNull();
    });
  });

  describe("Task Updates", () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: "Original Task",
        description: "Original Description",
        completed: false,
        userId
      });
    });

    it("should update task title", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        task._id,
        { title: "Updated Task" },
        { new: true }
      );

      expect(updatedTask.title).toBe("Updated Task");
      expect(updatedTask.description).toBe("Original Description");
      expect(updatedTask.completed).toBe(false);
    });

    it("should update task completion status", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        task._id,
        { completed: true },
        { new: true }
      );

      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.title).toBe("Original Task");
    });

    it("should update multiple fields", async () => {
      const updatedTask = await Task.findByIdAndUpdate(
        task._id,
        {
          title: "Updated Task",
          description: "Updated Description",
          completed: true
        },
        { new: true }
      );

      expect(updatedTask.title).toBe("Updated Task");
      expect(updatedTask.description).toBe("Updated Description");
      expect(updatedTask.completed).toBe(true);
    });
  });

  describe("Task Deletion", () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: "Task to Delete",
        userId
      });
    });

    it("should delete task by id", async () => {
      await Task.findByIdAndDelete(task._id);

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it("should delete task by title", async () => {
      await Task.findOneAndDelete({ userId, title: "Task to Delete" });

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it("should delete all tasks for a user", async () => {
      await Task.deleteMany({ userId });

      const tasks = await Task.find({ userId });
      expect(tasks).toHaveLength(0);
    });
  });

  describe("Task Relationships", () => {
    let user1, user2;

    beforeEach(async () => {
      user1 = await User.create({
        email: "user1@example.com",
        password: "123456"
      });
      user2 = await User.create({
        email: "user2@example.com",
        password: "654321"
      });

      await Task.create([
        { title: "User 1 Task", userId: user1._id },
        { title: "User 2 Task", userId: user2._id }
      ]);
    });

    it("should only return tasks for specific user", async () => {
      const user1Tasks = await Task.find({ userId: user1._id });
      const user2Tasks = await Task.find({ userId: user2._id });

      expect(user1Tasks).toHaveLength(1);
      expect(user1Tasks[0].title).toBe("User 1 Task");

      expect(user2Tasks).toHaveLength(1);
      expect(user2Tasks[0].title).toBe("User 2 Task");
    });

    it("should not return other user's tasks when querying by user", async () => {
      const allTasks = await Task.find({});
      expect(allTasks).toHaveLength(2);

      const user1Tasks = await Task.find({ userId: user1._id });
      expect(user1Tasks).toHaveLength(1);
      expect(user1Tasks[0].userId.toString()).toBe(user1._id.toString());
    });
  });

  describe("Database Operations", () => {
    it("should handle concurrent task creation", async () => {
      const taskPromises = Array.from({ length: 5 }, (_, i) =>
        Task.create({
          title: `Concurrent Task ${i}`,
          userId
        })
      );

      const tasks = await Promise.all(taskPromises);

      expect(tasks).toHaveLength(5);
      tasks.forEach((task, i) => {
        expect(task.title).toBe(`Concurrent Task ${i}`);
        expect(task.userId.toString()).toBe(userId.toString());
      });
    });

    it("should handle bulk operations", async () => {
      const tasksToInsert = Array.from({ length: 10 }, (_, i) => ({
        title: `Bulk Task ${i}`,
        userId
      }));

      const insertedTasks = await Task.insertMany(tasksToInsert);

      expect(insertedTasks).toHaveLength(10);
      insertedTasks.forEach((task, i) => {
        expect(task.title).toBe(`Bulk Task ${i}`);
      });
    });
  });
}); 