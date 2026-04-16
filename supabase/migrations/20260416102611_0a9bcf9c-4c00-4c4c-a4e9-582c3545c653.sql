
CREATE TABLE public.prediction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prediction_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage prediction types"
ON public.prediction_types
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view active prediction types"
ON public.prediction_types
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE TRIGGER update_prediction_types_updated_at
BEFORE UPDATE ON public.prediction_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
