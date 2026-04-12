import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span
            className="text-foreground font-light text-2xl tracking-[0.25em] uppercase select-none"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            sonera
          </span>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs tracking-widest uppercase">Feed</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs tracking-widest uppercase">Rankings</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs tracking-widest uppercase">Quiz</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs tracking-widest uppercase">Descobrir</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex text-xs tracking-wider uppercase">Entrar</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-wider uppercase">Criar conta</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
