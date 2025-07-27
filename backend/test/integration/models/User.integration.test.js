const mongoose = require("mongoose");
const User = require("../../../src/models/User");

describe("User Model Integration Tests", () => {
  beforeAll(async () => {
    // Ensure we're connected to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test");
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        password: "123456"
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user._id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
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
  });

  describe("User Queries", () => {
    beforeEach(async () => {
      await User.create([
        { email: "user1@example.com", password: "123456" },
        { email: "user2@example.com", password: "654321" },
        { email: "user3@example.com", password: "789012" }
      ]);
    });

    it("should find user by email", async () => {
      const user = await User.findOne({ email: "user1@example.com" });

      expect(user).toBeDefined();
      expect(user.email).toBe("user1@example.com");
    });

    it("should find all users", async () => {
      const users = await User.find({});

      expect(users).toHaveLength(3);
      expect(users.map(u => u.email)).toContain("user1@example.com");
      expect(users.map(u => u.email)).toContain("user2@example.com");
      expect(users.map(u => u.email)).toContain("user3@example.com");
    });

    it("should return null for non-existent user", async () => {
      const user = await User.findOne({ email: "nonexistent@example.com" });

      expect(user).toBeNull();
    });
  });

  describe("User Updates", () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: "test@example.com",
        password: "123456"
      });
    });

    it("should update user password", async () => {
      const newPassword = "newpassword123";
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { password: newPassword },
        { new: true }
      );

      expect(updatedUser.password).toBe(newPassword);
      expect(updatedUser.email).toBe(user.email);
    });

    it("should update user email", async () => {
      const newEmail = "updated@example.com";
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { email: newEmail },
        { new: true }
      );

      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.password).toBe(user.password);
    });
  });

  describe("User Deletion", () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: "test@example.com",
        password: "123456"
      });
    });

    it("should delete user by id", async () => {
      await User.findByIdAndDelete(user._id);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("should delete user by email", async () => {
      await User.findOneAndDelete({ email: user.email });

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("should delete all users", async () => {
      await User.deleteMany({});

      const users = await User.find({});
      expect(users).toHaveLength(0);
    });
  });

  describe("Database Operations", () => {
    it("should handle concurrent user creation", async () => {
      const userPromises = Array.from({ length: 5 }, (_, i) =>
        User.create({
          email: `user${i}@example.com`,
          password: `password${i}`
        })
      );

      const users = await Promise.all(userPromises);

      expect(users).toHaveLength(5);
      users.forEach((user, i) => {
        expect(user.email).toBe(`user${i}@example.com`);
      });
    });

    it("should handle transaction-like operations", async () => {
      const session = await mongoose.startSession();
      
      try {
        await session.withTransaction(async () => {
          const user1 = await User.create([{
            email: "transaction1@example.com",
            password: "123456"
          }], { session });

          const user2 = await User.create([{
            email: "transaction2@example.com",
            password: "654321"
          }], { session });

          expect(user1[0].email).toBe("transaction1@example.com");
          expect(user2[0].email).toBe("transaction2@example.com");
        });
      } finally {
        await session.endSession();
      }
    });
  });
}); 