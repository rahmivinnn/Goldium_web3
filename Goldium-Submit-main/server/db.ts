import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, we'll use a fallback approach
let db: any;
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.warn('⚠️ Failed to connect to PostgreSQL, falling back to in-memory storage');
    db = null;
  }
} else {
  console.warn('⚠️ DATABASE_URL not set, using in-memory storage for development');
  db = null;
}

export { pool, db };
