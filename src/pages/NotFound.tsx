import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <p className="text-6xl font-bold text-gradient mb-2">404</p>
        <h1 className="text-lg font-bold text-foreground mb-1">Página não encontrada</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Essa faixa não está no tracklist. Volte para o feed.
        </p>
        <Link to="/">
          <Button size="sm" className="text-[11px] uppercase tracking-wider">
            Voltar ao início
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
