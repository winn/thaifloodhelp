-- Add critical indexes to public.reports table for performance optimization
-- These indexes will significantly improve query performance for dashboard and stats pages

-- Index on updated_at for sorting and filtering by most recent updates
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON public.reports(updated_at DESC);

-- Index on status for filtering by report status (pending, completed, etc.)
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Index on urgency_level for filtering by urgency priority
CREATE INDEX IF NOT EXISTS idx_reports_urgency_level ON public.reports(urgency_level);

-- Composite index for common query pattern: filtering by status and ordering by updated_at
CREATE INDEX IF NOT EXISTS idx_reports_status_updated_at ON public.reports(status, updated_at DESC);

-- Index on created_at for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Composite index for location-based queries
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports(location_lat, location_long) WHERE location_lat IS NOT NULL AND location_long IS NOT NULL;