import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Check which migrations have been run
    const { rows: executedMigrations } = await pool.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    
    const executedFilenames = new Set(executedMigrations.map(row => row.filename));
    
    // List of migration files to run
    const migrationFiles = [
      '001_initial_schema.sql'
    ];
    
    for (const filename of migrationFiles) {
      if (executedFilenames.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }
      
      console.log(`📄 Running migration: ${filename}`);
      
      try {
        const migrationPath = join(__dirname, 'migrations', filename);
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        // Record that this migration was executed
        await pool.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        console.log(`✅ Successfully executed ${filename}`);
      } catch (error) {
        console.error(`❌ Error executing ${filename}:`, error);
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };