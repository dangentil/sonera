import { User, Plus, Menu, X, LogOut, LogIn, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import NotificationsBell from "./NotificationsBell";
import SearchDialog from "./SearchDialog";

const navLinks = [
  { label: "Feed", href: "/" },
  { label: "Rankings", href: "/rankings" },
  { label: "Grupos", href: "/groups" },
  { label: "Quiz", href: "/quiz" },
];

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { session, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="container mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              to="/"
              className="text-foreground font-light text-xl tracking-[0.3em] uppercase select-none hover:text-primary transition-colors duration-300"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              sonera
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase transition-colors rounded-md ${
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-muted rounded-md -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-8 h-8"
              onClick={() => setSearchOpen(true)}
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Link to={session ? "/rate" : "/auth"} className="hidden sm:inline-flex">
              <Button size="sm" className="text-[10px] tracking-[0.15em] uppercase gap-1.5 h-8 px-3 rounded-lg">
                <Plus className="w-3 h-3" /> Avaliar
              </Button>
            </Link>
            <NotificationsBell />
            {session ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground w-8 h-8" title="Sair">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8" title="Entrar">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground w-8 h-8"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-14 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 md:hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm tracking-wide transition-colors ${
                    location.pathname === link.href
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/rate"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center"
              >
                + Avaliar Álbum
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/40">
        <div className="flex items-center justify-around h-14">
          {[
            { label: "Feed", href: "/", icon: "♪" },
            { label: "Rankings", href: "/rankings", icon: "◆" },
            { label: "Avaliar", href: "/rate", icon: "+" },
            { label: "Quiz", href: "/quiz", icon: "?" },
            { label: "Perfil", href: "/profile", icon: "●" },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] tracking-wider transition-colors ${
                location.pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;
