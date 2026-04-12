import Header from "@/components/Header";
import ReviewCard from "@/components/ReviewCard";
import RankingSidebar from "@/components/RankingSidebar";

const defaultCriteria = [
  { name: "Letras", weight: 10 },
  { name: "Impacto Pessoal", weight: 10 },
  { name: "Riqueza Musical", weight: 9 },
  { name: "Autenticidade", weight: 8 },
  { name: "Produção / Arranjo", weight: 9 },
  { name: "Dinâmica das Faixas", weight: 7 },
  { name: "Mix / Master", weight: 7 },
  { name: "Peso Histórico", weight: 5 },
  { name: "Branding / Storytelling", weight: 6 },
  { name: "Qualidade Técnica", weight: 7 },
  { name: "Bangers", weight: 7 },
  { name: "Emoção", weight: 9 },
  { name: "Criatividade", weight: 6 },
];

const mockReviews = [
  {
    userName: "Lucas M.",
    userInitials: "LM",
    gradientFrom: "#e94560",
    gradientTo: "#ff6b6b",
    albumName: "Starlight Serenade",
    artistName: "The Celestial Drifters",
    rating: 4.6,
    reviewText: "Uma viagem por paisagens sonoras etéreas, misturando melodias intrincadas com emoção crua. Cada faixa é um segredo sussurrado do cosmos.",
    likes: 1247,
    comments: 89,
    timeAgo: "há 2 horas",
    imageUrl: "https://picsum.photos/300/300?random=10",
    criteria: [
      { name: "Letras", score: 4.5, weight: 10 },
      { name: "Impacto Pessoal", score: 4.9, weight: 10 },
      { name: "Riqueza Musical", score: 4.8, weight: 9 },
      { name: "Autenticidade", score: 5.0, weight: 8 },
      { name: "Produção / Arranjo", score: 4.7, weight: 9 },
      { name: "Dinâmica das Faixas", score: 4.3, weight: 7 },
      { name: "Mix / Master", score: 4.6, weight: 7 },
      { name: "Peso Histórico", score: 3.8, weight: 5 },
      { name: "Branding / Storytelling", score: 4.2, weight: 6 },
      { name: "Qualidade Técnica", score: 4.7, weight: 7 },
      { name: "Bangers", score: 4.4, weight: 7 },
      { name: "Emoção", score: 4.9, weight: 9 },
      { name: "Criatividade", score: 4.6, weight: 6 },
    ],
  },
  {
    userName: "Ana C.",
    userInitials: "AC",
    gradientFrom: "#00d2ff",
    gradientTo: "#3a7bd5",
    albumName: "Quantum Leap",
    artistName: "AstroFrequencies",
    rating: 4.4,
    reviewText: "Uma fusão inovadora de beats eletrônicos clássicos e jazz experimental. Empurra os limites do som, criando uma experiência eletrizante.",
    likes: 953,
    comments: 67,
    timeAgo: "há 5 horas",
    imageUrl: "https://picsum.photos/300/300?random=11",
    criteria: [
      { name: "Letras", score: 4.2, weight: 10 },
      { name: "Impacto Pessoal", score: 4.5, weight: 10 },
      { name: "Riqueza Musical", score: 4.8, weight: 9 },
      { name: "Autenticidade", score: 4.6, weight: 8 },
      { name: "Produção / Arranjo", score: 4.9, weight: 9 },
      { name: "Dinâmica das Faixas", score: 4.1, weight: 7 },
      { name: "Mix / Master", score: 4.7, weight: 7 },
      { name: "Peso Histórico", score: 3.5, weight: 5 },
      { name: "Branding / Storytelling", score: 4.0, weight: 6 },
      { name: "Qualidade Técnica", score: 4.6, weight: 7 },
      { name: "Bangers", score: 4.3, weight: 7 },
      { name: "Emoção", score: 4.4, weight: 9 },
      { name: "Criatividade", score: 4.9, weight: 6 },
    ],
  },
  {
    userName: "Pedro S.",
    userInitials: "PS",
    gradientFrom: "#11998e",
    gradientTo: "#38ef7d",
    albumName: "Digital Alchemist",
    artistName: "Circuit Weaver",
    rating: 3.9,
    reviewText: "Um experimento interessante em composição algorítmica. A execução técnica é inegável, porém às vezes parece mais uma demonstração do que música emocional.",
    likes: 612,
    comments: 43,
    timeAgo: "há 1 dia",
    imageUrl: "https://picsum.photos/300/300?random=12",
    criteria: [
      { name: "Letras", score: 3.8, weight: 10 },
      { name: "Impacto Pessoal", score: 3.5, weight: 10 },
      { name: "Riqueza Musical", score: 4.2, weight: 9 },
      { name: "Autenticidade", score: 4.0, weight: 8 },
      { name: "Produção / Arranjo", score: 4.5, weight: 9 },
      { name: "Dinâmica das Faixas", score: 3.7, weight: 7 },
      { name: "Mix / Master", score: 4.3, weight: 7 },
      { name: "Peso Histórico", score: 3.2, weight: 5 },
      { name: "Branding / Storytelling", score: 3.6, weight: 6 },
      { name: "Qualidade Técnica", score: 4.7, weight: 7 },
      { name: "Bangers", score: 3.4, weight: 7 },
      { name: "Emoção", score: 3.5, weight: 9 },
      { name: "Criatividade", score: 4.3, weight: 6 },
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
