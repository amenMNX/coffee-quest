CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TABLE public.cafes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  hours text,
  photo_path text,
  category text NOT NULL DEFAULT 'Café',
  coffee_types text[] NOT NULL DEFAULT '{}',
  atmosphere text[] NOT NULL DEFAULT '{}',
  amenities text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cafes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafes TO authenticated;
GRANT ALL ON public.cafes TO service_role;
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cafes" ON public.cafes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert cafes" ON public.cafes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update cafes" ON public.cafes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cafes" ON public.cafes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view cafe photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'cafe-photos');
CREATE POLICY "Admins upload cafe photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cafe-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cafe photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cafe-photos' AND public.has_role(auth.uid(), 'admin'));