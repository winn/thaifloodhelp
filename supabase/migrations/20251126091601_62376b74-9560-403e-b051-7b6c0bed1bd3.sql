-- Add index on updated_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON public.reports(updated_at DESC);

-- Add index on created_at 
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Add index on urgency_level for filtering
CREATE INDEX IF NOT EXISTS idx_reports_urgency_level ON public.reports(urgency_level);