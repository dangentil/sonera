
-- Visibility on ratings
CREATE TYPE public.rating_visibility AS ENUM ('public', 'groups');
ALTER TABLE public.ratings ADD COLUMN visibility public.rating_visibility NOT NULL DEFAULT 'public';

-- Groups
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.group_member_status AS ENUM ('pending', 'approved');
CREATE TYPE public.group_member_role AS ENUM ('admin', 'member');

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status public.group_member_status NOT NULL DEFAULT 'pending',
  role public.group_member_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rating_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rating_id, group_id)
);
ALTER TABLE public.rating_groups ENABLE ROW LEVEL SECURITY;

-- Helper functions (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id AND status = 'approved' AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_rating(_rating_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ratings r
    WHERE r.id = _rating_id AND (
      r.visibility = 'public'
      OR r.user_id = _user_id
      OR EXISTS (
        SELECT 1 FROM public.rating_groups rg
        JOIN public.group_members gm ON gm.group_id = rg.group_id
        WHERE rg.rating_id = r.id AND gm.user_id = _user_id AND gm.status = 'approved'
      )
    )
  )
$$;

-- Trigger: creator becomes admin member
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, status, role)
  VALUES (NEW.id, NEW.created_by, 'approved', 'admin');
  RETURN NEW;
END $$;
CREATE TRIGGER on_group_created AFTER INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.handle_new_group();

CREATE TRIGGER set_groups_updated_at BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_group_members_updated_at BEFORE UPDATE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Replace ratings SELECT policy to honor visibility
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;
CREATE POLICY "Ratings visibility" ON public.ratings FOR SELECT USING (
  visibility = 'public'
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.rating_groups rg
    WHERE rg.rating_id = ratings.id
      AND public.is_group_member(rg.group_id, auth.uid())
  )
);

-- Groups policies (listed, so SELECT public)
CREATE POLICY "Groups are listed publicly" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group admins can update group" ON public.groups
  FOR UPDATE USING (public.is_group_admin(id, auth.uid()));
CREATE POLICY "Group admins can delete group" ON public.groups
  FOR DELETE USING (public.is_group_admin(id, auth.uid()));

-- Group members policies
CREATE POLICY "Members and admins can view memberships" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id, auth.uid())
    OR public.is_group_admin(group_id, auth.uid())
  );
CREATE POLICY "Users can request to join" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND status = 'pending' AND role = 'member'
  );
CREATE POLICY "Admins can update memberships" ON public.group_members
  FOR UPDATE USING (public.is_group_admin(group_id, auth.uid()));
CREATE POLICY "Admins can remove members or self-leave" ON public.group_members
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_group_admin(group_id, auth.uid())
  );

-- Rating groups policies
CREATE POLICY "View rating-group links if can view rating" ON public.rating_groups
  FOR SELECT USING (public.can_view_rating(rating_id, auth.uid()));
CREATE POLICY "Owner can link own rating to groups they belong to" ON public.rating_groups
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.ratings r WHERE r.id = rating_id AND r.user_id = auth.uid())
    AND public.is_group_member(group_id, auth.uid())
  );
CREATE POLICY "Owner can unlink own rating" ON public.rating_groups
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.ratings r WHERE r.id = rating_id AND r.user_id = auth.uid())
  );

CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_rating_groups_rating ON public.rating_groups(rating_id);
CREATE INDEX idx_rating_groups_group ON public.rating_groups(group_id);
