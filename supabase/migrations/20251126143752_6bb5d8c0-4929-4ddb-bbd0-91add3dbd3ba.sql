-- Create line_sessions table for storing webhook session data
-- Use message_id as primary key (unique per LINE message)
CREATE TABLE IF NOT EXISTS public.line_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_line_sessions_message_id ON public.line_sessions(message_id);
CREATE INDEX IF NOT EXISTS idx_line_sessions_updated_at ON public.line_sessions(updated_at);

-- Enable RLS
ALTER TABLE public.line_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for Edge Functions)
CREATE POLICY "Service role can manage line_sessions" ON public.line_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.line_sessions IS 'Stores temporary session data for LINE webhook interactions (keyed by messageId)';