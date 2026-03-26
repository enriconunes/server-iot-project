import pg from "pg";
import { env } from "@/lib/env";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

export default pool;
