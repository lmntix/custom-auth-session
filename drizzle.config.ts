import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schemaFilter: ["auth", "public"],
  tablesFilter: ["*"],
  verbose: true,
  strict: true,
});
