
-- Add site column to visitors to distinguish traffic source
ALTER TABLE public.visitors ADD COLUMN site text NOT NULL DEFAULT 'main';

-- Add site column to clicks
ALTER TABLE public.clicks ADD COLUMN site text NOT NULL DEFAULT 'main';
