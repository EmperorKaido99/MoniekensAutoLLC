import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

const client = new pg.Client({
  host:     'db.hvlftmtdchvcommhumov.supabase.co',
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: '[ILoveLauren@99]',
  ssl:      { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected to Supabase database...');

  // Split and run each statement separately
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('OK:', stmt.slice(0, 60).replace(/\n/g, ' ') + '...');
    } catch (err) {
      // Skip "already exists" errors
      if (err.message.includes('already exists')) {
        console.log('SKIP (exists):', stmt.slice(0, 60).replace(/\n/g, ' '));
      } else {
        console.warn('WARN:', err.message);
      }
    }
  }

  console.log('\nSchema applied successfully.');
} catch (err) {
  console.error('Connection error:', err.message);
} finally {
  await client.end();
}
