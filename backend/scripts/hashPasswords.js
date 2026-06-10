import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { supabase } from '../lib/SupabaseClient.js';

const isBcryptHash = (value) =>
  typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const processTable = async (tableName) => {
  console.log(`Checking ${tableName}...`);
  const { data, error } = await supabase
    .from(tableName)
    .select('id, email, password');

  if (error) {
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  let updatedCount = 0;
  for (const row of data || []) {
    if (!row.password) {
      console.warn(`Skipping ${tableName} row ${row.id}: missing password`);
      continue;
    }

    if (isBcryptHash(row.password)) {
      continue;
    }

    const hashedPassword = await hashPassword(row.password);
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ password: hashedPassword })
      .eq('id', row.id);

    if (updateError) {
      throw new Error(`Failed to update ${tableName} row ${row.id}: ${updateError.message}`);
    }

    updatedCount += 1;
    console.log(`Updated ${tableName} row ${row.id} (${row.email || 'no email'})`);
  }

  console.log(`${tableName}: ${updatedCount} password(s) hashed.`);
};

const run = async () => {
  await processTable('admin');
  await processTable('employee');
  console.log('Password hashing migration completed.');
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
