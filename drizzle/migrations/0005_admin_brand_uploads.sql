CREATE POLICY "Super admins upload brand images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] IN ('site-logo','apk-icons') AND public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update brand images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IN ('site-logo','apk-icons') AND public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete brand images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IN ('site-logo','apk-icons') AND public.has_role(auth.uid(), 'super_admin'));