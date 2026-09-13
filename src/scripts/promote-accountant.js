const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is required.");
    console.error("Usage: DATABASE_URL='postgresql://...' node src/scripts/promote-accountant.js");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Run database migration
    console.log('Reading migration SQL...');
    const migrationPath = path.join(__dirname, '../../supabase/migrations/20260828000000_add_accountant_and_finance_tables.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(migrationSql);
    console.log('Database migration successfully applied! ✅');

    // 2. Promote user to accountant
    console.log('Promoting sahilsahoo68@gmail.com to accountant...');
    const promoteSql = `
      DO $$
      DECLARE
        target_user_id UUID;
      BEGIN
        SELECT id INTO target_user_id FROM public.profiles WHERE email = 'sahilsahoo68@gmail.com';
        
        IF target_user_id IS NOT NULL THEN
          -- Update profiles table
          UPDATE public.profiles SET role = 'accountant' WHERE id = target_user_id;
          
          -- Insert user_roles mapping
          INSERT INTO public.user_roles (user_id, role)
          VALUES (target_user_id, 'accountant')
          ON CONFLICT (user_id, role) DO NOTHING;
          
          -- Also ensure they have student role for multi-panel toggles
          INSERT INTO public.user_roles (user_id, role)
          VALUES (target_user_id, 'student')
          ON CONFLICT (user_id, role) DO NOTHING;
          
          RAISE NOTICE 'Successfully promoted sahilsahoo68@gmail.com to accountant!';
        ELSE
          RAISE WARNING 'User sahilsahoo68@gmail.com not found in profiles!';
        END IF;
      END $$;
    `;
    await client.query(promoteSql);
    console.log('User role update successfully executed! ✅');
  } catch (err) {
    console.error('Error running script:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
