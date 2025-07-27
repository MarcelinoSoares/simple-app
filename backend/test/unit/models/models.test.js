const mongoose = require("mongoose");
const User = require("../../../src/models/User");
const Task = require("../../../src/models/Task");

// Import shared test setup
require('../../setup');

describe("User Model", () => {
  it("should create a user with valid data", async () => {
    const userData = {
      email: "test@example.com",
      password: "123456"
    };

    const user = await User.create(userData);

    expect(user).toBeTruthy();
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user._id).toBeDefined();
  });

  it("should create multiple users", async () => {
    const usersData = [
      { email: "user1@example.com", password: "123456" },
      { email: "user2@example.com", password: "654321" }
    ];

    const users = await User.create(usersData);

    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("user1@example.com");
    expect(users[1].email).toBe("user2@example.com");
  });

  it("should find user by email", async () => {
    const userData = {
      email: "findme@example.com",
      password: "123456"
    };

    await User.create(userData);
    const foundUser = await User.findOne({ email: userData.email });

    expect(foundUser).toBeTruthy();
    expect(foundUser.email).toBe(userData.email);
  });

  it("should return null for non-existent user", async () => {
    const foundUser = await User.findOne({ email: "nonexistent@example.com" });
    expect(foundUser).toBeNull();
  });

  it("should update user data", async () => {
    const user = await User.create({
      email: "update@example.com",
      password: "oldpassword"
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: "newpassword" },
      { new: true }
    );

    expect(updatedUser.password).toBe("newpassword");
  });

  it("should delete user", async () => {
    const user = await User.create({
      email: "delete@example.com",
      password: "123456"
    });

    await User.findByIdAndDelete(user._id);
    const deletedUser = await User.findById(user._id);

    expect(deletedUser).toBeNull();
  });
});

describe("Task Model", () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      email: "taskuser@example.com",
      password: "123456"
    });
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

    expect(task).toBeTruthy();
    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.completed).toBe(taskData.completed);
    expect(task.userId.toString()).toBe(userId.toString());
    expect(task._id).toBeDefined();
  });

  it("should create task with minimal data", async () => {
    const task = await Task.create({
      title: "Minimal Task",
      userId
    });

    expect(task.title).toBe("Minimal Task");
    expect(task.description).toBeUndefined();
    expect(task.completed).toBeUndefined();
    expect(task.userId.toString()).toBe(userId.toString());
  });

  it("should find tasks by user ID", async () => {
    const tasks = await Task.create([
      { title: "Task 1", userId },
      { title: "Task 2", userId },
      { title: "Task 3", userId }
    ]);

    // Wait a bit for the tasks to be saved
    await new Promise(resolve => setTimeout(resolve, 100));

    const foundTasks = await Task.find({ userId }).sort({ _id: 1 });

    expect(foundTasks).toHaveLength(3);
    expect(foundTasks[0].title).toBe("Task 1");
    expect(foundTasks[1].title).toBe("Task 2");
    expect(foundTasks[2].title).toBe("Task 3");
  });

  it("should update task completion status", async () => {
    const task = await Task.create({
      title: "Update Task",
      completed: false,
      userId
    });

    // Wait a bit for the task to be saved
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { completed: true },
      { new: true }
    );

    expect(updatedTask).toBeTruthy();
    expect(updatedTask.completed).toBe(true);
  });

  it("should delete task", async () => {
    const task = await Task.create({
      title: "Delete Task",
      userId
    });

    // Wait a bit for the task to be saved
    await new Promise(resolve => setTimeout(resolve, 100));

    await Task.findByIdAndDelete(task._id);
    const deletedTask = await Task.findById(task._id);

    expect(deletedTask).toBeNull();
  });

  it("should not find tasks from other users", async () => {
    const otherUser = await User.create({
      email: "other@example.com",
      password: "123456"
    });

    await Task.create([
      { title: "My Task", userId },
      { title: "Other Task", userId: otherUser._id }
    ]);

    // Wait a bit for the tasks to be saved
    await new Promise(resolve => setTimeout(resolve, 100));

    const myTasks = await Task.find({ userId });

    expect(myTasks).toHaveLength(1);
    expect(myTasks[0].title).toBe("My Task");
  });

  it("should handle task with all fields", async () => {
    const taskData = {
      title: "Complete Task",
      description: "A complete task description",
      completed: true,
      userId
    };

    const task = await Task.create(taskData);

    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.completed).toBe(taskData.completed);
    expect(task.userId.toString()).toBe(userId.toString());
  });
}); 