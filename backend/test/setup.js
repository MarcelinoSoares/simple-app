const mongoose = require('mongoose');

// Connect to test database once for all tests
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

// Clean up database before each test to ensure isolation
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  // Clear all collections
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Wait a bit to ensure cleanup is complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Close database connection after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}); 