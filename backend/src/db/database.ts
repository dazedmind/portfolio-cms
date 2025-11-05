import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config(); // make sure this runs before anything else

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Neon requires SSL and sometimes `channel_binding` must be disabled
const client = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  prepare: false, // 🔥 optional but fixes ECONNRESET sometimes
  max: 1, // optional but good for serverless (avoid too many clients)
});

export const db = drizzle(client);
