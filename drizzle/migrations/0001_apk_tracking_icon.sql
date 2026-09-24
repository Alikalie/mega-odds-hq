ALTER TABLE public.site_settings ADD COLUMN apk_icon_url text, ADD COLUMN apk_label text NOT NULL DEFAULT 'Download App';
CREATE TABLE public.apk_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  apk_url text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.apk_clicks TO anon, authenticated;
GRANT SELECT ON public.apk_clicks TO authenticated;
GRANT ALL ON public.apk_clicks TO service_role;
ALTER TABLE public.apk_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log apk clicks" ON public.apk_clicks FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admins read apk clicks" ON public.apk_clicks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX apk_clicks_created_idx ON public.apk_clicks (created_at DESC);