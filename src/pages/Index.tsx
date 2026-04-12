import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import RankingSidebar from "@/components/RankingSidebar";

const mockReviews = [
  {
    userName: "Lucas M.",
    userInitials: "LM",
    gradientFrom: "#e94560",
    gradientTo: "#ff6b6b",
    albumName: "Starlight Serenade",
    artistName: "The Celestial Drifters",
    rating: 4.8,
    reviewText: "Uma viagem por paisagens sonoras etéreas, misturando melodias intrincadas com emoção crua. Cada faixa é um segredo sussurrado do cosmos.",
    likes: 1247,
    comments: 89,
    timeAgo: "há 2 horas",
    imageUrl: "https://picsum.photos/300/300?random=10",
    criteria: [
      { name: "Produção", score: 4.9, weight: 25 },
      { name: "Letras", score: 4.5, weight: 20 },
      { name: "Melodia", score: 4.8, weight: 25 },
      { name: "Originalidade", score: 5.0, weight: 15 },
      { name: "Replay", score: 4.7, weight: 15 },
    ],
  },
  {
    userName: "Ana C.",
    userInitials: "AC",
    gradientFrom: "#00d2ff",
    gradientTo: "#3a7bd5",
    albumName: "Quantum Leap",
    artistName: "AstroFrequencies",
    rating: 4.7,
    reviewText: "Uma fusão inovadora de beats eletrônicos clássicos e jazz experimental. Empurra os limites do som, criando uma experiência eletrizante.",
    likes: 953,
    comments: 67,
    timeAgo: "há 5 horas",
    imageUrl: "https://picsum.photos/300/300?random=11",
    criteria: [
      { name: "Produção", score: 4.9, weight: 25 },
      { name: "Letras", score: 4.2, weight: 20 },
      { name: "Melodia", score: 4.8, weight: 25 },
      { name: "Originalidade", score: 4.9, weight: 15 },
      { name: "Replay", score: 4.5, weight: 15 },
    ],
  },
  {
    userName: "Pedro S.",
    userInitials: "PS",
    gradientFrom: "#11998e",
    gradientTo: "#38ef7d",
    albumName: "Digital Alchemist",
    artistName: "Circuit Weaver",
    rating: 4.2,
    reviewText: "Um experimento interessante em composição algorítmica. A execução técnica é inegável, porém às vezes parece mais uma demonstração do que música emocional.",
    likes: 612,
    comments: 43,
    timeAgo: "há 1 dia",
    imageUrl: "https://picsum.photos/300/300?random=12",
    criteria: [
      { name: "Produção", score: 4.5, weight: 25 },
      { name: "Letras", score: 3.8, weight: 20 },
      { name: "Melodia", score: 4.0, weight: 25 },
      { name: "Originalidade", score: 4.7, weight: 15 },
      { name: "Replay", score: 4.0, weight: 15 },
    ],
  },
  {
    userName: "Mariana R.",
    userInitials: "MR",
    gradientFrom: "#fc5c7d",
    gradientTo: "#6a82fb",
    albumName: "Velvet Horizon",
    artistName: "Dream Weavers",
    rating: 4.5,
    reviewText: "Um álbum que consegue ser introspectivo e grandioso ao mesmo tempo. As camadas de sintetizadores criam uma atmosfera hipnótica que não te deixa parar de ouvir.",
    likes: 834,
    comments: 56,
    timeAgo: "há 2 dias",
    imageUrl: "https://picsum.photos/300/300?random=13",
    criteria: [
      { name: "Produção", score: 4.6, weight: 25 },
      { name: "Letras", score: 4.3, weight: 20 },
      { name: "Melodia", score: 4.7, weight: 25 },
      { name: "Originalidade", score: 4.4, weight: 15 },
      { name: "Replay", score: 4.5, weight: 15 },
    ],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 flex gap-8">
        {/* Feed */}
        <section className="flex-1 min-w-0">
          <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-6">
            Últimas <span className="text-gradient">Avaliações</span>
          </h1>
          <div className="space-y-6">
            {mockReviews.map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <RankingSidebar />
      </main>
    </div>
  );
};

export default Index;
