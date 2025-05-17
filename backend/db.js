import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',  // Or your Supabase user, e.g., postgres.pcfnxhgnytdufifvltqe
  host: 'db.pcfnxhgnytdufifvltqe.supabase.co', // Supabase DB host (check your Supabase dashboard)
  database: 'postgres', // Supabase default DB name, or your DB name
  password: 'Goa%402016', // Your Supabase password
  port: 5432,          // Usually 5432 on Supabase (not 6543)
  ssl: {
    rejectUnauthorized: false, // Needed for SSL connection to Supabase
  },
});

export { pool };
