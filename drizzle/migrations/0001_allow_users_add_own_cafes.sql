ALTER TABLE public.cafes ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY "Admins insert cafes" ON public.cafes;
DROP POLICY "Admins update cafes" ON public.cafes;
DROP POLICY "Admins delete cafes" ON public.cafes;

CREATE POLICY "Signed-in users add own cafes"
ON public.cafes FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners and admins update cafes"
ON public.cafes FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins delete cafes"
ON public.cafes FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));