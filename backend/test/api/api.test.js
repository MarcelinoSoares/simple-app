const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const User = require("../../src/models/User");
const Task = require("../../src/models/Task");

let token;
let createdTaskId;

beforeAll(async () => {
  // Limpar dados de teste
  await User.deleteMany({});
  await Task.deleteMany({});

  // Create test user first
  await User.create({ email: "test@example.com", password: "123456" });

  // Create authentication token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "123456" });
  token = res.body.token;
});

describe("API Test Suite", () => {
  test("POST /api/auth/login - success", async () => {
    // Create user for this test
    await User.create({ email: "test2@example.com", password: "123456" });
    
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test2@example.com", password: "123456" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login - failure with wrong password", async () => {
    // First create the user
    await User.create({ email: "test3@example.com", password: "123456" });
    
    // Agora tentar login com senha errada
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test3@example.com", password: "wrong" });
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/tasks - success", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/tasks - success", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test task", description: "desc", completed: false });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test task");
    createdTaskId = res.body._id;
  });

  test("POST /api/tasks - success with minimal data", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minimal task" });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Minimal task");
  });

  test("PUT /api/tasks/:id - success", async () => {
    // Criar uma nova tarefa para editar
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to edit", description: "desc", completed: false });
    
    const taskId = createRes.body._id;
    
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test("PUT /api/tasks/:id - failure (not found)", async () => {
    const res = await request(app)
      .put("/api/tasks/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /api/tasks/:id - success", async () => {
    // Criar uma nova tarefa para deletar
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to delete", description: "desc", completed: false });
    
    const taskId = createRes.body._id;
    
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  test("DELETE /api/tasks/:id - failure (not found)", async () => {
    const res = await request(app)
      .delete("/api/tasks/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
}); 