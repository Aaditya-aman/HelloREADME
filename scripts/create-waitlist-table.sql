-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Create a policy to allow service role to read all data
CREATE POLICY "Allow service role to select" ON public.waitlist
  FOR SELECT USING (auth.role() = 'service_role');

-- Create demo entry
INSERT INTO public.waitlist (email)
VALUES ('demo@example.com')
ON CONFLICT (email) DO NOTHING; 