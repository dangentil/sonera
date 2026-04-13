import { Search, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Feed", href: "/" },
  { label: "Rankings", href: "/rankings" },
  { label: "Quiz", href: "/quiz" },
];

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-foreground font-light text-2xl tracking-[0.25em] uppercase select-none"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            sonera
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs tracking-widest uppercase transition-colors ${
                  location.pathname === link.href
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/rate">
            <Button size="sm" variant="ghost" className="text-xs tracking-wider uppercase gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Avaliar
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="w-4 h-4" />
          </Button>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
