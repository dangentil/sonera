import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Music, BarChart3, Disc3 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CRITERIA } from "@/lib/criteria";
import FollowButton from "./FollowButton";
import EditProfileDialog from "./EditProfileDialog";
import ReviewCard from "./ReviewCard";

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
  review_text: string | null;
  created_at: string;
  lyrics: number;
  personal_impact: number;
  musical_richness: number;
  authenticity: number;
  production: number;
  track_dynamics: number;
  mix_master: number;
  historical_weight: number;
  branding_storytelling: number;
  musicianship: number;
  bangers: number;
  emotion: number;
  creativity: number;
  albums: { id: string; title: string; artist: string; cover_url: string | null } | null;
}

interface FollowRow {
  id: string;
  username: string;
  display_name: string;
}

interface SocialRow {
  likes: number;
  liked: boolean;
  comments: number;
}

const gradients = [
  ["#e94560", "#ff6b6b"], ["#00d2ff", "#3a7bd5"], ["#11998e", "#38ef7d"],
  ["#f7971e", "#ffd200"], ["#8e2de2", "#4a00e0"], ["#fc466b", "#3f5efb"],
];

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
};

type Tab = "ratings" | "albums" | "followers" | "following";

const ProfileView = ({ profile, onProfileUpdate }: { profile: ProfileData; onProfileUpdate?: (p: ProfileData) => void }) => {
  const { user } = useAuth();
  const isMe = user?.id === profile.id;
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [social, setSocial] = useState<Record<string, SocialRow>>({});
  const [followers, setFollowers] = useState<FollowRow[]>([]);
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [tab, setTab] = useState<Tab>("ratings");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ratings")
        .select(`
          id, weighted_score, review_text, created_at,
          lyrics, personal_impact, musical_richness, authenticity, production,
          track_dynamics, mix_master, historical_weight, branding_storytelling,
          musicianship, bangers, emotion, creativity,
          albums(id, title, artist, cover_url)
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      const list = (data as any[]) ?? [];
      setRatings(list);

      const ids = list.map((r) => r.id);
      if (ids.length) {
        const [{ data: likes }, { data: comms }] = await Promise.all([
          supabase.from("rating_likes").select("rating_id, user_id").in("rating_id", ids),
          supabase.from("rating_comments").select("rating_id").in("rating_id", ids),
        ]);
        const { data: u } = await supabase.auth.getUser();
        const me = u.user?.id;
        const map: Record<string, SocialRow> = {};
        ids.forEach((id: string) => (map[id] = { likes: 0, liked: false, comments: 0 }));
        (likes ?? []).forEach((l: any) => {
          map[l.rating_id].likes += 1;
          if (me && l.user_id === me) map[l.rating_id].liked = true;
        });
        (comms ?? []).forEach((c: any) => (map[c.rating_id].comments += 1));
        setSocial(map);
      }

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

  const avgScore = ratings.length
    ? ratings.reduce((s, r) => s + Number(r.weighted_score), 0) / ratings.length
    : null;

  const bestRated = ratings.length
    ? ratings.reduce((best, r) => (Number(r.weighted_score) > Number(best.weighted_score) ? r : best), ratings[0])
    : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "ratings", label: "Avaliações" },
    { key: "albums", label: "Álbuns" },
    { key: "followers", label: "Seguidores" },
    { key: "following", label: "Seguindo" },
  ];

  return (
    <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
      {/* Profile header */}
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

      {/* Stats */}
      {ratings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
            <BarChart3 className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xl font-bold text-foreground">{ratings.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Avaliações</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
            <Star className="w-4 h-4 text-accent fill-accent mx-auto mb-1.5" />
            <p className="text-xl font-bold text-gradient">{avgScore?.toFixed(2) ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Média</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-4 text-center overflow-hidden">
            <Disc3 className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            {bestRated?.albums ? (
              <Link to={`/album/${bestRated.albums.id}`} className="block">
                <p className="text-xs font-bold text-foreground truncate hover:text-primary transition-colors">{bestRated.albums.title}</p>
                <p className="text-[10px] text-accent font-semibold mt-0.5">{Number(bestRated.weighted_score).toFixed(2)}</p>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Melhor</p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/40">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[11px] uppercase tracking-wider border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "ratings" && (
        ratings.length === 0 ? (
          <div className="bg-card rounded-2xl p-5 border border-border/60">
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma avaliação ainda.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {ratings.map((r, i) => {
              const [from, to] = gradients[i % gradients.length];
              const s = social[r.id] ?? { likes: 0, liked: false, comments: 0 };
              return (
                <ReviewCard
                  key={r.id}
                  index={i}
                  ratingId={r.id}
                  authorId={profile.id}
                  authorUsername={profile.username}
                  userName={profile.display_name}
                  userInitials={initials(profile.display_name)}
                  gradientFrom={from}
                  gradientTo={to}
                  albumName={r.albums?.title ?? ""}
                  artistName={r.albums?.artist ?? ""}
                  albumId={r.albums?.id}
                  rating={Number(r.weighted_score)}
                  reviewText={r.review_text ?? ""}
                  initialLikes={s.likes}
                  initialLiked={s.liked}
                  initialComments={s.comments}
                  timeAgo={timeAgo(r.created_at)}
                  imageUrl={r.albums?.cover_url ?? "/placeholder.svg"}
                  criteria={CRITERIA.map((c) => ({
                    name: c.name,
                    score: Number((r as any)[c.key] ?? 0),
                    weight: c.weight,
                  }))}
                />
              );
            })}
          </div>
        )
      )}

      {tab === "albums" && (
        <div className="bg-card rounded-2xl p-5 border border-border/60">
          {ratings.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhum álbum avaliado ainda.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {ratings.map((r) => (
                r.albums && (
                  <Link
                    key={r.id}
                    to={`/album/${r.albums.id}`}
                    className="group block"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1.5 shadow-md group-hover:shadow-primary/20 transition-shadow duration-300">
                      {r.albums.cover_url ? (
                        <img
                          src={r.albums.cover_url}
                          alt={r.albums.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-foreground truncate group-hover:text-primary transition-colors">{r.albums.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{r.albums.artist}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{Number(r.weighted_score).toFixed(1)}</span>
                      <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "followers" && (
        <div className="bg-card rounded-2xl p-5 border border-border/60">
          <UserList list={followers} emptyText="Sem seguidores ainda." />
        </div>
      )}
      {tab === "following" && (
        <div className="bg-card rounded-2xl p-5 border border-border/60">
          <UserList list={following} emptyText="Não segue ninguém ainda." />
        </div>
      )}
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
