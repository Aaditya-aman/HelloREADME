// Script to test the waitlist table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;

async function testWaitlistTable() {
  console.log('Testing Supabase connection and waitlist table...');
  
  try {
    // 1. Check if table exists
    console.log('Checking if waitlist table exists...');
    const { error: checkError } = await supabase.from('waitlist').select('id').limit(1);
    
    if (checkError) {
      if (checkError.code === '42P01') {
        console.error('❌ The waitlist table does not exist!');
        console.log('\nPlease create it using the SQL in the README.md file.');
      } else {
        console.error('❌ Error checking waitlist table:', checkError);
      }
      return false;
    }
    
    console.log('✅ Waitlist table exists!');
    
    // 2. Test inserting a record
    console.log(`Testing insert with email: ${testEmail}`);
    const { data, error: insertError } = await supabase
      .from('waitlist')
      .insert([{ email: testEmail }])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test email:', insertError);
      
      if (insertError.code === '42501') {
        console.log('\nRow Level Security (RLS) policy issue detected!');
        console.log('Please make sure you have enabled a policy to allow inserts.');
      }
      
      return false;
    }
    
    console.log('✅ Successfully inserted test record!');
    console.log(data);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing waitlist functionality:', error);
    return false;
  }
}

// Run the test
testWaitlistTable()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests passed! Your waitlist functionality should work correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please fix the issues and try again.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 