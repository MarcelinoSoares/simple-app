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
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Drop all indexes and recreate them to avoid unique constraint issues
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (error) {
    // Ignore errors if database doesn't exist
  }
  
  // Wait a bit to ensure cleanup is complete
  await new Promise(resolve => setTimeout(resolve, 200));
});

// Close database connection after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}); 