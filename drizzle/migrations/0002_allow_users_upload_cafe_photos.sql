DROP POLICY "Admins upload cafe photos" ON storage.objects;
DROP POLICY "Admins delete cafe photos" ON storage.objects;

CREATE POLICY "Signed-in users upload cafe photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cafe-photos');

CREATE POLICY "Signed-in users delete own cafe photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cafe-photos' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role)));