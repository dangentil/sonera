import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Camera, Pencil, X } from "lucide-react";

interface Props {
  initial: { display_name: string; bio: string | null; favorite_artists: string[]; avatar_url?: string | null };
  onSaved: (next: { display_name: string; bio: string; favorite_artists: string[]; avatar_url?: string | null }) => void;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

const EditProfileDialog = ({ initial, onSaved }: Props) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [artists, setArtists] = useState<string[]>(initial.favorite_artists ?? []);
  const [artistInput, setArtistInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatar_url ?? null);
  const [busy, setBusy] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Arquivo deve ser uma imagem");
    if (file.size > 3 * 1024 * 1024) return toast.error("Imagem deve ter menos de 3MB");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

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

    let newAvatarUrl: string | null = initial.avatar_url ?? null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        setBusy(false);
        return toast.error("Erro ao fazer upload da foto");
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      newAvatarUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        favorite_artists: artists,
        avatar_url: newAvatarUrl,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    onSaved({ display_name: displayName.trim(), bio: bio.trim(), favorite_artists: artists, avatar_url: newAvatarUrl });
    setAvatarFile(null);
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
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {initials(displayName || "U")}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Clique para alterar foto</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

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
