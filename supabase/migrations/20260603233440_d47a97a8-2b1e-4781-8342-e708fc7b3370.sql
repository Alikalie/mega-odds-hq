
CREATE OR REPLACE FUNCTION public.apply_approved_upgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration INTEGER;
BEGIN
  IF NEW.status = 'approved'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN

    -- Upgrade the user's tier and approve their account
    UPDATE public.profiles
       SET subscription = NEW.requested_tier::subscription_tier,
           status = 'approved'::user_status,
           updated_at = now()
     WHERE id = NEW.user_id;

    -- If a package was chosen, activate a subscription record
    IF NEW.requested_package_id IS NOT NULL THEN
      SELECT duration_days INTO v_duration
        FROM public.subscription_packages
       WHERE id = NEW.requested_package_id;

      IF v_duration IS NOT NULL THEN
        -- Deactivate any prior active subscriptions for this user
        UPDATE public.user_subscriptions
           SET is_active = false, updated_at = now()
         WHERE user_id = NEW.user_id AND is_active = true;

        INSERT INTO public.user_subscriptions (user_id, package_id, starts_at, expires_at, is_active)
        VALUES (NEW.user_id, NEW.requested_package_id, now(), now() + (v_duration || ' days')::interval, true);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_approved_upgrade_ins ON public.upgrade_requests;
DROP TRIGGER IF EXISTS apply_approved_upgrade_upd ON public.upgrade_requests;

CREATE TRIGGER apply_approved_upgrade_ins
AFTER INSERT ON public.upgrade_requests
FOR EACH ROW EXECUTE FUNCTION public.apply_approved_upgrade();

CREATE TRIGGER apply_approved_upgrade_upd
AFTER UPDATE OF status ON public.upgrade_requests
FOR EACH ROW EXECUTE FUNCTION public.apply_approved_upgrade();
