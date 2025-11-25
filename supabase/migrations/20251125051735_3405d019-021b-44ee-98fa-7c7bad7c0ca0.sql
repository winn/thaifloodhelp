-- Add new fields to reports table
ALTER TABLE public.reports 
ADD COLUMN reporter_name text,
ADD COLUMN last_contact_at timestamp with time zone,
ADD COLUMN additional_info text;