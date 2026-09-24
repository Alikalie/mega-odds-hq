CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cookie_enabled boolean NOT NULL DEFAULT true,
  cookie_message text NOT NULL DEFAULT 'We use cookies to improve your experience, remember your preferences and analyse traffic. By clicking Accept, you agree to our use of cookies.',
  cookie_accept_text text NOT NULL DEFAULT 'Accept',
  cookie_decline_text text NOT NULL DEFAULT 'Decline',
  cookie_position text NOT NULL DEFAULT 'bottom',
  cookie_style text NOT NULL DEFAULT 'card',
  cookie_bg_color text NOT NULL DEFAULT '#0f172a',
  cookie_text_color text NOT NULL DEFAULT '#f8fafc',
  cookie_button_color text NOT NULL DEFAULT '#22c55e',
  cookie_version integer NOT NULL DEFAULT 1,
  apk_enabled boolean NOT NULL DEFAULT true,
  apk_url text NOT NULL DEFAULT 'https://median.co/share/zpbywrk#apk',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Super admins update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;