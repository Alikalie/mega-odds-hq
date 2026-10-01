ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS custom_ad_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_ad_image_url text,
  ADD COLUMN IF NOT EXISTS custom_ad_link text,
  ADD COLUMN IF NOT EXISTS custom_ad_title text;