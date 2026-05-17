import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import RankingSidebar from "@/components/RankingSidebar";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CRITERIA } from "@/lib/criteria";

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

type FeedMode = "foryou" | "following";
const LIMIT = 10;

const Index = () => {
  const { user } = useAuth();
  const [feedMode, setFeedMode] = useState<FeedMode>("foryou");
  const [reviews, setReviews] = useState<any[]>([]);
  const [social, setSocial] = useState<Record<string, { likes: number; liked: boolean; comments: number }>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [noFollows, setNoFollows] = useState(false);

  const fetchSocial = useCallback(async (ids: string[], me: string | undefined) => {
    if (!ids.length) return {};
    const [{ data: likes }, { data: comms }] = await Promise.all([
      supabase.from("rating_likes").select("rating_id, user_id").in("rating_id", ids),
      supabase.from("rating_comments").select("rating_id").in("rating_id", ids),
    ]);
    const map: Record<string, { likes: number; liked: boolean; comments: number }> = {};
    ids.forEach((id) => (map[id] = { likes: 0, liked: false, comments: 0 }));
    (likes ?? []).forEach((l: any) => {
      map[l.rating_id].likes += 1;
      if (me && l.user_id === me) map[l.rating_id].liked = true;
    });
    (comms ?? []).forEach((c: any) => (map[c.rating_id].comments += 1));
    return map;
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, mode: FeedMode, append: boolean) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const { data: authData } = await supabase.auth.getUser();
      const me = authData.user?.id;

      let followingIds: string[] = [];
      if (mode === "following") {
        if (!me) {
          setNoFollows(true);
          setLoading(false);
          setLoadingMore(false);
          return;
        }
        const { data: followData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", me);
        followingIds = (followData ?? []).map((f: any) => f.following_id);
        if (!followingIds.length) {
          setNoFollows(true);
          if (!append) setReviews([]);
          setLoading(false);
          setLoadingMore(false);
          return;
        }
        setNoFollows(false);
      }

      let query = supabase
        .from("ratings")
        .select(`
          id, weighted_score, review_text, created_at,
          lyrics, personal_impact, musical_richness, authenticity, production,
          track_dynamics, mix_master, historical_weight, branding_storytelling,
          musicianship, bangers, emotion, creativity,
          albums(id, title, artist, cover_url),
          profiles(id, display_name, username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range(pageNum * LIMIT, pageNum * LIMIT + LIMIT - 1);

      if (mode === "following") {
        query = query.in("user_id", followingIds);
      }

      const { data } = await query;
      const list = data ?? [];

      if (append) {
        setReviews((prev) => [...prev, ...list]);
      } else {
        setReviews(list);
      }
      setHasMore(list.length === LIMIT);

      const newSocial = await fetchSocial(list.map((r: any) => r.id), me);
      setSocial((prev) => (append ? { ...prev, ...newSocial } : newSocial));

      setLoading(false);
      setLoadingMore(false);
    },
    [fetchSocial]
  );

  useEffect(() => {
    setPage(0);
    setReviews([]);
    setNoFollows(false);
    setHasMore(true);
    fetchPage(0, feedMode, false);
  }, [feedMode, fetchPage]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, feedMode, true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 flex gap-8">
        <section className="flex-1 min-w-0">
          {/* Feed header */}
          <div className="flex items-center justify-between mb-6">
            <motion.h1
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="font-bold text-xl md:text-2xl text-foreground"
            >
              Últimas <span className="text-gradient">Avaliações</span>
            </motion.h1>

            {/* Feed toggle */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex bg-muted/40 rounded-lg p-0.5 border border-border/40"
            >
              {(["foryou", "following"] as FeedMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setFeedMode(m)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    feedMode === m
                      ? "bg-card text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "foryou" ? "Para você" : "Seguindo"}
                </button>
              ))}
            </motion.div>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : noFollows ? (
            <div className="bg-card border border-border/40 rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {!user
                  ? "Entre para ver avaliações de quem você segue."
                  : "Você ainda não segue ninguém. Explore perfis para seguir."}
              </p>
              {!user ? (
                <Link to="/auth" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
                  Entrar →
                </Link>
              ) : (
                <Link to="/rankings" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
                  Explorar álbuns →
                </Link>
              )}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Nenhuma avaliação ainda.</p>
              <Link to="/rate" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
                Publicar a primeira →
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {reviews.map((r, i) => {
                  const [from, to] = gradients[i % gradients.length];
                  const userName = r.profiles?.display_name ?? "Usuário";
                  const username = r.profiles?.username ?? "";
                  const s = social[r.id] ?? { likes: 0, liked: false, comments: 0 };
                  return (
                    <ReviewCard
                      key={r.id}
                      index={i % LIMIT}
                      ratingId={r.id}
                      authorId={r.profiles?.id ?? ""}
                      authorUsername={username}
                      userName={userName}
                      userInitials={initials(userName)}
                      avatarUrl={r.profiles?.avatar_url}
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
                        score: Number(r[c.key] ?? 0),
                        weight: c.weight,
                      }))}
                    />
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-200 disabled:opacity-50"
                  >
                    {loadingMore ? "Carregando..." : "Carregar mais"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <RankingSidebar />
      </main>
    </div>
  );
};

export default Index;
