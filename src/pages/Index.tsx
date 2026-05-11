import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import RankingSidebar from "@/components/RankingSidebar";
import { motion } from "framer-motion";
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

const Index = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ratings")
        .select(`
          id, weighted_score, review_text, created_at,
          lyrics, personal_impact, musical_richness, authenticity, production,
          track_dynamics, mix_master, historical_weight, branding_storytelling,
          musicianship, bangers, emotion, creativity,
          albums(title, artist, cover_url),
          profiles(display_name, username)
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      setReviews(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 flex gap-8">
        <section className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="font-bold text-xl md:text-2xl text-foreground mb-6"
          >
            Últimas <span className="text-gradient">Avaliações</span>
          </motion.h1>

          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Nenhuma avaliação ainda.</p>
              <Link to="/rate" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
                Publicar a primeira →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((r, i) => {
                const [from, to] = gradients[i % gradients.length];
                const userName = r.profiles?.display_name ?? "Usuário";
                return (
                  <ReviewCard
                    key={r.id}
                    index={i}
                    userName={userName}
                    userInitials={initials(userName)}
                    gradientFrom={from}
                    gradientTo={to}
                    albumName={r.albums?.title ?? ""}
                    artistName={r.albums?.artist ?? ""}
                    rating={Number(r.weighted_score)}
                    reviewText={r.review_text ?? ""}
                    likes={0}
                    comments={0}
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
          )}
        </section>

        <RankingSidebar />
      </main>
    </div>
  );
};

export default Index;
