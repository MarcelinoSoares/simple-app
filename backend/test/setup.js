const mongoose = require('mongoose');

// Connect to test database once for all tests
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
  
  // Ensure we're connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Failed to connect to test database');
  }
});

// Clean up database before each test to ensure isolation
beforeEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    
    // Clear all collections
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    // Wait a bit to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
});

// Clean up database after each test to ensure isolation
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    
    // Clear all collections
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    // Wait a bit to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error cleaning database after test:', error);
  }
});

// Close connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 