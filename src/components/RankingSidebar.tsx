import { useEffect, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface TopRow { album_id: string; title: string; artist: string; avg: number; count: number; }

const RankingSidebar = () => {
  const [top, setTop] = useState<TopRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ratings")
        .select("album_id, weighted_score, albums(title, artist)");
      const map = new Map<string, TopRow>();
      (data ?? []).forEach((r: any) => {
        const a = r.albums; if (!a) return;
        const score = Number(r.weighted_score);
        const ex = map.get(r.album_id);
        if (ex) { ex.avg = (ex.avg * ex.count + score) / (ex.count + 1); ex.count++; }
        else map.set(r.album_id, { album_id: r.album_id, title: a.title, artist: a.artist, avg: score, count: 1 });
      });
      setTop([...map.values()].sort((x, y) => y.avg - x.avg).slice(0, 5));
    })();
  }, []);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-72 shrink-0 hidden lg:flex flex-col gap-5 sticky top-[4.5rem]"
    >
      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.12em]">Top Charts</h3>
        </div>
        {top.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Sem avaliações ainda.</p>
        ) : (
          <div className="space-y-2.5">
            {top.map((r, i) => (
              <div key={r.album_id} className="flex items-center gap-3 group">
                <span className={`text-[11px] font-bold w-4 text-center ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.artist}</p>
                </div>
                <span className="text-[11px] font-semibold text-primary">{r.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
        <Link to="/rankings" className="mt-4 block w-full text-center text-[10px] text-primary font-medium uppercase tracking-wider hover:underline">
          Ver ranking completo →
        </Link>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.12em]">Comece a Avaliar</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">Adicione um álbum e dê sua nota nos 13 critérios.</p>
        <Link to="/rate" className="block w-full text-center bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider rounded-lg py-2 hover:opacity-90 transition-opacity">
          Avaliar agora
        </Link>
      </div>
    </motion.aside>
  );
};

export default RankingSidebar;
