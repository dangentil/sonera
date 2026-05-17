import { Heart, MessageCircle, Share2, Star, ChevronDown, Send, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewCardProps {
  ratingId: string;
  authorId: string;
  authorUsername: string;
  userName: string;
  userInitials: string;
  avatarUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  albumName: string;
  artistName: string;
  albumId?: string;
  rating: number;
  reviewText: string;
  initialLikes: number;
  initialLiked: boolean;
  initialComments: number;
  timeAgo: string;
  imageUrl: string;
  criteria: { name: string; score: number; weight: number }[];
  index?: number;
}

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author?: { display_name: string; username: string; avatar_url: string | null };
}

const relativeTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
};

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

const ReviewCard = ({
  ratingId,
  authorId,
  authorUsername,
  userName,
  userInitials,
  avatarUrl,
  gradientFrom,
  gradientTo,
  albumName,
  artistName,
  albumId,
  rating,
  reviewText,
  initialLikes,
  initialLiked,
  initialComments,
  timeAgo,
  imageUrl,
  criteria,
  index = 0,
}: ReviewCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [deleted, setDeleted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(reviewText);
  const [editScore, setEditScore] = useState(rating);
  const [currentText, setCurrentText] = useState(reviewText);
  const [currentScore, setCurrentScore] = useState(rating);
  const [editBusy, setEditBusy] = useState(false);

  useEffect(() => {
    if (!sheetOpen || loaded) return;
    (async () => {
      const { data } = await supabase
        .from("rating_comments")
        .select("id, body, created_at, user_id")
        .eq("rating_id", ratingId)
        .order("created_at", { ascending: true });
      const list = (data ?? []) as CommentRow[];
      const ids = [...new Set(list.map((c) => c.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        list.forEach((c) => (c.author = map.get(c.user_id) as any));
      }
      setComments(list);
      setLoaded(true);
    })();
  }, [sheetOpen, loaded, ratingId]);

  useEffect(() => {
    if (sheetOpen && loaded) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [sheetOpen, loaded, comments.length]);

  const handleLike = async () => {
    if (!user) return navigate("/auth");
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    const { error } = next
      ? await supabase.from("rating_likes").insert({ rating_id: ratingId, user_id: user.id })
      : await supabase.from("rating_likes").delete().eq("rating_id", ratingId).eq("user_id", user.id);
    if (error) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      toast.error("Não foi possível curtir");
      return;
    }
    if (next && authorId && user.id !== authorId) {
      supabase.from("notifications").insert({
        user_id: authorId,
        actor_id: user.id,
        type: "like" as const,
        rating_id: ratingId,
      }).then();
    }
  };

  const submitComment = async () => {
    if (!user) return navigate("/auth");
    const body = commentBody.trim();
    if (!body) return;
    if (body.length > 500) return toast.error("Comentário muito longo");
    setBusy(true);
    const { data, error } = await supabase
      .from("rating_comments")
      .insert({ rating_id: ratingId, user_id: user.id, body })
      .select("id, body, created_at, user_id")
      .single();
    setBusy(false);
    if (error || !data) return toast.error("Erro ao comentar");
    const { data: prof } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    const newComment = { ...(data as CommentRow), author: prof as any };
    setComments((prev) => [...prev, newComment]);
    setCommentCount((c) => c + 1);
    setCommentBody("");
    if (authorId && user.id !== authorId) {
      supabase.from("notifications").insert({
        user_id: authorId,
        actor_id: user.id,
        type: "comment" as const,
        rating_id: ratingId,
      }).then();
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    const { error } = await supabase.from("ratings").delete().eq("id", ratingId);
    setDeleteBusy(false);
    if (error) return toast.error("Não foi possível excluir");
    setDeleteDialogOpen(false);
    setDeleted(true);
    toast.success("Avaliação excluída");
  };

  const handleEdit = async () => {
    if (editScore < 0 || editScore > 10) return toast.error("Nota deve estar entre 0 e 10");
    setEditBusy(true);
    const { error } = await supabase
      .from("ratings")
      .update({ review_text: editText.trim() || null, weighted_score: editScore })
      .eq("id", ratingId);
    setEditBusy(false);
    if (error) return toast.error("Não foi possível salvar");
    setCurrentText(editText.trim());
    setCurrentScore(editScore);
    setEditDialogOpen(false);
    toast.success("Avaliação atualizada");
  };

  if (deleted) return null;

  const isAuthor = user?.id === authorId;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 hover:border-primary/20 transition-all duration-300 group"
      >
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/u/${authorUsername}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                  style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                >
                  {userInitials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate hover:text-primary transition-colors">{userName}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditText(currentText);
                      setEditScore(currentScore);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Editar review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Excluir review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Album info */}
        <div className="flex gap-4">
          <div className="w-20 md:w-28 shrink-0 aspect-square rounded-xl overflow-hidden bg-muted shadow-lg shadow-black/20">
            <img src={imageUrl} loading="lazy" alt={albumName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            {albumId ? (
              <Link to={`/album/${albumId}`} className="font-bold text-base md:text-lg text-foreground truncate leading-tight hover:text-primary transition-colors block">{albumName}</Link>
            ) : (
              <h3 className="font-bold text-base md:text-lg text-foreground truncate leading-tight">{albumName}</h3>
            )}
            <p className="text-muted-foreground text-xs mb-2.5">{artistName}</p>
            <div className="flex items-baseline gap-1.5 mb-2.5">
              <span className="text-gradient font-bold text-2xl leading-none">{currentScore.toFixed(2)}</span>
              <span className="text-[10px] text-muted-foreground">/10</span>
              <Star className="w-3.5 h-3.5 text-accent fill-accent ml-0.5" />
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{currentText}</p>
          </div>
        </div>

        {/* Criteria breakdown — collapsible */}
        <div className="mt-4">
          <button
            onClick={() => setCriteriaOpen(!criteriaOpen)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${criteriaOpen ? "rotate-180" : ""}`} />
            Ver critérios ({criteria.length})
          </button>
          {criteriaOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1"
            >
              {criteria.map((c) => (
                <div key={c.name} className="flex items-center justify-between bg-muted/30 rounded-md px-2 py-1">
                  <span className="text-[10px] text-muted-foreground truncate mr-1">{c.name}</span>
                  <span className="text-[10px] font-semibold text-foreground">{c.score.toFixed(1)}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-5 pt-3 border-t border-border/40">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors text-sm ${
              liked ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 transition-colors text-sm text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{commentCount}</span>
          </button>
        </div>
      </motion.article>

      {/* Comments Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="px-5 py-4 border-b border-border/40 shrink-0">
            <SheetTitle className="text-sm font-semibold">
              Comentários{commentCount > 0 && <span className="text-muted-foreground font-normal ml-1">({commentCount})</span>}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-4 space-y-4">
              {!loaded && (
                <p className="text-xs text-muted-foreground text-center py-6">Carregando...</p>
              )}
              {loaded && comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Seja o primeiro a comentar.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    {c.author?.avatar_url ? (
                      <img src={c.author.avatar_url} alt={c.author.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                        {c.author?.display_name ? initials(c.author.display_name) : "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Link
                        to={c.author?.username ? `/u/${c.author.username}` : "#"}
                        className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        {c.author?.display_name ?? "—"}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{relativeTime(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{c.body}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="px-5 py-4 border-t border-border/40 shrink-0">
            {user ? (
              <div className="flex gap-2">
                <input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Adicione um comentário..."
                  disabled={busy}
                  maxLength={500}
                  className="flex-1 bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/40"
                />
                <button
                  onClick={submitComment}
                  disabled={busy || !commentBody.trim()}
                  className="bg-primary text-primary-foreground rounded-lg px-3 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                <Link to="/auth" onClick={() => setSheetOpen(false)} className="text-primary hover:underline">Entre</Link>
                {" "}para comentar
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBusy ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Nota (0–10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={editScore}
                onChange={(e) => setEditScore(Number(e.target.value))}
                className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Texto da review
              </label>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={2000}
                className="min-h-[100px]"
                placeholder="Escreva sua review..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editBusy}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={editBusy}>
              {editBusy ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewCard;
