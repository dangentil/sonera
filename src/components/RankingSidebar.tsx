import { Trophy, TrendingUp, Filter } from "lucide-react";

const rankings = [
  { rank: 1, album: "Cosmic Echoes", artist: "Nebula Bloom", score: 4.9 },
  { rank: 2, album: "Neon Dreams", artist: "Synthwave Riders", score: 4.8 },
  { rank: 3, album: "Lunar Bloom", artist: "Midnight Flora", score: 4.7 },
  { rank: 4, album: "Electric Soul", artist: "Volt Circuit", score: 4.6 },
  { rank: 5, album: "Velvet Horizon", artist: "Dream Weavers", score: 4.5 },
];

const genres = ["Indie Rock", "Eletrônica", "Pop", "Hip-Hop", "Jazz", "R&B", "Folk", "Metal"];

const RankingSidebar = () => {
  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-6 sticky top-24">
      {/* Top Charts */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="text-accent font-bold text-base">Top Charts</h3>
        </div>
        <div className="space-y-3">
          {rankings.map((r) => (
            <div key={r.rank} className="flex items-center gap-3 group cursor-pointer">
              <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                {r.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                  {r.album}
                </p>
                <p className="text-xs text-muted-foreground truncate">{r.artist}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-primary">{r.score}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full text-center text-xs text-primary font-semibold hover:underline">
          Ver ranking completo →
        </button>
      </div>

      {/* Trending */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-primary font-bold text-base">Em Alta</h3>
        </div>
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-md px-3 py-2">
            <p className="text-sm font-semibold text-foreground">Album do Mês</p>
            <p className="text-xs text-muted-foreground">Starlight Serenade — 215 reviews</p>
          </div>
          <div className="bg-muted/50 rounded-md px-3 py-2">
            <p className="text-sm font-semibold text-foreground">Artista da Semana</p>
            <p className="text-xs text-muted-foreground">The Celestial Drifters</p>
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="text-accent font-bold text-base">Gêneros</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g}
              className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RankingSidebar;
