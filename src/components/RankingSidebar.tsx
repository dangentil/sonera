import { Trophy, TrendingUp, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const rankings = [
  { rank: 1, album: "Cosmic Echoes", artist: "Nebula Bloom", score: 4.9 },
  { rank: 2, album: "Neon Dreams", artist: "Synthwave Riders", score: 4.8 },
  { rank: 3, album: "Lunar Bloom", artist: "Midnight Flora", score: 4.7 },
  { rank: 4, album: "Electric Soul", artist: "Volt Circuit", score: 4.6 },
  { rank: 5, album: "Velvet Horizon", artist: "Dream Weavers", score: 4.5 },
];

const genres = ["Indie Rock", "Eletrônica", "Pop", "Hip-Hop", "Jazz", "R&B"];

const RankingSidebar = () => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-72 shrink-0 hidden lg:flex flex-col gap-5 sticky top-[4.5rem]"
    >
      {/* Top Charts */}
      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.12em]">Top Charts</h3>
        </div>
        <div className="space-y-2.5">
          {rankings.map((r) => (
            <div key={r.rank} className="flex items-center gap-3 group cursor-pointer">
              <span className={`text-[11px] font-bold w-4 text-center ${r.rank <= 3 ? "text-accent" : "text-muted-foreground"}`}>
                {r.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                  {r.album}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{r.artist}</p>
              </div>
              <span className="text-[11px] font-semibold text-primary">{r.score}</span>
            </div>
          ))}
        </div>
        <Link
          to="/rankings"
          className="mt-4 block w-full text-center text-[10px] text-primary font-medium uppercase tracking-wider hover:underline"
        >
          Ver ranking completo →
        </Link>
      </div>

      {/* Trending */}
      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.12em]">Em Alta</h3>
        </div>
        <div className="space-y-2">
          <div className="bg-muted/30 rounded-xl px-3.5 py-2.5">
            <p className="text-xs font-medium text-foreground">Álbum do Mês</p>
            <p className="text-[10px] text-muted-foreground">Starlight Serenade — 215 reviews</p>
          </div>
          <div className="bg-muted/30 rounded-xl px-3.5 py-2.5">
            <p className="text-xs font-medium text-foreground">Artista da Semana</p>
            <p className="text-[10px] text-muted-foreground">The Celestial Drifters</p>
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.12em]">Gêneros</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <span
              key={g}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all duration-200"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

export default RankingSidebar;
