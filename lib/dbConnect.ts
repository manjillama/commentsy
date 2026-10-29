import { keys } from "@/config";
import mongoose from "mongoose";
import logger from "@/utils/logger";
declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = keys.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    const started = Date.now();
    logger.info("db.connect.started");
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((connection) => {
        logger.info("db.connect.completed", { elapsedMs: Date.now() - started });
        return connection;
      })
      .catch((error) => {
        logger.error("db.connect.failed", {
          elapsedMs: Date.now() - started,
          errorName: error.name,
          errorCode: typeof error.code === "number" ? error.code : undefined,
        });
        throw error;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
