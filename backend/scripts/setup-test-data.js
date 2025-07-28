const mongoose = require('mongoose');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

// Test data
const testUser = {
  email: 'test@example.com',
  password: '123456',
  name: 'Test User'
};

const testTasks = [
  {
    title: 'Test Task 1',
    description: 'This is a test task',
    completed: false
  },
  {
    title: 'Test Task 2',
    description: 'Another test task',
    completed: true
  }
];

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-app');
    console.log('Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: testUser.email });
    console.log('Cleared existing test user');

    // Create test user
    const user = new User(testUser);
    await user.save();
    console.log('Created test user:', user.email);

    // Clear existing tasks for this user
    await Task.deleteMany({ userId: user._id });
    console.log('Cleared existing tasks for test user');

    // Create test tasks
    const tasks = testTasks.map(task => ({
      ...task,
      userId: user._id
    }));

    await Task.insertMany(tasks);
    console.log('Created test tasks');

    console.log('Test data setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData(); 