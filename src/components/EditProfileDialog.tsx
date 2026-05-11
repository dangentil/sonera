import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";

interface Props {
  initial: { display_name: string; bio: string | null; favorite_artists: string[] };
  onSaved: (next: { display_name: string; bio: string; favorite_artists: string[] }) => void;
}

const EditProfileDialog = ({ initial, onSaved }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [artists, setArtists] = useState<string[]>(initial.favorite_artists ?? []);
  const [artistInput, setArtistInput] = useState("");
  const [busy, setBusy] = useState(false);

  const addArtist = () => {
    const v = artistInput.trim();
    if (!v || artists.includes(v) || artists.length >= 5) return;
    setArtists([...artists, v]);
    setArtistInput("");
  };

  const save = async () => {
    if (!user) return;
    if (!displayName.trim() || displayName.length > 60) return toast.error("Nome inválido (1-60 caracteres)");
    if (bio.length > 280) return toast.error("Bio muito longa (máx 280)");
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), bio: bio.trim() || null, favorite_artists: artists })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    onSaved({ display_name: displayName.trim(), bio: bio.trim(), favorite_artists: artists });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-wider gap-1.5 h-8">
          <Pencil className="w-3 h-3" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Nome</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Bio <span className="text-muted-foreground/60">({bio.length}/280)</span>
            </label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} className="min-h-[80px]" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Artistas favoritos ({artists.length}/5)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArtist();
                  }
                }}
                placeholder="ex: Radiohead"
                disabled={artists.length >= 5}
              />
              <Button type="button" onClick={addArtist} disabled={artists.length >= 5} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artists.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border/40 bg-muted/30"
                >
                  {a}
                  <button onClick={() => setArtists(artists.filter((x) => x !== a))} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Button onClick={save} disabled={busy} className="w-full">
            {busy ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;