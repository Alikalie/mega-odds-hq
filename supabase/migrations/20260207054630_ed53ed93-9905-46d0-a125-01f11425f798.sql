-- Create tip categories table for admin to manage
CREATE TABLE public.tip_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Trophy',
  description text,
  tip_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  is_vip boolean DEFAULT false,
  is_special boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tip_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.tip_categories
FOR SELECT
USING (is_active = true);

-- Admins can manage all categories
CREATE POLICY "Admins can manage categories"
ON public.tip_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_tip_categories_updated_at
BEFORE UPDATE ON public.tip_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories matching the reference image
INSERT INTO public.tip_categories (name, slug, icon, description, display_order, is_vip) VALUES
('Today''s Safe Tips', 'todays-safe-tips', 'ShieldCheck', 'Low risk, high confidence picks', 1, false),
('Ticket of the Day', 'ticket-of-the-day', 'Ticket', 'Best accumulator of the day', 2, false),
('Football Tips', 'football-tips', 'Goal', 'Expert football predictions', 3, false),
('Over Under', 'over-under', 'TrendingUp', 'Goals over/under predictions', 4, false),
('Single Game', 'single-game', 'Target', 'High odds single match picks', 5, true),
('Daily 25+ Odds', 'daily-25-odds', 'Flame', 'High risk high reward picks', 6, true),
('Basketball Tips', 'basketball-tips', 'Circle', 'NBA and basketball picks', 7, false),
('Tennis Tips', 'tennis-tips', 'Activity', 'Tennis match predictions', 8, false),
('Bonus Tips', 'bonus-tips', 'Gift', 'Special bonus predictions', 9, true),
('All Sport Combine', 'all-sport-combine', 'Layers', 'Mixed sports accumulator', 10, false),
('History Correct Score', 'history-correct-score', 'History', 'Correct score predictions', 11, true),
('Cricket Tips', 'cricket-tips', 'Swords', 'Cricket match predictions', 12, false);