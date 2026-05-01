import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { Trophy, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const periods = ["Todos", "2020s", "2010s", "2000s", "90s", "80s", "Clássicos"];

interface RankRow {
  album_id: string;
  title: string;
  artist: string;
  release_year: number | null;
  genre: string | null;
  cover_url: string | null;
  avg_score: number;
  count: number;
}

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center"><Trophy className="w-4 h-4 text-accent" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground/70">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/70">3</div>;
  return <span className="w-8 text-center text-xs text-muted-foreground font-medium">{rank}</span>;
};

const inPeriod = (year: number | null, p: string) => {
  if (p === "Todos" || !year) return p === "Todos";
  if (p === "Clássicos") return year < 1980;
  if (p === "80s") return year >= 1980 && year < 1990;
  if (p === "90s") return year >= 1990 && year < 2000;
  if (p === "2000s") return year >= 2000 && year < 2010;
  if (p === "2010s") return year >= 2010 && year < 2020;
  if (p === "2020s") return year >= 2020;
  return true;
};

const Rankings = () => {
  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("Geral");
  const [activePeriod, setActivePeriod] = useState("Todos");

  useEffect(() => {
    (async () => {
      const { data: ratings } = await supabase
        .from("ratings")
        .select("album_id, weighted_score, albums(id, title, artist, release_year, genre, cover_url)");
      const map = new Map<string, RankRow>();
      (ratings ?? []).forEach((r: any) => {
        const a = r.albums;
        if (!a) return;
        const ex = map.get(r.album_id);
        const score = Number(r.weighted_score);
        if (ex) {
          ex.avg_score = (ex.avg_score * ex.count + score) / (ex.count + 1);
          ex.count += 1;
        } else {
          map.set(r.album_id, {
            album_id: r.album_id,
            title: a.title, artist: a.artist,
            release_year: a.release_year, genre: a.genre, cover_url: a.cover_url,
            avg_score: score, count: 1,
          });
        }
      });
      setRows([...map.values()].sort((x, y) => y.avg_score - x.avg_score));
      setLoading(false);
    })();
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>(["Geral"]);
    rows.forEach((r) => r.genre && set.add(r.genre));
    return [...set];
  }, [rows]);

  const filtered = rows.filter((r) =>
    (activeGenre === "Geral" || r.genre === activeGenre) && inPeriod(r.release_year, activePeriod)
  );

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

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {genres.map((f) => (
            <button key={f} onClick={() => setActiveGenre(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
                activeGenre === f ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
              }`}>{f}</button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {periods.map((p) => (
            <button key={p} onClick={() => setActivePeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-200 ${
                activePeriod === p ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"
              }`}>{p}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-12">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-muted-foreground mb-3">Nenhuma avaliação ainda.</p>
            <Link to="/rate" className="text-[11px] text-primary font-medium uppercase tracking-wider hover:underline">
              Seja o primeiro a avaliar →
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((r, i) => (
              <motion.div key={r.album_id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-card rounded-xl p-3.5 border border-border/40 hover:border-primary/20 transition-all duration-200 flex items-center gap-3.5 group">
                <RankBadge rank={i + 1} />
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0 shadow-sm">
                  {r.cover_url && <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {r.artist}{r.genre ? ` · ${r.genre}` : ""}{r.release_year ? ` · ${r.release_year}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-primary">{r.avg_score.toFixed(2)}</span>
                    <Star className="w-3 h-3 text-accent fill-accent" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{r.count} {r.count === 1 ? "review" : "reviews"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rankings;
