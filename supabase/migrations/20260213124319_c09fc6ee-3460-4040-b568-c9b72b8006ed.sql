
-- Allow anyone (including non-registered) to view free tips
DROP POLICY IF EXISTS "Authenticated users can view free tips" ON public.free_tips;
CREATE POLICY "Anyone can view free tips"
  ON public.free_tips
  FOR SELECT
  USING (true);
