import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Music } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FollowButton from "./FollowButton";
import EditProfileDialog from "./EditProfileDialog";

export interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  favorite_artists: string[];
  created_at: string;
}

interface RatingRow {
  id: string;
  weighted_score: number;
  created_at: string;
  albums: { title: string; artist: string; cover_url: string | null } | null;
}

interface FollowRow {
  id: string;
  username: string;
  display_name: string;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

type Tab = "ratings" | "followers" | "following";

const ProfileView = ({ profile, onProfileUpdate }: { profile: ProfileData; onProfileUpdate?: (p: ProfileData) => void }) => {
  const { user } = useAuth();
  const isMe = user?.id === profile.id;
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [followers, setFollowers] = useState<FollowRow[]>([]);
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [tab, setTab] = useState<Tab>("ratings");

  useEffect(() => {
    supabase
      .from("ratings")
      .select("id, weighted_score, created_at, albums(title, artist, cover_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRatings((data as any) ?? []));

    (async () => {
      const [{ count: fCount }, { count: gCount }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
      ]);
      setCounts({ followers: fCount ?? 0, following: gCount ?? 0 });
    })();
  }, [profile.id]);

  useEffect(() => {
    if (tab === "followers") loadFollowers();
    if (tab === "following") loadFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadFollowers = async () => {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", profile.id)
      .limit(50);
    const ids = (data ?? []).map((r: any) => r.follower_id);
    if (!ids.length) return setFollowers([]);
    const { data: profs } = await supabase.from("profiles").select("id, username, display_name").in("id", ids);
    setFollowers((profs ?? []) as any);
  };

  const loadFollowing = async () => {
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", profile.id)
      .limit(50);
    const ids = (data ?? []).map((r: any) => r.following_id);
    if (!ids.length) return setFollowing([]);
    const { data: profs } = await supabase.from("profiles").select("id, username, display_name").in("id", ids);
    setFollowing((profs ?? []) as any);
  };

  const joined = new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  return (
    <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 mb-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl md:text-2xl font-bold text-primary-foreground shrink-0">
            {initials(profile.display_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{profile.display_name}</h1>
                <p className="text-xs text-muted-foreground">@{profile.username} · Entrou em {joined}</p>
              </div>
              {isMe ? (
                <EditProfileDialog
                  initial={{ display_name: profile.display_name, bio: profile.bio, favorite_artists: profile.favorite_artists }}
                  onSaved={(next) =>
                    onProfileUpdate?.({ ...profile, display_name: next.display_name, bio: next.bio || null, favorite_artists: next.favorite_artists })
                  }
                />
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  onChange={(f) => setCounts((c) => ({ ...c, followers: c.followers + (f ? 1 : -1) }))}
                />
              )}
            </div>
            <div className="flex gap-5 text-xs mt-3">
              <button onClick={() => setTab("ratings")} className="hover:text-primary transition-colors">
                <span className="font-bold text-foreground">{ratings.length}</span>{" "}
                <span className="text-muted-foreground">avaliações</span>
              </button>
              <button onClick={() => setTab("followers")} className="hover:text-primary transition-colors">
                <span className="font-bold text-foreground">{counts.followers}</span>{" "}
                <span className="text-muted-foreground">seguidores</span>
              </button>
              <button onClick={() => setTab("following")} className="hover:text-primary transition-colors">
                <span className="font-bold text-foreground">{counts.following}</span>{" "}
                <span className="text-muted-foreground">seguindo</span>
              </button>
            </div>
          </div>
        </div>
        {profile.bio && <p className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>}
        {profile.favorite_artists?.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Music className="w-3 h-3 text-accent" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Artistas favoritos</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.favorite_artists.map((a) => (
                <span key={a} className="text-[11px] px-2 py-1 rounded-full border border-accent/30 bg-accent/5 text-foreground">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/40">
        {(["ratings", "followers", "following"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[11px] uppercase tracking-wider border-b-2 transition-colors ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "ratings" ? "Avaliações" : t === "followers" ? "Seguidores" : "Seguindo"}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border/60">
        {tab === "ratings" && (
          ratings.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma avaliação ainda.</p>
          ) : (
            <div className="space-y-2">
              {ratings.map((r) => (
                <div key={r.id} className="flex items-center gap-3 group hover:bg-muted/20 rounded-lg p-2 -mx-2 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    {r.albums?.cover_url && <img src={r.albums.cover_url} alt={r.albums.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.albums?.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.albums?.artist}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-primary">{Number(r.weighted_score).toFixed(2)}</span>
                    <Star className="w-3 h-3 text-accent fill-accent" />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {tab === "followers" && <UserList list={followers} emptyText="Sem seguidores ainda." />}
        {tab === "following" && <UserList list={following} emptyText="Não segue ninguém ainda." />}
      </div>
    </main>
  );
};

const UserList = ({ list, emptyText }: { list: FollowRow[]; emptyText: string }) => {
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{emptyText}</p>;
  return (
    <div className="space-y-2">
      {list.map((u) => (
        <Link
          key={u.id}
          to={`/u/${u.username}`}
          className="flex items-center gap-3 hover:bg-muted/20 rounded-lg p-2 -mx-2 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0">
            {initials(u.display_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{u.display_name}</p>
            <p className="text-[10px] text-muted-foreground">@{u.username}</p>
          </div>
          <FollowButton targetUserId={u.id} />
        </Link>
      ))}
    </div>
  );
};

export default ProfileView;