import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}
interface RatingRow {
  id: string;
  weighted_score: number;
  created_at: string;
  albums: { title: string; artist: string; cover_url: string | null } | null;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));
    supabase.from("ratings")
      .select("id, weighted_score, created_at, albums(title, artist, cover_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRatings((data as any) ?? []));
  }, [user]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="text-xs text-muted-foreground text-center py-20">Carregando...</p>
      </div>
    );
  }

  const joined = new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl md:text-2xl font-bold text-primary-foreground shrink-0">
              {initials(profile.display_name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-foreground">{profile.display_name}</h1>
              <p className="text-xs text-muted-foreground mb-3">@{profile.username} · Entrou em {joined}</p>
              <div className="flex gap-5 text-xs">
                <div><span className="font-bold text-foreground">{ratings.length}</span> <span className="text-muted-foreground">avaliações</span></div>
              </div>
            </div>
          </div>
          {profile.bio && <p className="mt-4 text-xs text-muted-foreground">{profile.bio}</p>}
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="bg-card rounded-2xl p-5 border border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.12em]">Minhas Avaliações</h2>
          </div>
          {ratings.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Você ainda não avaliou nenhum álbum.</p>
          ) : (
            <div className="space-y-2">
              {ratings.map((r) => (
                <div key={r.id} className="flex items-center gap-3 group hover:bg-muted/20 rounded-lg p-2 -mx-2 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    {r.albums?.cover_url && <img src={r.albums.cover_url} alt={r.albums.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">{r.albums?.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.albums?.artist}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-primary">{Number(r.weighted_score).toFixed(2)}</span>
                    <Star className="w-3 h-3 text-accent fill-accent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
