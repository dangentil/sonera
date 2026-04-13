import { useState } from "react";
import Header from "@/components/Header";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const criteriaConfig = [
  { name: "Letras", weight: 10, description: "Qualidade lírica, profundidade e coerência das letras" },
  { name: "Impacto Pessoal", weight: 10, description: "O quanto o álbum te marcou emocionalmente" },
  { name: "Riqueza Musical", weight: 9, description: "Diversidade e complexidade de elementos musicais" },
  { name: "Autenticidade", weight: 8, description: "Originalidade e identidade artística genuína" },
  { name: "Produção / Arranjo", weight: 9, description: "Qualidade da produção e dos arranjos" },
  { name: "Dinâmica das Faixas", weight: 7, description: "Fluxo e progressão entre as faixas" },
  { name: "Mix / Master", weight: 7, description: "Qualidade técnica do tratamento do áudio" },
  { name: "Peso Histórico", weight: 5, description: "Relevância e impacto na história da música" },
  { name: "Branding / Storytelling", weight: 6, description: "Narrativa visual e conceitual do álbum" },
  { name: "Qualidade Técnica", weight: 7, description: "Habilidade dos músicos envolvidos" },
  { name: "Bangers", weight: 7, description: "Quantidade de faixas que são hits certeiros" },
  { name: "Emoção", weight: 9, description: "Capacidade de transmitir e despertar emoções" },
  { name: "Criatividade", weight: 6, description: "Inovação e experimentação artística" },
];

const ScoreSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= value ? "text-accent fill-accent" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-2xl">
        <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-1">
          Avaliar <span className="text-gradient">Álbum</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Preencha os dados e avalie cada critério de 1 a 5.</p>

        {/* Album info */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Nome do álbum" value={albumName} onChange={(e) => setAlbumName(e.target.value)} className="bg-card border-border" />
            <Input placeholder="Artista" value={artistName} onChange={(e) => setArtistName(e.target.value)} className="bg-card border-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Gênero" value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-card border-border" />
            <Input placeholder="Ano de lançamento" value={year} onChange={(e) => setYear(e.target.value)} className="bg-card border-border" />
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-3 mb-8">
          {criteriaConfig.map((c) => (
            <div key={c.name} className="bg-card rounded-xl p-4 border border-border flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">peso {c.weight}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              </div>
              <ScoreSelector value={scores[c.name]} onChange={(v) => setScores({ ...scores, [c.name]: v })} />
            </div>
          ))}
        </div>

        {/* Final score preview */}
        {filledCount > 0 && (
          <div className="bg-card rounded-xl p-5 border border-border mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Nota Final Ponderada</p>
              <p className="text-3xl font-bold text-gradient">{weightedScore.toFixed(2)}</p>
            </div>
            <p className="text-xs text-muted-foreground">{filledCount}/{criteriaConfig.length} critérios</p>
          </div>
        )}

        {/* Review text */}
        <Textarea
          placeholder="Escreva sua opinião sobre o álbum (opcional)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="bg-card border-border min-h-[120px] mb-6"
        />

        <Button onClick={handleSubmit} className="w-full text-sm uppercase tracking-wider" size="lg">
          Publicar Avaliação
        </Button>
      </main>
    </div>
  );
};

export default RateAlbum;
