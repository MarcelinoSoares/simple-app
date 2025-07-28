const mongoose = require("mongoose");
const User = require("../../../src/models/User");
const Task = require("../../../src/models/Task");

describe("User Model", () => {
  it("should create a user with valid data", async () => {
    const userData = {
      email: "test@example.com",
      password: "123456"
    };

    const user = await User.create(userData);

    expect(user.email).toBe(userData.email);
    // Password should be hashed, not plain text
    expect(user.password).not.toBe(userData.password);
    expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    expect(user._id).toBeDefined();
  });

  it("should create multiple users", async () => {
    const users = await User.create([
      { email: "user1@example.com", password: "123456" },
      { email: "user2@example.com", password: "654321" }
    ]);

    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("user1@example.com");
    expect(users[1].email).toBe("user2@example.com");
  });

  it("should find user by email", async () => {
    await User.create({ email: "test@example.com", password: "123456" });

    const user = await User.findOne({ email: "test@example.com" });

    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  it("should return null for non-existent user", async () => {
    const user = await User.findOne({ email: "nonexistent@example.com" });

    expect(user).toBeNull();
  });

  it("should update user data", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { email: "updated@example.com" },
      { new: true }
    );

    expect(updatedUser).toBeDefined();
    expect(updatedUser.email).toBe("updated@example.com");
  });

  it("should delete user", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });

    await User.findByIdAndDelete(user._id);

    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });

  it("should compare password correctly", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });

    const isMatch = await user.comparePassword("123456");
    const isNotMatch = await user.comparePassword("wrongpassword");

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it("should not hash password when password is not modified", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });
    const originalPassword = user.password;

    // Simulate a scenario where password is not modified
    user.email = "updated@example.com";
    await user.save();

    expect(user.password).toBe(originalPassword);
  });

  it("should not hash password when only other fields are modified", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });
    const originalPassword = user.password;

    // Mark password as not modified
    user.markModified('email');
    user.email = "another@example.com";
    await user.save();

    expect(user.password).toBe(originalPassword);
  });

  it("should not hash password when password field is explicitly marked as not modified", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });
    const originalPassword = user.password;

    // Explicitly mark password as not modified
    user.markModified('email');
    user.email = "explicit@example.com";
    // Don't modify password field
    await user.save();

    expect(user.password).toBe(originalPassword);
  });

  it("should not hash password when only timestamps are updated", async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });
    const originalPassword = user.password;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Just touch the document to update timestamps
    user.markModified('updatedAt');
    await user.save();

    expect(user.password).toBe(originalPassword);
  });
});

describe("Task Model", () => {
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({ email: "test@example.com", password: "123456" });
    userId = user._id;
  });

  it("should create a task with valid data", async () => {
    const taskData = {
      title: "Test Task",
      description: "Test Description",
      completed: false,
      userId
    };

    const task = await Task.create(taskData);

    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.completed).toBe(taskData.completed);
    expect(task.userId.toString()).toBe(userId.toString());
  });

  it("should create task with minimal data", async () => {
    const task = await Task.create({ title: "Minimal Task", userId });

    expect(task.title).toBe("Minimal Task");
    expect(task.completed).toBe(false);
    expect(task.userId.toString()).toBe(userId.toString());
  });

  it("should find tasks by user ID", async () => {
    // Create tasks with explicit IDs to ensure order
    const task1 = await Task.create({ title: "Task 1", userId });
    const task2 = await Task.create({ title: "Task 2", userId });
    const task3 = await Task.create({ title: "Task 3", userId });

    const tasks = await Task.find({ userId }).sort({ _id: 1 });

    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe("Task 1");
    expect(tasks[1].title).toBe("Task 2");
    expect(tasks[2].title).toBe("Task 3");
  });

  it("should update task completion status", async () => {
    const task = await Task.create({ title: "Test Task", userId });

    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { completed: true },
      { new: true }
    );

    expect(updatedTask).toBeDefined();
    expect(updatedTask.completed).toBe(true);
  });

  it("should delete task", async () => {
    const task = await Task.create({ title: "Test Task", userId });

    await Task.findByIdAndDelete(task._id);

    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });

  it("should not find tasks from other users", async () => {
    // Create another user
    const otherUser = await User.create({ email: "other@example.com", password: "123456" });
    
    // Create tasks for both users
    await Task.create({ title: "My Task", userId });
    await Task.create({ title: "Other Task", userId: otherUser._id });

    const myTasks = await Task.find({ userId });

    expect(myTasks).toHaveLength(1);
    expect(myTasks[0].title).toBe("My Task");
  });

  it("should handle task with all fields", async () => {
    const taskData = {
      title: "Complete Task",
      description: "Complete Description",
      completed: true,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const task = await Task.create(taskData);

    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.completed).toBe(taskData.completed);
    expect(task.userId.toString()).toBe(userId.toString());
  });
}); 