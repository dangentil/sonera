import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CRITERIA, CriterionKey, weightedScore } from "@/lib/criteria";

interface Album {
  id: string;
  title: string;
  artist: string;
  release_year: number | null;
  genre: string | null;
  cover_url: string | null;
}

const albumSchema = z.object({
  title: z.string().trim().min(1).max(200),
  artist: z.string().trim().min(1).max(200),
  release_year: z.number().int().min(1900).max(2100).optional().nullable(),
  genre: z.string().trim().max(60).optional().nullable(),
  cover_url: z.string().trim().url().max(2048).optional().nullable(),
});

const ScoreSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[2, 4, 6, 8, 10].map((v, i) => (
      <button
        key={v}
        type="button"
        onClick={() => onChange(v)}
        className="p-0.5 transition-transform hover:scale-125 active:scale-95"
        aria-label={`${v} de 10`}
      >
        <Star className={`w-5 h-5 transition-colors duration-150 ${value >= v ? "text-accent fill-accent" : "text-muted-foreground/20"}`} />
      </button>
    ))}
  </div>
);

const RateAlbum = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [scores, setScores] = useState<Partial<Record<CriterionKey, number>>>({});
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [quickRating, setQuickRating] = useState(0);

  // Add album form
  const [aTitle, setATitle] = useState("");
  const [aArtist, setAArtist] = useState("");
  const [aYear, setAYear] = useState("");
  const [aGenre, setAGenre] = useState("");
  const [aCover, setACover] = useState("");

  useEffect(() => {
    supabase.from("albums").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setAlbums(data ?? []));
  }, []);

  const filtered = search.trim()
    ? albums.filter((a) =>
        (a.title + " " + a.artist).toLowerCase().includes(search.toLowerCase())
      )
    : albums.slice(0, 8);

  const score = weightedScore(scores);
  const filledCount = Object.values(scores).filter((v) => v && v > 0).length;

  const handleAddAlbum = async () => {
    if (!user) return;
    const parsed = albumSchema.safeParse({
      title: aTitle,
      artist: aArtist,
      release_year: aYear ? parseInt(aYear, 10) : null,
      genre: aGenre || null,
      cover_url: aCover || null,
    });
    if (!parsed.success) {
      return toast({ title: "Dados inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
    }
    const { data, error } = await supabase
      .from("albums")
      .insert({ ...parsed.data, created_by: user.id } as any)
      .select()
      .single();
    if (error) return toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    setAlbums([data, ...albums]);
    setSelectedAlbum(data);
    setDialogOpen(false);
    setATitle(""); setAArtist(""); setAYear(""); setAGenre(""); setACover("");
    toast({ title: "Álbum adicionado" });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!selectedAlbum) return toast({ title: "Escolha um álbum", variant: "destructive" });
    let finalScore = score;
    let finalScores: Partial<Record<CriterionKey, number>> = scores;
    if (mode === "quick") {
      if (quickRating < 1) return toast({ title: "Escolha uma nota de 1 a 5", variant: "destructive" });
      const perCriterion = quickRating * 2; // 1-5 -> 2-10
      finalScores = Object.fromEntries(CRITERIA.map((c) => [c.key, perCriterion])) as Partial<Record<CriterionKey, number>>;
      finalScore = perCriterion;
    } else if (filledCount < CRITERIA.length) {
      return toast({ title: "Avalie todos os critérios", variant: "destructive" });
    }
    setBusy(true);
    const payload: any = { user_id: user.id, album_id: selectedAlbum.id, review_text: reviewText || null, weighted_score: Number(finalScore.toFixed(2)) };
    for (const c of CRITERIA) payload[c.key] = finalScores[c.key];
    const { error } = await supabase.from("ratings").upsert(payload, { onConflict: "user_id,album_id" });
    setBusy(false);
    if (error) return toast({ title: "Erro ao publicar", description: error.message, variant: "destructive" });
    toast({ title: "Avaliação publicada!", description: `${selectedAlbum.title} — ${finalScore.toFixed(2)}` });
    navigate("/rankings");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold text-xl md:text-2xl text-foreground mb-0.5">
            Avaliar <span className="text-gradient">Álbum</span>
          </h1>
          <p className="text-muted-foreground text-xs mb-6">Escolha um álbum e avalie cada critério.</p>
        </motion.div>

        {/* Album picker */}
        <div className="mb-6">
          {selectedAlbum ? (
            <div className="bg-card border border-primary/20 rounded-xl p-3.5 flex items-center gap-3">
              {selectedAlbum.cover_url && (
                <img src={selectedAlbum.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedAlbum.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {selectedAlbum.artist}{selectedAlbum.release_year ? ` · ${selectedAlbum.release_year}` : ""}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedAlbum(null)} className="text-[10px]">Trocar</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar álbum no catálogo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-card border-border/40 h-10 text-sm"
                />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 h-10 text-[11px]">
                      <Plus className="w-3.5 h-3.5" /> Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar álbum</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Título *" value={aTitle} onChange={(e) => setATitle(e.target.value)} />
                      <Input placeholder="Artista *" value={aArtist} onChange={(e) => setAArtist(e.target.value)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Ano" value={aYear} onChange={(e) => setAYear(e.target.value)} />
                        <Input placeholder="Gênero" value={aGenre} onChange={(e) => setAGenre(e.target.value)} />
                      </div>
                      <Input placeholder="URL da capa (opcional)" value={aCover} onChange={(e) => setACover(e.target.value)} />
                      <Button onClick={handleAddAlbum} className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {filtered.length > 0 && (
                <div className="bg-card border border-border/40 rounded-xl divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {filtered.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAlbum(a); setSearch(""); }}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      {a.cover_url ? (
                        <img src={a.cover_url} alt="" className="w-9 h-9 rounded-md object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{a.artist}{a.release_year ? ` · ${a.release_year}` : ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filtered.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-3">Nenhum álbum encontrado. Adicione um novo.</p>
              )}
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-card border border-border/40 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`flex-1 text-[11px] uppercase tracking-wider py-2 rounded-lg transition-colors ${mode === "quick" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Rápida (1–5)
          </button>
          <button
            type="button"
            onClick={() => setMode("detailed")}
            className={`flex-1 text-[11px] uppercase tracking-wider py-2 rounded-lg transition-colors ${mode === "detailed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Detalhada
          </button>
        </div>

        {mode === "quick" ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border/40 mb-6 flex flex-col items-center gap-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sua nota</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setQuickRating(v)}
                  className="p-1 transition-transform hover:scale-125 active:scale-95"
                  aria-label={`${v} de 5`}
                >
                  <Star className={`w-9 h-9 transition-colors ${quickRating >= v ? "text-accent fill-accent" : "text-muted-foreground/25"}`} />
                </button>
              ))}
            </div>
            {quickRating > 0 && (
              <p className="text-2xl font-bold text-gradient">{(quickRating * 2).toFixed(2)}</p>
            )}
          </motion.div>
        ) : (
        <>
        {/* Criteria */}
        <div className="space-y-2 mb-6">
          {CRITERIA.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="bg-card rounded-xl p-3.5 border border-border/40 flex items-center gap-3 hover:border-primary/15 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{c.name}</span>
                  <span className="text-[9px] text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5">peso {c.weight}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{c.description}</p>
              </div>
              <ScoreSelector value={scores[c.key] ?? 0} onChange={(v) => setScores({ ...scores, [c.key]: v })} />
            </motion.div>
          ))}
        </div>

        {filledCount > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-4 border border-primary/20 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nota Final</p>
              <p className="text-2xl font-bold text-gradient">{score.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{filledCount}/{CRITERIA.length}</p>
              <div className="w-20 h-1 rounded-full bg-muted mt-1 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(filledCount / CRITERIA.length) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        )}
        </>
        )}

        <Textarea
          placeholder="Escreva sua opinião sobre o álbum (opcional)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="bg-card border-border/40 min-h-[100px] mb-5 text-sm"
        />

        <Button onClick={handleSubmit} disabled={busy} className="w-full text-[11px] uppercase tracking-wider h-11" size="lg">
          {busy ? "Publicando..." : "Publicar Avaliação"}
        </Button>
      </main>
    </div>
  );
};

export default RateAlbum;
