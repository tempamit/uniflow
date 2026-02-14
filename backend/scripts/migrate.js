import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlDir = path.resolve(__dirname, '../sql');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for migration');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function runMigrations() {
  await ensureMigrationsTable();

  const files = (await fs.readdir(sqlDir))
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const already = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [file]);
    if (already.rowCount > 0) {
      continue;
    }

    const fullPath = path.join(sqlDir, file);
    const sql = await fs.readFile(fullPath, 'utf8');

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations(version) VALUES($1)', [file]);
      await pool.query('COMMIT');
      console.log(`Migration applied: ${file}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

runMigrations()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
