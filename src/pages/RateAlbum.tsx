import { useState } from "react";
import Header from "@/components/Header";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const criteriaConfig = [
  { name: "Letras", weight: 10, description: "Qualidade lírica, profundidade e coerência" },
  { name: "Impacto Pessoal", weight: 10, description: "O quanto o álbum te marcou" },
  { name: "Riqueza Musical", weight: 9, description: "Diversidade e complexidade musical" },
  { name: "Autenticidade", weight: 8, description: "Originalidade e identidade genuína" },
  { name: "Produção / Arranjo", weight: 9, description: "Qualidade da produção e arranjos" },
  { name: "Dinâmica das Faixas", weight: 7, description: "Fluxo e progressão entre faixas" },
  { name: "Mix / Master", weight: 7, description: "Qualidade do tratamento do áudio" },
  { name: "Peso Histórico", weight: 5, description: "Relevância na história da música" },
  { name: "Branding / Storytelling", weight: 6, description: "Narrativa visual e conceitual" },
  { name: "Qualidade Técnica", weight: 7, description: "Habilidade dos músicos envolvidos" },
  { name: "Bangers", weight: 7, description: "Quantidade de hits certeiros" },
  { name: "Emoção", weight: 9, description: "Capacidade de despertar emoções" },
  { name: "Criatividade", weight: 6, description: "Inovação e experimentação" },
];

const ScoreSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-0.5 transition-transform hover:scale-125 active:scale-95"
      >
        <Star
          className={`w-5 h-5 transition-colors duration-150 ${
            star <= value ? "text-accent fill-accent" : "text-muted-foreground/20"
          }`}
        />
      </button>
    ))}
  </div>
);

const RateAlbum = () => {
  const { toast } = useToast();
  const [albumName, setAlbumName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(criteriaConfig.map((c) => [c.name, 0]))
  );

  const totalWeight = criteriaConfig.reduce((sum, c) => sum + c.weight, 0);
  const weightedScore =
    criteriaConfig.reduce((sum, c) => sum + (scores[c.name] || 0) * c.weight, 0) / totalWeight;
  const filledCount = Object.values(scores).filter((v) => v > 0).length;

  const handleSubmit = () => {
    if (!albumName || !artistName || filledCount < criteriaConfig.length) {
      toast({ title: "Preencha todos os campos", description: "Dê nota em todos os critérios para publicar.", variant: "destructive" });
      return;
    }
    toast({ title: "Avaliação publicada!", description: `${albumName} recebeu nota ${weightedScore.toFixed(1)}` });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-bold text-xl md:text-2xl text-foreground mb-0.5">
            Avaliar <span className="text-gradient">Álbum</span>
          </h1>
          <p className="text-muted-foreground text-xs mb-6">Preencha os dados e avalie cada critério de 1 a 5.</p>
        </motion.div>

        {/* Album info */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Nome do álbum" value={albumName} onChange={(e) => setAlbumName(e.target.value)} className="bg-card border-border/40 h-10 text-sm" />
            <Input placeholder="Artista" value={artistName} onChange={(e) => setArtistName(e.target.value)} className="bg-card border-border/40 h-10 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Gênero" value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-card border-border/40 h-10 text-sm" />
            <Input placeholder="Ano de lançamento" value={year} onChange={(e) => setYear(e.target.value)} className="bg-card border-border/40 h-10 text-sm" />
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-2 mb-6">
          {criteriaConfig.map((c, i) => (
            <motion.div
              key={c.name}
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
              <ScoreSelector value={scores[c.name]} onChange={(v) => setScores({ ...scores, [c.name]: v })} />
            </motion.div>
          ))}
        </div>

        {/* Final score preview */}
        {filledCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-4 border border-primary/20 mb-6 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nota Final</p>
              <p className="text-2xl font-bold text-gradient">{weightedScore.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{filledCount}/{criteriaConfig.length}</p>
              <div className="w-20 h-1 rounded-full bg-muted mt-1 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(filledCount / criteriaConfig.length) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Review text */}
        <Textarea
          placeholder="Escreva sua opinião sobre o álbum (opcional)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="bg-card border-border/40 min-h-[100px] mb-5 text-sm"
        />

        <Button onClick={handleSubmit} className="w-full text-[11px] uppercase tracking-wider h-11" size="lg">
          Publicar Avaliação
        </Button>
      </main>
    </div>
  );
};

export default RateAlbum;
