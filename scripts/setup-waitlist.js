// Script to create the waitlist table in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Anon Key present:', supabaseKey ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWaitlistTable() {
  try {
    console.log('Checking if waitlist table exists...');
    
    // Try to select from the table to see if it exists
    const { error: tableCheckError } = await supabase
      .from('waitlist')
      .select('count')
      .limit(1);
    
    // If no error, table exists
    if (!tableCheckError) {
      console.log('✅ Waitlist table already exists!');
      return true;
    }
    
    // If error is not about missing table, log and exit
    if (tableCheckError.code !== '42P01') {
      console.error('❌ Error checking table existence:', tableCheckError);
      return false;
    }
    
    console.log('Waitlist table does not exist. Creating it now...');
    
    // Create the table using SQL
    const { error: createError } = await supabase.rpc('create_waitlist_table');
    
    if (createError) {
      console.error('❌ Error creating table via RPC:', createError);
      console.log('\nAttempting to create table directly via SQL...');
      
      // Try direct SQL execution as fallback
      const { error: sqlError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS public.waitlist (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          email text NOT NULL UNIQUE,
          created_at timestamp with time zone DEFAULT now() NOT NULL
        );
        
        -- Enable row level security (RLS)
        ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow inserts
        CREATE POLICY "Allow anonymous inserts" ON public.waitlist
          FOR INSERT WITH CHECK (true);
      `;
      
      if (sqlError) {
        console.error('❌ Error creating table via SQL:', sqlError);
        console.log('\nTo manually create the table, please run this SQL in the Supabase SQL editor:');
        console.log(`
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable row level security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
  FOR INSERT WITH CHECK (true);
        `);
        return false;
      }
      
      console.log('✅ Successfully created waitlist table via SQL!');
      return true;
    }
    
    console.log('✅ Successfully created waitlist table via RPC!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testWaitlistInsert() {
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    console.log(`Testing insert with email: ${testEmail}`);
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: testEmail }])
      .select();
    
    if (error) {
      console.error('❌ Error inserting test email:', error);
      
      if (error.code === '42501') {
        console.log('\nRow Level Security (RLS) policy issue detected!');
        console.log('Please make sure you have enabled a policy to allow inserts.');
      }
      
      return false;
    }
    
    console.log('✅ Test insert successful!');
    console.log(data);
    return true;
  } catch (error) {
    console.error('❌ Error testing insert:', error);
    return false;
  }
}

// Run the script
async function main() {
  console.log('🚀 Starting waitlist table setup...');
  
  const tableExists = await createWaitlistTable();
  if (!tableExists) {
    console.log('❌ Failed to setup waitlist table. Please check the errors above.');
    process.exit(1);
  }
  
  const insertWorks = await testWaitlistInsert();
  if (!insertWorks) {
    console.log('❌ Failed to test waitlist insert. Please check the errors above.');
    process.exit(1);
  }
  
  console.log('✅ Waitlist setup complete! Your application is ready to accept waitlist signups.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 