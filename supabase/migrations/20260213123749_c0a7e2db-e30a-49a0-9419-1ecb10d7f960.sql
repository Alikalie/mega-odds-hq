
-- Update free_tips RLS: allow ALL authenticated users to view (not just approved)
DROP POLICY IF EXISTS "Approved users can view free tips" ON public.free_tips;
CREATE POLICY "Authenticated users can view free tips"
  ON public.free_tips
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Enable realtime for all tips tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.free_tips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vip_tips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_tips;
