import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface Group {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_by: string;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

const Groups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myMemberships, setMyMemberships] = useState<Record<string, "pending" | "approved">>({});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: gs } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
    setGroups((gs as Group[]) ?? []);
    if (user) {
      const { data: ms } = await supabase.from("group_members").select("group_id,status").eq("user_id", user.id);
      const map: Record<string, "pending" | "approved"> = {};
      (ms ?? []).forEach((m: any) => (map[m.group_id] = m.status));
      setMyMemberships(map);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    if (!name.trim()) return toast({ title: "Nome obrigatório", variant: "destructive" });
    setBusy(true);
    const baseSlug = slugify(name) || "grupo";
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("groups").insert({
      name: name.trim(), description: desc.trim() || null, slug, created_by: user.id,
    } as any);
    setBusy(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setOpen(false); setName(""); setDesc("");
    toast({ title: "Grupo criado" });
    load();
  };

  const handleJoin = async (groupId: string) => {
    if (!user) return;
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId, user_id: user.id, status: "pending", role: "member",
    } as any);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Pedido enviado" });
    load();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-bold text-xl md:text-2xl text-foreground mb-0.5">
              <span className="text-gradient">Grupos</span>
            </h1>
            <p className="text-muted-foreground text-xs">Crie círculos privados para compartilhar avaliações.</p>
          </div>
          {user && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-[10px] uppercase tracking-wider"><Plus className="w-3 h-3" /> Novo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar grupo</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nome do grupo *" value={name} onChange={(e) => setName(e.target.value)} />
                  <Textarea placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  <Button onClick={handleCreate} disabled={busy} className="w-full">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <div className="space-y-2">
          {groups.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">Nenhum grupo ainda.</p>
          )}
          {groups.map((g) => {
            const status = myMemberships[g.id];
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/40 rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                    {g.name} <Lock className="w-3 h-3 text-muted-foreground" />
                  </p>
                  {g.description && <p className="text-[11px] text-muted-foreground truncate">{g.description}</p>}
                </div>
                {status === "approved" ? (
                  <Link to={`/groups/${g.id}`}>
                    <Button size="sm" variant="outline" className="text-[10px] uppercase tracking-wider">Abrir</Button>
                  </Link>
                ) : status === "pending" ? (
                  <Button size="sm" variant="ghost" disabled className="text-[10px] uppercase tracking-wider">Pendente</Button>
                ) : user ? (
                  <Button size="sm" onClick={() => handleJoin(g.id)} className="text-[10px] uppercase tracking-wider">Pedir entrada</Button>
                ) : (
                  <Link to="/auth"><Button size="sm" variant="ghost" className="text-[10px] uppercase tracking-wider">Entrar</Button></Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Groups;