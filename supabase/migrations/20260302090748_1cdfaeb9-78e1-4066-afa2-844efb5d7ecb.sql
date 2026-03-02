
-- Booking codes table for admins to add booking codes to categories
CREATE TABLE public.booking_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  code text NOT NULL,
  description text,
  tip_type text NOT NULL DEFAULT 'free',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage booking codes" ON public.booking_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approved users can view active booking codes" ON public.booking_codes
  FOR SELECT TO authenticated
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'::user_status
  ));

-- Feature toggles table for super admin control
CREATE TABLE public.feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  feature_name text NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage feature toggles" ON public.feature_toggles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view feature toggles" ON public.feature_toggles
  FOR SELECT TO authenticated
  USING (true);

-- Admin booking code access tracking  
CREATE TABLE public.admin_feature_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  feature_key text NOT NULL,
  is_granted boolean DEFAULT false,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(admin_id, feature_key)
);

ALTER TABLE public.admin_feature_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage feature access" ON public.admin_feature_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view own feature access" ON public.admin_feature_access
  FOR SELECT TO authenticated
  USING (auth.uid() = admin_id);

-- Insert default feature toggles
INSERT INTO public.feature_toggles (feature_key, feature_name, description, is_enabled)
VALUES 
  ('booking_codes', 'Booking Codes', 'Allow admins to add booking codes to categories that users can copy', false),
  ('app_download_prompt', 'App Download Prompt', 'Show app download/upgrade prompt to mobile users', true);
