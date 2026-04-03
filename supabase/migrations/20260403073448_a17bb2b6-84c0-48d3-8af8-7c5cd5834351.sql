DROP POLICY IF EXISTS "Approved users can view active booking codes" ON public.booking_codes;
CREATE POLICY "Authenticated users can view active booking codes"
ON public.booking_codes
FOR SELECT
TO authenticated
USING (is_active = true);