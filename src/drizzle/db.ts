import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { env } from "@/data/env/server";

const isProduction = process.env.NODE_ENV === "production";

export const db = drizzle({
  schema,
  connection: {
    connectionString: env.POSTGRES_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
});
