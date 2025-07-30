// src/configs/mongodb.ts

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("⚠️ Please define the MONGO_URI environment variable in .env.local");
}

// Augment globalThis for TypeScript
declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = mongoose.connect(MONGO_URI, {
    dbName: "coachdesk",
    bufferCommands: false,
  });
}

export default cached;
