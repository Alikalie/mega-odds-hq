
-- Create upgrade_requests table for tracking user upgrade/subscription requests
CREATE TABLE public.upgrade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  user_country TEXT,
  current_tier TEXT NOT NULL DEFAULT 'free',
  requested_tier TEXT NOT NULL,
  requested_package_id UUID REFERENCES public.subscription_packages(id),
  requested_package_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_proof_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own upgrade requests
CREATE POLICY "Users can create upgrade requests"
  ON public.upgrade_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own upgrade requests
CREATE POLICY "Users can view own upgrade requests"
  ON public.upgrade_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all upgrade requests
CREATE POLICY "Admins can manage all upgrade requests"
  ON public.upgrade_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Users can upload payment proofs
CREATE POLICY "Users can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own payment proofs
CREATE POLICY "Users can view own payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for upgrade_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.upgrade_requests;

-- Trigger for updated_at
CREATE TRIGGER update_upgrade_requests_updated_at
  BEFORE UPDATE ON public.upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
