const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is required to run migrations.");
    console.error("Usage: DATABASE_URL='postgresql://...' node src/scripts/run-migration.js");
    process.exit(1);
  }

  const sqlFilePath = path.join(__dirname, '../../supabase/migrations/20260824000000_add_approved_to_profiles.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Executing migration SQL...');
    await client.query(sql);
    console.log('Migration successfully applied! ✅');
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
