
-- Drop restrictive policies and recreate as permissive for anonymous inserts
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Anyone can insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can update own session" ON public.sessions;

CREATE POLICY "Anyone can insert visitors" ON public.visitors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can insert clicks" ON public.clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can insert sessions" ON public.sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update own session" ON public.sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
