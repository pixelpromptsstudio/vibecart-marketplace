import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibecart').trim();
  const isRemoteUri =
    Boolean(process.env.MONGODB_URI) &&
    !/^mongodb:\/\/(localhost|127\.0\.0\.1)/i.test(uri);

  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//***:***@')}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isRemoteUri ? 15000 : 3000,
    });
    console.log('MongoDB connected successfully.');
  } catch (err: any) {
    console.warn('Direct MongoDB connection failed:', err.message);
    if (isRemoteUri) {
      console.error(
        'Remote MONGODB_URI connection failed. Verify: (1) MongoDB Atlas Network Access allows 0.0.0.0/0, (2) password has no < > brackets or unencoded special characters, and (3) the Atlas cluster is Active.'
      );
      process.exit(1);
    }
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
