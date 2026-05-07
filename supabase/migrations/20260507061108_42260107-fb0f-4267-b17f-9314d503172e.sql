-- Add tip_date and hidden_from_history to all tip tables
ALTER TABLE public.free_tips
  ADD COLUMN IF NOT EXISTS tip_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS hidden_from_history boolean NOT NULL DEFAULT false;

ALTER TABLE public.vip_tips
  ADD COLUMN IF NOT EXISTS tip_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS hidden_from_history boolean NOT NULL DEFAULT false;

ALTER TABLE public.special_tips
  ADD COLUMN IF NOT EXISTS tip_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS hidden_from_history boolean NOT NULL DEFAULT false;

-- Backfill tip_date from existing created_at
UPDATE public.free_tips SET tip_date = created_at::date WHERE tip_date IS NULL OR tip_date = CURRENT_DATE;
UPDATE public.vip_tips SET tip_date = created_at::date WHERE tip_date IS NULL OR tip_date = CURRENT_DATE;
UPDATE public.special_tips SET tip_date = created_at::date WHERE tip_date IS NULL OR tip_date = CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_free_tips_tip_date ON public.free_tips(tip_date);
CREATE INDEX IF NOT EXISTS idx_vip_tips_tip_date ON public.vip_tips(tip_date);
CREATE INDEX IF NOT EXISTS idx_special_tips_tip_date ON public.special_tips(tip_date);