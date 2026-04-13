import Header from "@/components/Header";
import { Star, Trophy, Music, Disc3 } from "lucide-react";
import { motion } from "framer-motion";

const favoriteArtists = [
  { name: "Radiohead", imageUrl: "https://picsum.photos/60/60?random=30" },
  { name: "Kendrick Lamar", imageUrl: "https://picsum.photos/60/60?random=31" },
  { name: "Björk", imageUrl: "https://picsum.photos/60/60?random=32" },
  { name: "Frank Ocean", imageUrl: "https://picsum.photos/60/60?random=33" },
  { name: "Tame Impala", imageUrl: "https://picsum.photos/60/60?random=34" },
];

const recentReviews = [
  { album: "OK Computer", artist: "Radiohead", score: 4.9, imageUrl: "https://picsum.photos/60/60?random=40" },
  { album: "To Pimp a Butterfly", artist: "Kendrick Lamar", score: 4.85, imageUrl: "https://picsum.photos/60/60?random=41" },
  { album: "Homogenic", artist: "Björk", score: 4.7, imageUrl: "https://picsum.photos/60/60?random=42" },
];

const quizAchievements = [
  { artist: "Radiohead", tier: "Superfã", icon: "🏆", accuracy: 95 },
  { artist: "Kendrick Lamar", tier: "Expert", icon: "🥈", accuracy: 82 },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
        {/* Profile header */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl md:text-2xl font-bold text-primary-foreground shrink-0">
              LM
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-foreground">Lucas Mendes</h1>
              <p className="text-xs text-muted-foreground mb-3">@lucasmendes · Entrou em Jan 2024</p>
              <div className="flex gap-5 text-xs">
                <div><span className="font-bold text-foreground">47</span> <span className="text-muted-foreground">avaliações</span></div>
                <div><span className="font-bold text-foreground">182</span> <span className="text-muted-foreground">seguidores</span></div>
                <div><span className="font-bold text-foreground">94</span> <span className="text-muted-foreground">seguindo</span></div>
              </div>
            </div>
          </div>

          {/* Musical match badge */}
          <div className="mt-4 bg-primary/8 rounded-xl p-3 flex items-center gap-3 border border-primary/10">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">78% Match Musical</p>
              <p className="text-[10px] text-muted-foreground">Vocês compartilham gostos em Indie, Rock Alternativo e Eletrônica</p>
            </div>
          </div>
        </motion.div>

        {/* Favorite artists */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="bg-card rounded-2xl p-5 border border-border/60 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Disc3 className="w-4 h-4 text-accent" />
            <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.12em]">Artistas de Identificação</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {favoriteArtists.map((a) => (
              <div key={a.name} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer">
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-muted-foreground text-center w-14 truncate">{a.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quiz achievements */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="bg-card rounded-2xl p-5 border border-border/60 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent" />
            <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.12em]">Conquistas do Quiz</h2>
          </div>
          <div className="space-y-2">
            {quizAchievements.map((q) => (
              <div key={q.artist} className="flex items-center gap-3 bg-muted/20 rounded-xl p-3">
                <span className="text-lg">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{q.artist}</p>
                  <p className="text-[10px] text-muted-foreground">{q.tier} · {q.accuracy}%</p>
                </div>
                <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${q.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent reviews */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }} className="bg-card rounded-2xl p-5 border border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.12em]">Últimas Avaliações</h2>
          </div>
          <div className="space-y-2">
            {recentReviews.map((r) => (
              <div key={r.album} className="flex items-center gap-3 group cursor-pointer hover:bg-muted/20 rounded-lg p-2 -mx-2 transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={r.imageUrl} alt={r.album} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">{r.album}</p>
                  <p className="text-[10px] text-muted-foreground">{r.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-primary">{r.score.toFixed(1)}</span>
                  <Star className="w-3 h-3 text-accent fill-accent" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
