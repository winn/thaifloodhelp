-- Add map_link field to store Google Maps URLs
ALTER TABLE public.reports 
ADD COLUMN map_link text;