ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS partner_ad_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS partner_ad_url text NOT NULL DEFAULT 'https://reffpa.com/L?tag=d_6192817m_1599c_&site=6192817&ad=1599&r=registration',
  ADD COLUMN IF NOT EXISTS partner_ad_label text NOT NULL DEFAULT 'Bet with 1xBet',
  ADD COLUMN IF NOT EXISTS partner_ad_subtext text NOT NULL DEFAULT 'Register now and get your welcome bonus';
