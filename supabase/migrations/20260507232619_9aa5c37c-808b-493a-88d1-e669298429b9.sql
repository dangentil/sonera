DROP POLICY IF EXISTS "Ratings visibility" ON public.ratings;
CREATE POLICY "Ratings visibility" ON public.ratings FOR SELECT USING (true);