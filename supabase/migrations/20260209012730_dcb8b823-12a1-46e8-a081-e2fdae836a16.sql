-- Create notifications table for admin-to-user messages
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark as read)"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create payment_methods table for admin-managed payment options
CREATE TABLE public.payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text,
  icon text DEFAULT 'CreditCard',
  country_code text DEFAULT 'SL',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage payment methods"
ON public.payment_methods
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create support_contacts table for admin-managed support info
CREATE TABLE public.support_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  value text NOT NULL,
  label text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active support contacts"
ON public.support_contacts
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage support contacts"
ON public.support_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insert default payment methods for Sierra Leone
INSERT INTO public.payment_methods (name, account_number, account_name, icon, country_code, display_order)
VALUES 
  ('Orange Money', '079926121', 'Mega Odds', 'Smartphone', 'SL', 1),
  ('Afrimoney', '+232 77 864684', 'Mega Odds', 'Wallet', 'SL', 2),
  ('Qcell Money', 'Contact Support', 'Mega Odds', 'Phone', 'SL', 3),
  ('Mastercard', 'Contact Support', 'Mega Odds', 'CreditCard', 'SL', 4);

-- Insert default support contacts
INSERT INTO public.support_contacts (type, value, label, display_order)
VALUES 
  ('whatsapp', '+232 79 926121', 'WhatsApp Support', 1),
  ('email', 'support@megaodds.com', 'Email Support', 2),
  ('telegram', '@megaodds', 'Telegram', 3);

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_contacts_updated_at
BEFORE UPDATE ON public.support_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();