-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles (separada por seguranca)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Roles viewable by self or admin"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- albums (catalogo compartilhado)
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_year INT,
  genre TEXT,
  cover_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (title, artist)
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Albums are viewable by everyone"
  ON public.albums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add albums"
  ON public.albums FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator or admin can update album"
  ON public.albums FOR UPDATE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creator or admin can delete album"
  ON public.albums FOR DELETE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  lyrics NUMERIC(3,1) NOT NULL CHECK (lyrics BETWEEN 0 AND 10),
  personal_impact NUMERIC(3,1) NOT NULL CHECK (personal_impact BETWEEN 0 AND 10),
  musical_richness NUMERIC(3,1) NOT NULL CHECK (musical_richness BETWEEN 0 AND 10),
  authenticity NUMERIC(3,1) NOT NULL CHECK (authenticity BETWEEN 0 AND 10),
  production NUMERIC(3,1) NOT NULL CHECK (production BETWEEN 0 AND 10),
  track_dynamics NUMERIC(3,1) NOT NULL CHECK (track_dynamics BETWEEN 0 AND 10),
  mix_master NUMERIC(3,1) NOT NULL CHECK (mix_master BETWEEN 0 AND 10),
  historical_weight NUMERIC(3,1) NOT NULL CHECK (historical_weight BETWEEN 0 AND 10),
  branding_storytelling NUMERIC(3,1) NOT NULL CHECK (branding_storytelling BETWEEN 0 AND 10),
  musicianship NUMERIC(3,1) NOT NULL CHECK (musicianship BETWEEN 0 AND 10),
  bangers NUMERIC(3,1) NOT NULL CHECK (bangers BETWEEN 0 AND 10),
  emotion NUMERIC(3,1) NOT NULL CHECK (emotion BETWEEN 0 AND 10),
  creativity NUMERIC(3,1) NOT NULL CHECK (creativity BETWEEN 0 AND 10),
  weighted_score NUMERIC(4,2) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id)
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings"
  ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings"
  ON public.ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings"
  ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ratings_set_updated_at BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NULLIF(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'), ''),
    'user'
  );
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, final_username, COALESCE(NEW.raw_user_meta_data->>'display_name', final_username));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_ratings_album ON public.ratings(album_id);
CREATE INDEX idx_ratings_user ON public.ratings(user_id);
CREATE INDEX idx_ratings_created ON public.ratings(created_at DESC);