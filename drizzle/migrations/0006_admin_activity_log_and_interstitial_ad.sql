CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_role text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read activity" ON public.admin_activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX admin_activity_log_created_idx ON public.admin_activity_log (created_at DESC);

CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role app_role;
  v_email text;
  v_row jsonb;
  v_summary text;
  v_label text;
  v_sa record;
BEGIN
  IF v_uid IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_uid
    AND role IN ('admin','super_admin') ORDER BY role DESC LIMIT 1;
  IF v_role IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  v_row := to_jsonb(COALESCE(NEW, OLD));
  SELECT email INTO v_email FROM public.profiles WHERE id = v_uid;
  v_summary := COALESCE(
    NULLIF(concat_ws(' vs ', v_row->>'home_team', v_row->>'away_team'), ''),
    v_row->>'title', v_row->>'name', v_row->>'email', v_row->>'user_email',
    v_row->>'code', v_row->>'feature_name', v_row->>'id');
  v_label := replace(TG_TABLE_NAME, '_', ' ');

  INSERT INTO public.admin_activity_log (actor_id, actor_email, actor_role, action, table_name, record_id, summary)
  VALUES (v_uid, v_email, v_role::text, TG_OP, TG_TABLE_NAME, v_row->>'id', v_summary);

  IF v_role = 'admin' THEN
    FOR v_sa IN SELECT user_id FROM public.user_roles WHERE role = 'super_admin' LOOP
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (v_sa.user_id,
        'Admin activity: ' || lower(TG_OP) || ' ' || v_label,
        COALESCE(v_email, 'An admin') || ' ' || lower(TG_OP) || 'd ' || v_label || COALESCE(': ' || v_summary, ''));
    END LOOP;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['free_tips','vip_tips','special_tips','announcements','booking_codes','tip_categories',
    'subscription_packages','payment_methods','prediction_types','privacy_security','app_information',
    'support_contacts','feature_toggles','site_settings','upgrade_requests','user_roles','user_subscriptions','profiles']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS log_admin_activity_trg ON public.%I', t);
    EXECUTE format('CREATE TRIGGER log_admin_activity_trg AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity()', t);
  END LOOP;
END $$;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS interstitial_ad_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS interstitial_ad_slot text;

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;