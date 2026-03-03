
ALTER TABLE public.booking_codes
ADD COLUMN status text DEFAULT 'pending',
ADD COLUMN admin_comment text;
