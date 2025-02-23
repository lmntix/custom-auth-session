import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { env } from "@/env";

export const db = drizzle({
  connection: env.DATABASE_URL,
  casing: "snake_case",
  schema: schema,
});

export type db = typeof db;

export default db;
