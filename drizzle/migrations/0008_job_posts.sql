CREATE TABLE public.job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text,
  job_type text,
  salary text,
  description text NOT NULL,
  requirements text,
  how_to_apply text,
  apply_link text,
  apply_email text,
  deadline date,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_posts TO authenticated;
GRANT ALL ON public.job_posts TO service_role;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active jobs" ON public.job_posts FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage jobs" ON public.job_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON public.job_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Admins upload job images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND name LIKE 'job-images/%' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete job images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND name LIKE 'job-images/%' AND public.has_role(auth.uid(), 'admin'));