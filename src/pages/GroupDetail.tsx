import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, Check, X, Lock, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Group { id: string; name: string; description: string | null; created_by: string; }
interface Member { id: string; user_id: string; status: string; role: string; profile?: { username: string; display_name: string; avatar_url: string | null } | null; }
interface Rating { id: string; weighted_score: number; review_text: string | null; created_at: string; user_id: string;
  album?: { title: string; artist: string; cover_url: string | null } | null;
  profile?: { username: string; display_name: string } | null;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Member[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const load = async () => {
    if (!id) return;
    const { data: g } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
    setGroup(g as Group | null);
    const { data: ms } = await supabase.from("group_members").select("*").eq("group_id", id);
    const memberRows = (ms ?? []) as any[];
    const userIds = memberRows.map((m) => m.user_id);
    const { data: profs } = userIds.length
      ? await supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", userIds)
      : { data: [] as any[] };
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const enriched = memberRows.map((m) => ({ ...m, profile: profMap.get(m.user_id) ?? null })) as Member[];
    setMembers(enriched.filter((m) => m.status === "approved"));
    setPending(enriched.filter((m) => m.status === "pending"));
    if (user) {
      const me = enriched.find((m) => m.user_id === user.id);
      setIsMember(me?.status === "approved");
      setIsAdmin(me?.status === "approved" && me?.role === "admin");
    }

    // group ratings
    const { data: rg } = await supabase.from("rating_groups").select("rating_id").eq("group_id", id);
    const ratingIds = (rg ?? []).map((r: any) => r.rating_id);
    if (ratingIds.length) {
      const { data: rs } = await supabase.from("ratings").select("*").in("id", ratingIds).order("created_at", { ascending: false });
      const albumIds = Array.from(new Set((rs ?? []).map((r: any) => r.album_id)));
      const ratingUserIds = Array.from(new Set((rs ?? []).map((r: any) => r.user_id)));
      const [{ data: albums }, { data: ratingProfs }] = await Promise.all([
        supabase.from("albums").select("id,title,artist,cover_url").in("id", albumIds),
        supabase.from("profiles").select("id,username,display_name").in("id", ratingUserIds),
      ]);
      const aMap = new Map((albums ?? []).map((a: any) => [a.id, a]));
      const pMap = new Map((ratingProfs ?? []).map((p: any) => [p.id, p]));
      setRatings(((rs ?? []) as any[]).map((r) => ({ ...r, album: aMap.get(r.album_id), profile: pMap.get(r.user_id) })));
    } else {
      setRatings([]);
    }
  };

  useEffect(() => { load(); }, [id, user]);

  const decide = async (memberId: string, approve: boolean) => {
    if (approve) {
      const { error } = await supabase.from("group_members").update({ status: "approved" }).eq("id", memberId);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("group_members").delete().eq("id", memberId);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
    toast({ title: approve ? "Aprovado" : "Rejeitado" });
    load();
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="container mx-auto px-4 py-10 text-center text-sm text-muted-foreground">Carregando...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
        <Link to="/groups" className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider">← Grupos</Link>
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 mb-6">
          <h1 className="font-bold text-2xl text-foreground flex items-center gap-2">
            {group.name} <Lock className="w-4 h-4 text-muted-foreground" />
          </h1>
          {group.description && <p className="text-xs text-muted-foreground mt-1">{group.description}</p>}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
            <Users className="w-3 h-3" /> {members.length} {members.length === 1 ? "membro" : "membros"}
          </div>
        </motion.div>

        {!isMember && (
          <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
            <Lock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-foreground">Conteúdo privado deste grupo</p>
            <p className="text-xs text-muted-foreground mt-1">Você precisa ser membro aprovado para ver as avaliações.</p>
          </div>
        )}

        {isAdmin && pending.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Pedidos pendentes</p>
            <div className="space-y-2">
              {pending.map((m) => (
                <div key={m.id} className="bg-card border border-border/40 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{m.profile?.display_name ?? "Usuário"}</p>
                    <p className="text-[11px] text-muted-foreground">@{m.profile?.username}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => decide(m.id, true)}><Check className="w-4 h-4 text-accent" /></Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => decide(m.id, false)}><X className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMember && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-6 mb-2">Avaliações do grupo</p>
            {ratings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhuma avaliação compartilhada ainda.</p>
            ) : (
              <div className="space-y-2">
                {ratings.map((r) => (
                  <div key={r.id} className="bg-card border border-border/40 rounded-xl p-3 flex items-center gap-3">
                    {r.album?.cover_url ? (
                      <img src={r.album.cover_url} alt="" className="w-12 h-12 rounded-md object-cover" />
                    ) : <div className="w-12 h-12 rounded-md bg-muted" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.album?.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.album?.artist} · @{r.profile?.username}</p>
                      {r.review_text && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{r.review_text}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-3.5 h-3.5 fill-accent" />
                      <span className="text-sm font-bold">{Number(r.weighted_score).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-6 mb-2">Membros</p>
            <div className="space-y-1">
              {members.map((m) => (
                <div key={m.id} className="bg-card border border-border/40 rounded-xl p-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{m.profile?.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">@{m.profile?.username}</p>
                  </div>
                  {m.role === "admin" && <span className="text-[9px] uppercase tracking-wider text-accent">Admin</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GroupDetail;