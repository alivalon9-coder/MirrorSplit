-- Create table for uploads
-- Run this in the Supabase SQL editor or via the Supabase CLI

CREATE TABLE IF NOT EXISTS public.uploads (
  id text PRIMARY KEY,
  title text,
  artist text,
  price text,
  section text,
  fileName text,
  url text,
  createdAt timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS uploads_section_idx ON public.uploads (section);
CREATE INDEX IF NOT EXISTS uploads_createdat_idx ON public.uploads (createdAt DESC);
