import Header from "@/components/Header";
import { Star, Trophy, Music, Users, Disc3 } from "lucide-react";

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

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
        {/* Profile header */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0">
              LM
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">Lucas Mendes</h1>
              <p className="text-sm text-muted-foreground mb-3">@lucasmendes · Entrou em Jan 2024</p>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-foreground">47</span> <span className="text-muted-foreground">avaliações</span></div>
                <div><span className="font-bold text-foreground">182</span> <span className="text-muted-foreground">seguidores</span></div>
                <div><span className="font-bold text-foreground">94</span> <span className="text-muted-foreground">seguindo</span></div>
              </div>
            </div>
          </div>

          {/* Musical match badge (shown on other's profiles) */}
          <div className="mt-4 bg-primary/10 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">78% Match Musical</p>
              <p className="text-xs text-muted-foreground">Vocês compartilham gostos em Indie, Rock Alternativo e Eletrônica</p>
            </div>
          </div>
        </div>

        {/* Favorite artists */}
        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Disc3 className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">Artistas de Identificação</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favoriteArtists.map((a) => (
              <div key={a.name} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] text-muted-foreground text-center w-16 truncate">{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz achievements */}
        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">Conquistas do Quiz</h2>
          </div>
          <div className="space-y-3">
            {quizAchievements.map((q) => (
              <div key={q.artist} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                <span className="text-xl">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{q.artist}</p>
                  <p className="text-xs text-muted-foreground">{q.tier} · {q.accuracy}% de acerto</p>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${q.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">Últimas Avaliações</h2>
          </div>
          <div className="space-y-3">
            {recentReviews.map((r) => (
              <div key={r.album} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={r.imageUrl} alt={r.album} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">{r.album}</p>
                  <p className="text-xs text-muted-foreground">{r.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">{r.score.toFixed(1)}</span>
                  <Star className="w-3 h-3 text-accent fill-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
