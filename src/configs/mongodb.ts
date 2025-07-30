// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error(
    "⚠️ Please define the MONGO_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection
 * across hot reloads in development. This prevents
 * exhausting your database connections.
 */
let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectToDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "coachdesk",
      bufferCommands: false,
      // Connection pool settings for serverless
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      // Additional optimizations for serverless
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      waitQueueTimeoutMS: 5000, // How long a connection can wait to be established before timing out
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        // Reset the promise so it can be retried
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    return cached.conn;
  } catch (error) {
    // Reset both promise and connection on error
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

// Optional: Add a function to gracefully close connections
export async function disconnectFromDB() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 MongoDB disconnected");
  }
}

// Monitor connection events (optional, useful for debugging)
if (process.env.NODE_ENV === 'development') {
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected');
  });
}

export default connectToDB;
