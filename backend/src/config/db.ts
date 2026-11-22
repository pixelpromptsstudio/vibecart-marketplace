import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibecart';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//***:***@')}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully.');
  } catch (err: any) {
    console.warn('Direct MongoDB connection failed:', err.message);
    console.log('Falling back to local in-memory MongoDB server for seamless zero-setup execution...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      console.log(`Connected to in-memory MongoDB at: ${inMemoryUri}`);
      await mongoose.connect(inMemoryUri);
      console.log('In-memory MongoDB connected successfully.');
    } catch (inMemErr: any) {
      console.error('Fatal: Could not connect to either MongoDB or in-memory server:', inMemErr.message);
      process.exit(1);
    }
  }
};
