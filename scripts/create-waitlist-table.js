// Script to create the waitlist table in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWaitlistTable() {
  try {
    // Check if table exists
    const { error: checkError } = await supabase.from('waitlist').select('id').limit(1);
    
    if (!checkError) {
      console.log('The waitlist table already exists!');
      return;
    }
    
    // Create table using SQL
    // Note: This requires supabase-js >= 2.x and postgrest-js >= 1.x
    const { error } = await supabase.rpc('create_waitlist_table');
    
    if (error) {
      console.error('Error creating waitlist table:', error);
      console.log('\nTo manually create the table, run this SQL in the Supabase SQL editor:');
      console.log(`
CREATE TABLE public.waitlist (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable row level security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
  FOR INSERT WITH CHECK (true);
      `);
    } else {
      console.log('Successfully created waitlist table!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create SQL function to create table
async function createSQLFunction() {
  try {
    const { error } = await supabase.rpc('create_rpc_function');
    
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating SQL function:', error);
      console.log('\nTo manually create the function, run this SQL in the Supabase SQL editor:');
      console.log(`
CREATE OR REPLACE FUNCTION create_waitlist_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.waitlist (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
  );
  
  -- Enable row level security (RLS)
  ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow inserts
  CREATE POLICY "Allow anonymous inserts" ON public.waitlist
    FOR INSERT WITH CHECK (true);
END;
$$ LANGUAGE plpgsql;
      `);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating SQL function:', error);
    return false;
  }
}

async function run() {
  if (await createSQLFunction()) {
    await createWaitlistTable();
  }
  process.exit(0);
}

run(); 