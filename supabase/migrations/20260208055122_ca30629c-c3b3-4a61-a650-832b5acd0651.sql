-- Create subscription packages table for Special tier (Silver, Gold, Premium, Platinum)
CREATE TABLE public.subscription_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'special', -- 'vip' or 'special'
  price decimal(10,2) NOT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  features text[] DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user subscriptions table with expiry dates
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.subscription_packages(id) ON DELETE CASCADE,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, package_id, starts_at)
);

-- Enable RLS on packages
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription packages
CREATE POLICY "Anyone can view active packages" 
ON public.subscription_packages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage packages" 
ON public.subscription_packages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for user subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on packages
CREATE TRIGGER update_subscription_packages_updated_at
BEFORE UPDATE ON public.subscription_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Special packages (Silver, Gold, Premium, Platinum)
INSERT INTO public.subscription_packages (name, slug, tier, price, duration_days, features, is_popular, display_order) VALUES
('Silver', 'silver', 'special', 29.99, 7, ARRAY['7 days access', 'Daily special tips', 'Email support', 'Basic analytics'], false, 1),
('Gold', 'gold', 'special', 79.99, 30, ARRAY['30 days access', 'All Silver features', 'Priority support', 'Advanced analytics', 'Telegram channel'], true, 2),
('Premium', 'premium', 'special', 199.99, 90, ARRAY['90 days access', 'All Gold features', 'VIP Telegram group', 'Personal advisor', 'Exclusive high-odds tips'], false, 3),
('Platinum', 'platinum', 'special', 499.99, 365, ARRAY['365 days access', 'All Premium features', '1-on-1 consultations', 'Custom betting strategies', 'Priority insider tips', 'Money-back guarantee'], false, 4);

-- Seed VIP packages
INSERT INTO public.subscription_packages (name, slug, tier, price, duration_days, features, is_popular, display_order) VALUES
('VIP Weekly', 'vip-weekly', 'vip', 15.00, 7, ARRAY['7 days VIP access', 'Daily VIP predictions', '80%+ accuracy rate', 'Email notifications'], false, 1),
('VIP Monthly', 'vip-monthly', 'vip', 49.00, 30, ARRAY['30 days VIP access', 'All weekly features', 'Priority support', 'VIP community access', 'Betting guides'], true, 2),
('VIP Quarterly', 'vip-quarterly', 'vip', 119.00, 90, ARRAY['90 days VIP access', 'All monthly features', 'Exclusive picks', 'Advanced statistics'], false, 3);