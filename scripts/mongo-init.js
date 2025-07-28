// MongoDB initialization script
db = db.getSiblingDB('simpleapp');

// Create collections
db.createCollection('users');
db.createCollection('tasks');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "createdAt": -1 });

// Create admin user
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$rQZ9K8mN2pL1vX3yB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8",
  name: "Admin User",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("MongoDB initialized successfully!"); 