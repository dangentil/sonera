import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowLeft, Disc3 } from "lucide-react";
import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
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

interface Album {
  id: string;
  title: string;
  artist: string;
  release_year: number | null;
  genre: string | null;
  cover_url: string | null;
}

interface Rating {
  id: string;
  user_id: string;
  weighted_score: number;
  review_text: string | null;
  created_at: string;
  lyrics: number; personal_impact: number; musical_richness: number;
  authenticity: number; production: number; track_dynamics: number;
  mix_master: number; historical_weight: number; branding_storytelling: number;
  musicianship: number; bangers: number; emotion: number; creativity: number;
  profiles: { id: string; display_name: string | null; username: string | null } | null;
}

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [social, setSocial] = useState<Record<string, { likes: number; liked: boolean; comments: number }>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: albumData }, { data: ratingsData }] = await Promise.all([
        supabase.from("albums").select("id, title, artist, release_year, genre, cover_url").eq("id", id).maybeSingle(),
        supabase.from("ratings").select(`
          id, user_id, weighted_score, review_text, created_at,
          lyrics, personal_impact, musical_richness, authenticity, production,
          track_dynamics, mix_master, historical_weight, branding_storytelling,
          musicianship, bangers, emotion, creativity,
          profiles(id, display_name, username)
        `).eq("album_id", id).order("created_at", { ascending: false }),
      ]);

      if (!albumData) { setNotFound(true); setLoading(false); return; }
      setAlbum(albumData as Album);

      const list = (ratingsData ?? []) as Rating[];
      setRatings(list);

      const ratingIds = list.map((r) => r.id);
      if (ratingIds.length) {
        const [{ data: likes }, { data: comms }] = await Promise.all([
          supabase.from("rating_likes").select("rating_id, user_id").in("rating_id", ratingIds),
          supabase.from("rating_comments").select("rating_id").in("rating_id", ratingIds),
        ]);
        const { data: u } = await supabase.auth.getUser();
        const me = u.user?.id;
        const map: Record<string, { likes: number; liked: boolean; comments: number }> = {};
        ratingIds.forEach((rid) => (map[rid] = { likes: 0, liked: false, comments: 0 }));
        (likes ?? []).forEach((l: any) => {
          map[l.rating_id].likes += 1;
          if (me && l.user_id === me) map[l.rating_id].liked = true;
        });
        (comms ?? []).forEach((c: any) => (map[c.rating_id].comments += 1));
        setSocial(map);
      }
      setLoading(false);
    })();
  }, [id]);

  const avgScore = useMemo(() => {
    if (!ratings.length) return null;
    return ratings.reduce((s, r) => s + Number(r.weighted_score), 0) / ratings.length;
  }, [ratings]);

  const criteriaAvg = useMemo(() => {
    if (!ratings.length) return [];
    return CRITERIA.map((c) => {
      const avg = ratings.reduce((s, r) => s + Number((r as any)[c.key] ?? 0), 0) / ratings.length;
      return { ...c, avg };
    }).sort((a, b) => b.avg - a.avg);
  }, [ratings]);

  if (loading) return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Skeleton className="w-full md:w-56 aspect-square rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-24 mt-4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <Skeleton key={n} className="h-32 w-full rounded-2xl" />)}
        </div>
      </main>
    </div>
  );

  if (notFound || !album) return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-20 text-center">
        <Disc3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Álbum não encontrado.</p>
        <Link to="/rankings" className="text-primary text-sm hover:underline">← Voltar para Rankings</Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        {/* Back */}
        <Link to="/rankings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Rankings
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8"
        >
          <div className="w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-muted shadow-2xl shadow-black/40 shrink-0 self-start">
            {album.cover_url
              ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-16 h-16 text-muted-foreground/30" /></div>
            }
          </div>

          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-center gap-2 mb-2">
              {album.genre && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-md uppercase tracking-wider">
                  {album.genre}
                </span>
              )}
              {album.release_year && (
                <span className="text-[11px] text-muted-foreground">{album.release_year}</span>
              )}
            </div>
            <h1 className="font-bold text-2xl md:text-3xl text-foreground leading-tight mb-1">{album.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base mb-5">{album.artist}</p>

            {avgScore !== null ? (
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-gradient font-bold text-4xl md:text-5xl leading-none">{avgScore.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">/10</span>
                <Star className="w-5 h-5 text-accent fill-accent ml-0.5" />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-2">Nenhuma avaliação ainda.</p>
            )}

            <p className="text-[11px] text-muted-foreground">
              {ratings.length} {ratings.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        </motion.div>

        {/* Criteria breakdown */}
        {criteriaAvg.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card border border-border/40 rounded-xl p-5 mb-7"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Breakdown por Critério</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {criteriaAvg.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-muted-foreground">{c.name}</span>
                    <span className="text-[11px] font-semibold text-foreground">{c.avg.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.avg / 10) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews */}
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Avaliações{ratings.length > 0 && <span className="text-muted-foreground font-normal ml-1">({ratings.length})</span>}
        </h2>

        {ratings.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Nenhuma avaliação para este álbum ainda.</p>
            <Link to="/rate" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
              Seja o primeiro a avaliar →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {ratings.map((r, i) => {
              const [from, to] = gradients[i % gradients.length];
              const userName = r.profiles?.display_name ?? "Usuário";
              const username = r.profiles?.username ?? "";
              const s = social[r.id] ?? { likes: 0, liked: false, comments: 0 };
              return (
                <ReviewCard
                  key={r.id}
                  index={i}
                  ratingId={r.id}
                  authorId={r.profiles?.id ?? ""}
                  authorUsername={username}
                  userName={userName}
                  userInitials={initials(userName)}
                  gradientFrom={from}
                  gradientTo={to}
                  albumName={album.title}
                  artistName={album.artist}
                  albumId={album.id}
                  rating={Number(r.weighted_score)}
                  reviewText={r.review_text ?? ""}
                  initialLikes={s.likes}
                  initialLiked={s.liked}
                  initialComments={s.comments}
                  timeAgo={timeAgo(r.created_at)}
                  imageUrl={album.cover_url ?? "/placeholder.svg"}
                  criteria={CRITERIA.map((c) => ({
                    name: c.name,
                    score: Number((r as any)[c.key] ?? 0),
                    weight: c.weight,
                  }))}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlbumDetail;
