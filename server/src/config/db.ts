import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise-task-manager'
    );
    console.log(`🍃 [database]: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [database]: Connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};