import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Initialize with empty values - helps with TypeScript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log warning if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Waitlist functionality may not work properly.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Create Supabase client - this will work with TypeScript
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function addToWaitlist(email: string) {
  try {
    console.log("Starting waitlist submission process for:", email);
    
    // Check for valid credentials
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        success: false, 
        error: new Error('Supabase not configured'), 
        message: 'The waitlist is temporarily unavailable. Please try again later.' 
      };
    }
    
    if (!email || !email.includes('@')) {
      return { 
        success: false, 
        error: new Error('Invalid email format'), 
        message: 'Please enter a valid email address.' 
      };
    }
    
    // Check connection to Supabase
    try {
      const { error: pingError } = await supabase.from('waitlist').select('count').limit(0);
      if (pingError) {
        console.error('Supabase connection error:', pingError);
        if (pingError.code === '42P01') {
          return { 
            success: false, 
            error: pingError, 
            message: 'The waitlist table does not exist. Please set up your Supabase project correctly.' 
          };
        }
        
        if (pingError.code === 'PGRST116') {
          return { 
            success: false, 
            error: pingError, 
            message: 'Invalid API key or URL. Please check your Supabase credentials.' 
          };
        }
        
        return { 
          success: false, 
          error: pingError, 
          message: `Database connection error: ${pingError.message || 'Unknown error'}` 
        };
      }
    } catch (pingError) {
      console.error('Failed to connect to Supabase:', pingError);
      return { 
        success: false, 
        error: pingError, 
        message: 'Could not connect to the database. Please try again later.' 
      };
    }

    // Check if email already exists to provide better feedback
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing email:', checkError);
      
      if (checkError.code === '42P01') {
        return { 
          success: false, 
          error: checkError, 
          message: 'The waitlist table does not exist. Please create it in your Supabase project.' 
        };
      }
      
      // Handle other errors
      return { 
        success: false, 
        error: checkError, 
        message: `Error checking email: ${checkError.message || 'Unknown error'}`
      };
    }

    if (existingUser) {
      console.log('Email already registered:', email);
      return { success: true, data: existingUser, message: 'Email already registered' };
    }

    // Insert new email
    console.log('Inserting new email into waitlist:', email);
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }])
      .select();

    if (error) {
      console.error('Supabase insert error details:', error);
      
      // Check specific error codes
      if (error.code === '42P01') {
        return { 
          success: false, 
          error, 
          message: 'The waitlist table does not exist. Please create it in your Supabase project.' 
        };
      }
      
      if (error.code === '23505') {
        return { 
          success: true, 
          message: 'Email already registered' 
        };
      }
      
      if (error.code === '42501') {
        return { 
          success: false, 
          error, 
          message: 'Permission denied. Please check your Row Level Security (RLS) policies.' 
        };
      }
      
      // Return generic error message
      return { 
        success: false, 
        error, 
        message: `Database error: ${error.message || 'Unknown error'}` 
      };
    }
    
    console.log('Successfully added to waitlist:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error adding to waitlist:', error);
    return { 
      success: false, 
      error, 
      message: 'Failed to add to waitlist. Please try again later.' 
    };
  }
} 