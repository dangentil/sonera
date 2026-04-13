import { useState } from "react";
import Header from "@/components/Header";
import { Play, CheckCircle, XCircle, Clock, Trophy, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockArtists = [
  { name: "Radiohead", imageUrl: "https://picsum.photos/120/120?random=50" },
  { name: "Kendrick Lamar", imageUrl: "https://picsum.photos/120/120?random=51" },
  { name: "Björk", imageUrl: "https://picsum.photos/120/120?random=52" },
  { name: "Frank Ocean", imageUrl: "https://picsum.photos/120/120?random=53" },
  { name: "Tame Impala", imageUrl: "https://picsum.photos/120/120?random=54" },
  { name: "Tyler, The Creator", imageUrl: "https://picsum.photos/120/120?random=55" },
];

const tiers = [
  { min: 90, label: "Superfã", icon: "🏆", color: "text-accent" },
  { min: 75, label: "Expert", icon: "🥈", color: "text-primary" },
  { min: 50, label: "Conhecedor", icon: "🥉", color: "text-foreground" },
  { min: 0, label: "Ouvinte Casual", icon: "🎵", color: "text-muted-foreground" },
];

type QuizState = "select" | "playing" | "result";

const Quiz = () => {
  const [state, setState] = useState<QuizState>("select");
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const totalRounds = 10;

  const startQuiz = (artist: string) => {
    setSelectedArtist(artist);
    setCurrentRound(1);
    setScore(0);
    setState("playing");
  };

  const submitAnswer = () => {
    // Mock: randomly decide correct/wrong for demo
    const isCorrect = Math.random() > 0.4;
    setShowFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setShowFeedback(null);
      setAnswer("");
      if (currentRound >= totalRounds) {
        setState("result");
      } else {
        setCurrentRound((r) => r + 1);
      }
    }, 1500);
  };

  const accuracy = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;
  const tier = tiers.find((t) => accuracy >= t.min) || tiers[tiers.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-2xl">
        {state === "select" && (
          <>
            <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-1">
              <span className="text-gradient">Quiz Musical</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Escute cegamente músicas de um artista e prove que é fã de verdade. Seu resultado será estampado no seu perfil!
            </p>

            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Escolha um artista</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockArtists.map((a) => (
                <button
                  key={a.name}
                  onClick={() => startQuiz(a.name)}
                  className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all flex flex-col items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                    <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{a.name}</span>
                </button>
              ))}
            </div>

            {/* Tier explanation */}
            <div className="mt-10 bg-card rounded-xl p-5 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" /> Níveis de Fã
              </h3>
              <div className="space-y-2">
                {tiers.map((t) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-lg">{t.icon}</span>
                    <span className={`text-sm font-semibold ${t.color}`}>{t.label}</span>
                    <span className="text-xs text-muted-foreground">≥ {t.min}% de acerto</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {state === "playing" && (
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Quiz: {selectedArtist}
            </p>
            <p className="text-sm text-foreground mb-8">
              Rodada <span className="font-bold text-accent">{currentRound}</span> de {totalRounds}
            </p>

            {/* Mock audio player */}
            <div className="w-full bg-card rounded-xl p-8 border border-border flex flex-col items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Music className="w-10 h-10 text-muted-foreground" />
              </div>
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14">
                <Play className="w-6 h-6" />
              </Button>
              <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full w-1/3 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground">🎧 Ouça o trecho e adivinhe a música</p>
            </div>

            {/* Answer input */}
            <div className="w-full flex gap-3">
              <Input
                placeholder="Qual é essa música?"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && answer && submitAnswer()}
                className="bg-card border-border flex-1"
                disabled={!!showFeedback}
              />
              <Button onClick={submitAnswer} disabled={!answer || !!showFeedback}>
                Enviar
              </Button>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${showFeedback === "correct" ? "text-green-400" : "text-destructive"}`}>
                {showFeedback === "correct" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {showFeedback === "correct" ? "Correto!" : "Errou!"}
              </div>
            )}

            {/* Score bar */}
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span>Acertos: <span className="font-bold text-foreground">{score}</span></span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 0:42</span>
            </div>
          </div>
        )}

        {state === "result" && (
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">{tier.icon}</span>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Você é <span className={tier.color}>{tier.label}</span>
            </h2>
            <p className="text-muted-foreground text-sm mb-6">de {selectedArtist}</p>

            <div className="bg-card rounded-xl p-6 border border-border w-full max-w-sm mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Acertos</span>
                <span className="font-bold text-foreground">{score}/{totalRounds}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Precisão</span>
                <span className="font-bold text-primary">{accuracy}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${accuracy}%` }} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">Esta conquista será exibida no seu perfil!</p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setState("select")}>Escolher outro artista</Button>
              <Button onClick={() => startQuiz(selectedArtist!)}>Jogar de novo</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;
