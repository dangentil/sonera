import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "follow" | "like" | "comment";
  actor_id: string;
  rating_id: string | null;
  read_at: string | null;
  created_at: string;
  actor?: { username: string; display_name: string; avatar_url: string | null };
}

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "agora";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
};

const verb = (t: Notification["type"]) =>
  t === "follow" ? "começou a te seguir" : t === "like" ? "curtiu sua avaliação" : "comentou sua avaliação";

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 1).join("").toUpperCase() || "U";

const NotificationsBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const channelRef = useRef<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, type, actor_id, rating_id, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const list = (data ?? []) as Notification[];
    const ids = [...new Set(list.map((n) => n.actor_id))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      list.forEach((n) => (n.actor = map.get(n.actor_id) as any));
    }
    setItems(list);
    setUnread(list.filter((n) => !n.read_at).length);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onOpenChange = async (v: boolean) => {
    setOpen(v);
    if (v && unread > 0 && user) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
      setUnread(0);
      setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground w-8 h-8">
          <Bell className="w-4 h-4" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-primary text-[9px] text-primary-foreground font-bold flex items-center justify-center"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-card border-border/60">
        <div className="px-3 py-2 border-b border-border/40">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Notificações</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Nada por aqui ainda.</p>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                to={n.actor?.username ? `/u/${n.actor.username}` : "/"}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 ${
                  !n.read_at ? "bg-primary/5" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                  {n.actor?.avatar_url ? (
                    <img src={n.actor.avatar_url} alt={n.actor.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {initials(n.actor?.display_name ?? "U")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug">
                    <span className="font-semibold">{n.actor?.display_name ?? "Alguém"}</span>{" "}
                    <span className="text-muted-foreground">{verb(n.type)}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
