# HelloREADME Application

## Supabase Setup for Waitlist

To enable the waitlist functionality with Supabase:

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your Supabase URL and anon key from Project Settings > API
4. Update the `.env.local` file with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
5. Run our setup script to automatically create the required table:
   ```bash
   node scripts/setup-waitlist.js
   ```

### Manual Table Setup (if the script fails)

If the script fails, you can manually set up the waitlist table:

1. Go to the SQL Editor in your Supabase dashboard and run this SQL:
   ```sql
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
   
   -- Create policy to allow selects (to check if email exists)
   CREATE POLICY "Allow anonymous selects" ON public.waitlist
     FOR SELECT USING (true);
   ```

## Deployment to Vercel

When deploying to Vercel, you need to add your Supabase environment variables:

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add the following variables with your actual values:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`  
     Value: Your Supabase URL (e.g., https://yourproject.supabase.co)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     Value: Your Supabase anon key
4. Click "Save"
5. Redeploy your application for the changes to take effect

### Troubleshooting Vercel Deployment

If you encounter build errors related to Supabase on Vercel:

1. **Missing Environment Variables**: Make sure you've added the environment variables in the Vercel dashboard, not just in your local .env.local file.

2. **WebSocket Dependencies Warnings**: If you see warnings about missing `bufferutil` or `utf-8-validate` dependencies, these are optional and won't affect functionality.

3. **Build Errors During API Route Collection**: If you get errors like "Failed to collect page data for /api/waitlist", make sure your API routes don't initialize Supabase client during build time. The code has been updated to handle this.

4. **Database Connection Issues**: After deployment, check the browser console and server logs for any connection issues. You might need to update your Supabase RLS policies.

5. **Demo Mode**: When environment variables are missing, the app will run in "demo mode" where waitlist submissions are simulated but not actually saved to the database.

## Troubleshooting Waitlist Issues

If you encounter issues with the waitlist functionality:

1. Check browser console for detailed error messages
2. Verify that your `.env.local` file contains the complete Supabase URL and anon key
3. Make sure the waitlist table exists in your Supabase project
4. Check that Row Level Security (RLS) policies are set up correctly to allow anonymous inserts
5. Run the setup script again: `node scripts/setup-waitlist.js`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Running Setup Script

The setup script will:
1. Check if the waitlist table exists
2. Create it if it doesn't exist
3. Test inserting a record to verify everything works

```bash
node scripts/setup-waitlist.js
```

## Project Structure

- `app/` - Next.js application code
  - `page.tsx` - Main landing page with waitlist form
- `components/` - React components
- `lib/` - Utility functions and Supabase client
- `scripts/` - Setup and utility scripts 