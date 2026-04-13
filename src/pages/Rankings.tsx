import { useState } from "react";
import Header from "@/components/Header";
import { Trophy, Star, ChevronDown } from "lucide-react";

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
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><Trophy className="w-4 h-4 text-accent" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>;
  return <span className="w-8 text-center text-sm text-muted-foreground font-semibold">{rank}</span>;
};

const Rankings = () => {
  const [activeGenre, setActiveGenre] = useState("Geral");
  const [activePeriod, setActivePeriod] = useState("Todos");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
        <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-1">
          <span className="text-gradient">Rankings</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-6">Os álbuns mais bem avaliados pela comunidade.</p>

        {/* Genre filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveGenre(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeGenre === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Period filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                activePeriod === p
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Rankings list */}
        <div className="space-y-2">
          {mockRankings.map((r) => (
            <div
              key={r.rank}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors flex items-center gap-4 cursor-pointer group"
            >
              <RankBadge rank={r.rank} />
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={r.imageUrl} alt={r.album} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">{r.album}</p>
                <p className="text-xs text-muted-foreground truncate">{r.artist} · {r.genre} · {r.year}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">{r.score.toFixed(2)}</span>
                  <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                </div>
                <p className="text-[10px] text-muted-foreground">{r.reviews} reviews</p>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full py-3 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-1">
          Carregar mais <ChevronDown className="w-4 h-4" />
        </button>
      </main>
    </div>
  );
};

export default Rankings;
