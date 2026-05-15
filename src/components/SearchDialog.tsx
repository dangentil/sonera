import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, User } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

interface AlbumResult {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
}

interface ProfileResult {
  id: string;
  username: string;
  display_name: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [profiles, setProfiles] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setAlbums([]);
      setProfiles([]);
    }
  }, [open]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (!q) {
      setAlbums([]);
      setProfiles([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const pattern = `%${q}%`;
      const [{ data: albumData }, { data: profileData }] = await Promise.all([
        supabase
          .from("albums")
          .select("id, title, artist, cover_url")
          .or(`title.ilike.${pattern},artist.ilike.${pattern}`)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, username, display_name")
          .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
          .limit(5),
      ]);
      setAlbums((albumData as AlbumResult[]) ?? []);
      setProfiles((profileData as ProfileResult[]) ?? []);
      setLoading(false);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <CommandInput
        placeholder="Buscar álbuns ou usuários..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-4 text-center text-xs text-muted-foreground">Buscando...</div>
        )}
        {!loading && query.trim() && albums.length === 0 && profiles.length === 0 && (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        )}
        {albums.length > 0 && (
          <CommandGroup heading="Álbuns">
            {albums.map((a) => (
              <CommandItem
                key={a.id}
                value={`album-${a.id}`}
                onSelect={() => go(`/album/${a.id}`)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                  {a.cover_url ? (
                    <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc3 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.artist}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {profiles.length > 0 && (
          <CommandGroup heading="Usuários">
            {profiles.map((p) => (
              <CommandItem
                key={p.id}
                value={`profile-${p.id}`}
                onSelect={() => go(`/u/${p.username}`)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{p.username}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
