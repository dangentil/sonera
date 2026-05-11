
-- Add favorite_artists to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_artists text[] NOT NULL DEFAULT '{}';

-- FOLLOWS
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows readable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow as themselves" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow themselves" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);

-- RATING LIKES
CREATE TABLE public.rating_likes (
  rating_id uuid NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (rating_id, user_id)
);
ALTER TABLE public.rating_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes readable by everyone" ON public.rating_likes FOR SELECT USING (true);
CREATE POLICY "User can like as self" ON public.rating_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can unlike as self" ON public.rating_likes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_rating_likes_rating ON public.rating_likes(rating_id);

-- RATING COMMENTS
CREATE TABLE public.rating_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id uuid NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rating_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments readable by everyone" ON public.rating_comments FOR SELECT USING (true);
CREATE POLICY "User can comment as self" ON public.rating_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own comment" ON public.rating_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own comment" ON public.rating_comments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_rating_comments_rating ON public.rating_comments(rating_id);
CREATE TRIGGER trg_rating_comments_updated BEFORE UPDATE ON public.rating_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NOTIFICATIONS
CREATE TYPE public.notification_type AS ENUM ('follow', 'like', 'comment');
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  rating_id uuid,
  comment_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can view notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can update notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- TRIGGERS to create notifications
CREATE OR REPLACE FUNCTION public.notify_on_follow() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

CREATE OR REPLACE FUNCTION public.notify_on_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid;
BEGIN
  SELECT user_id INTO owner FROM public.ratings WHERE id = NEW.rating_id;
  IF owner IS NOT NULL AND owner <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, rating_id)
    VALUES (owner, NEW.user_id, 'like', NEW.rating_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_like AFTER INSERT ON public.rating_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

CREATE OR REPLACE FUNCTION public.notify_on_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid;
BEGIN
  SELECT user_id INTO owner FROM public.ratings WHERE id = NEW.rating_id;
  IF owner IS NOT NULL AND owner <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, rating_id, comment_id)
    VALUES (owner, NEW.user_id, 'comment', NEW.rating_id, NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.rating_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
