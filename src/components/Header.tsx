import { Music, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            <span className="text-primary font-bold text-xl tracking-tight">Sonera</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium text-sm">Feed</a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium text-sm">Rankings</a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium text-sm">Quiz</a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors font-medium text-sm">Descobrir</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">Entrar</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Criar conta</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
