import { useState } from "react";
import Header from "@/components/Header";
import { Play, CheckCircle, XCircle, Clock, Trophy, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {state === "select" && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="font-bold text-xl md:text-2xl text-foreground mb-0.5">
                <span className="text-gradient">Quiz Musical</span>
              </h1>
              <p className="text-muted-foreground text-xs mb-8">
                Escute cegamente músicas de um artista e prove que é fã de verdade.
              </p>

              <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.12em] mb-3">Escolha um artista</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {mockArtists.map((a, i) => (
                  <motion.button
                    key={a.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => startQuiz(a.name)}
                    className="bg-card rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all flex flex-col items-center gap-2.5 group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary/40 transition-all">
                      <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-medium text-foreground group-hover:text-accent transition-colors">{a.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Tier explanation */}
              <div className="mt-8 bg-card rounded-xl p-4 border border-border/40">
                <h3 className="text-[11px] font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-accent" /> Níveis de Fã
                </h3>
                <div className="space-y-1.5">
                  {tiers.map((t) => (
                    <div key={t.label} className="flex items-center gap-2.5">
                      <span className="text-base">{t.icon}</span>
                      <span className={`text-xs font-medium ${t.color}`}>{t.label}</span>
                      <span className="text-[10px] text-muted-foreground">≥ {t.min}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {state === "playing" && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Quiz: {selectedArtist}
              </p>
              <p className="text-sm text-foreground mb-6">
                Rodada <span className="font-bold text-accent">{currentRound}</span>/{totalRounds}
              </p>

              {/* Mock audio player */}
              <div className="w-full bg-card rounded-2xl p-6 md:p-8 border border-border/40 flex flex-col items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                  <Music className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <Button variant="outline" size="lg" className="rounded-full w-12 h-12 border-primary/30 hover:bg-primary/10">
                  <Play className="w-5 h-5" />
                </Button>
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">🎧 Ouça o trecho e adivinhe</p>
              </div>

              {/* Answer input */}
              <div className="w-full flex gap-2.5">
                <Input
                  placeholder="Qual é essa música?"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && answer && submitAnswer()}
                  className="bg-card border-border/40 flex-1 h-10 text-sm"
                  disabled={!!showFeedback}
                />
                <Button onClick={submitAnswer} disabled={!answer || !!showFeedback} className="h-10">
                  Enviar
                </Button>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${showFeedback === "correct" ? "text-green-400" : "text-destructive"}`}
                  >
                    {showFeedback === "correct" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {showFeedback === "correct" ? "Correto!" : "Errou!"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Score bar */}
              <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Acertos: <span className="font-bold text-foreground">{score}</span></span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 0:42</span>
              </div>
            </motion.div>
          )}

          {state === "result" && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
              <span className="text-5xl mb-3">{tier.icon}</span>
              <h2 className="text-xl font-bold text-foreground mb-0.5">
                Você é <span className={tier.color}>{tier.label}</span>
              </h2>
              <p className="text-muted-foreground text-xs mb-5">de {selectedArtist}</p>

              <div className="bg-card rounded-xl p-5 border border-border/40 w-full max-w-xs mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Acertos</span>
                  <span className="font-bold text-foreground">{score}/{totalRounds}</span>
                </div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-muted-foreground">Precisão</span>
                  <span className="font-bold text-primary">{accuracy}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mb-5">Esta conquista será exibida no seu perfil!</p>

              <div className="flex gap-2.5">
                <Button variant="outline" size="sm" onClick={() => setState("select")}>Outro artista</Button>
                <Button size="sm" onClick={() => startQuiz(selectedArtist!)}>Jogar de novo</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Quiz;
