import { useState } from "react";
import Header from "@/components/Header";
import { Trophy, Star, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const filters = ["Geral", "Rock", "Pop", "Hip-Hop", "Eletrônica", "Jazz", "R&B", "Folk", "Metal", "Indie"];
const periods = ["Todos", "2020s", "2010s", "2000s", "90s", "80s", "Clássicos"];

const mockRankings = [
  { rank: 1, album: "Cosmic Echoes", artist: "Nebula Bloom", genre: "Indie", year: "2023", score: 4.92, reviews: 1847, imageUrl: "https://picsum.photos/80/80?random=20" },
  { rank: 2, album: "Neon Dreams", artist: "Synthwave Riders", genre: "Eletrônica", year: "2022", score: 4.87, reviews: 1523, imageUrl: "https://picsum.photos/80/80?random=21" },
  { rank: 3, album: "Lunar Bloom", artist: "Midnight Flora", genre: "Pop", year: "2024", score: 4.81, reviews: 1205, imageUrl: "https://picsum.photos/80/80?random=22" },
  { rank: 4, album: "Electric Soul", artist: "Volt Circuit", genre: "R&B", year: "2021", score: 4.76, reviews: 998, imageUrl: "https://picsum.photos/80/80?random=23" },
  { rank: 5, album: "Velvet Horizon", artist: "Dream Weavers", genre: "Rock", year: "2023", score: 4.71, reviews: 876, imageUrl: "https://picsum.photos/80/80?random=24" },
  { rank: 6, album: "Digital Alchemy", artist: "Circuit Weaver", genre: "Eletrônica", year: "2020", score: 4.68, reviews: 745, imageUrl: "https://picsum.photos/80/80?random=25" },
  { rank: 7, album: "Starlight Serenade", artist: "The Celestial Drifters", genre: "Indie", year: "2024", score: 4.63, reviews: 623, imageUrl: "https://picsum.photos/80/80?random=26" },
  { rank: 8, album: "Quantum Leap", artist: "AstroFrequencies", genre: "Jazz", year: "2022", score: 4.59, reviews: 512, imageUrl: "https://picsum.photos/80/80?random=27" },
  { rank: 9, album: "Prism Refractions", artist: "Light Spectrum", genre: "Pop", year: "2021", score: 4.55, reviews: 489, imageUrl: "https://picsum.photos/80/80?random=28" },
  { rank: 10, album: "Abyss Walker", artist: "Deep Current", genre: "Metal", year: "2023", score: 4.50, reviews: 401, imageUrl: "https://picsum.photos/80/80?random=29" },
];

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center"><Trophy className="w-4 h-4 text-accent" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground/70">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/70">3</div>;
  return <span className="w-8 text-center text-xs text-muted-foreground font-medium">{rank}</span>;
};

const Rankings = () => {
  const [activeGenre, setActiveGenre] = useState("Geral");
  const [activePeriod, setActivePeriod] = useState("Todos");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold text-xl md:text-2xl text-foreground mb-1">
            <span className="text-gradient">Rankings</span>
          </h1>
          <p className="text-muted-foreground text-xs mb-5">Os álbuns mais bem avaliados pela comunidade.</p>
        </motion.div>

        {/* Genre filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveGenre(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
                activeGenre === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Period filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-200 ${
                activePeriod === p
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Rankings list */}
        <div className="space-y-1.5">
          {mockRankings.map((r, i) => (
            <motion.div
              key={r.rank}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-card rounded-xl p-3.5 border border-border/40 hover:border-primary/20 transition-all duration-200 flex items-center gap-3.5 cursor-pointer group"
            >
              <RankBadge rank={r.rank} />
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0 shadow-sm">
                <img src={r.imageUrl} alt={r.album} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">{r.album}</p>
                <p className="text-[11px] text-muted-foreground truncate">{r.artist} · {r.genre} · {r.year}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">{r.score.toFixed(2)}</span>
                  <Star className="w-3 h-3 text-accent fill-accent" />
                </div>
                <p className="text-[10px] text-muted-foreground">{r.reviews.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="mt-5 w-full py-2.5 rounded-xl bg-card border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-200 flex items-center justify-center gap-1">
          Carregar mais <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </main>
    </div>
  );
};

export default Rankings;
