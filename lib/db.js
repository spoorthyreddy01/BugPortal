import mongoose from "mongoose";
import dns from "node:dns/promises";
// Side-effect import: registers every model schema with Mongoose exactly
// once, regardless of which service imports connectDB() first. Without
// this, a service that only imports Issue but populates "project"/
// "reporter" (refs to models it never directly imported) throws
// MissingSchemaError the first time that code path runs cold — relative
// path (not the "@/" alias) so this also works when lib/db.js is loaded
// by scripts/seed.mjs via plain `node`, outside Next's bundler.
import "../models/index.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
