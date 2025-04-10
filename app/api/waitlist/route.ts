import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if the waitlist table exists
    const { data, error, count } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ 
          status: 'error',
          message: 'The waitlist table does not exist. Please create it in your Supabase project.',
          exists: false,
          error: error.message
        }, { status: 404 });
      }
      
      throw error;
    }

    // Table exists, return success
    return NextResponse.json({ 
      status: 'success',
      message: 'Waitlist table exists',
      exists: true,
      count
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to check waitlist status',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 