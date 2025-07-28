const mongoose = require("mongoose");
const User = require("../../../src/models/User");

describe("User Model Integration Tests", () => {
  beforeAll(async () => {
    // Ensure we're connected to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test");
    }
  });

  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        password: "123456"
      };

      const user = await User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
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
  });

  describe("User Queries", () => {
    it("should find user by email", async () => {
      await User.create({ email: "user1@example.com", password: "123456" });

      const user = await User.findOne({ email: "user1@example.com" });

      expect(user).toBeDefined();
      expect(user.email).toBe("user1@example.com");
    });

    it("should find all users", async () => {
      await User.create([
        { email: "user1@example.com", password: "123456" },
        { email: "user2@example.com", password: "654321" }
      ]);

      const users = await User.find({});

      expect(users).toHaveLength(2);
    });

    it("should return null for non-existent user", async () => {
      const user = await User.findOne({ email: "nonexistent@example.com" });

      expect(user).toBeNull();
    });
  });

  describe("User Updates", () => {
    it("should update user password", async () => {
      const user = await User.create({ email: "test@example.com", password: "123456" });

      // Use save() method to trigger password hashing middleware
      user.password = "newpassword";
      const updatedUser = await user.save();

      expect(updatedUser.password).not.toBe("newpassword"); // Password should be hashed
      expect(updatedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it("should update user email", async () => {
      const user = await User.create({ email: "test@example.com", password: "123456" });

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { email: "updated@example.com" },
        { new: true }
      );

      expect(updatedUser.email).toBe("updated@example.com");
    });
  });

  describe("User Deletion", () => {
    it("should delete user by id", async () => {
      const user = await User.create({ email: "test@example.com", password: "123456" });

      await User.findByIdAndDelete(user._id);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("should delete user by email", async () => {
      await User.create({ email: "test@example.com", password: "123456" });

      await User.findOneAndDelete({ email: "test@example.com" });

      const deletedUser = await User.findOne({ email: "test@example.com" });
      expect(deletedUser).toBeNull();
    });

    it("should delete all users", async () => {
      await User.create([
        { email: "user1@example.com", password: "123456" },
        { email: "user2@example.com", password: "654321" }
      ]);

      await User.deleteMany({});

      const users = await User.find({});
      expect(users).toHaveLength(0);
    });
  });

  describe("Database Operations", () => {
    it("should handle concurrent user creation", async () => {
      const promises = [
        User.create({ email: "user1@example.com", password: "123456" }),
        User.create({ email: "user2@example.com", password: "654321" }),
        User.create({ email: "user3@example.com", password: "789012" })
      ];

      const users = await Promise.all(promises);

      expect(users).toHaveLength(3);
      expect(users[0].email).toBe("user1@example.com");
      expect(users[1].email).toBe("user2@example.com");
      expect(users[2].email).toBe("user3@example.com");
    });

    it("should handle bulk operations", async () => {
      const users = await User.create([
        { email: "user1@example.com", password: "123456" },
        { email: "user2@example.com", password: "654321" }
      ]);

      expect(users).toHaveLength(2);
    });
  });
}); 