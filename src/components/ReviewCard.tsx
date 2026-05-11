import { Heart, MessageCircle, Share2, Star, ChevronDown, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReviewCardProps {
  ratingId: string;
  authorId: string;
  authorUsername: string;
  userName: string;
  userInitials: string;
  gradientFrom: string;
  gradientTo: string;
  albumName: string;
  artistName: string;
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
  author?: { display_name: string; username: string };
}

const ReviewCard = ({
  ratingId,
  authorId,
  authorUsername,
  userName,
  userInitials,
  gradientFrom,
  gradientTo,
  albumName,
  artistName,
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!commentsOpen) return;
    (async () => {
      const { data } = await supabase
        .from("rating_comments")
        .select("id, body, created_at, user_id")
        .eq("rating_id", ratingId)
        .order("created_at", { ascending: true });
      const list = (data ?? []) as CommentRow[];
      const ids = [...new Set(list.map((c) => c.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, username, display_name").in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        list.forEach((c) => (c.author = map.get(c.user_id) as any));
      }
      setComments(list);
    })();
  }, [commentsOpen, ratingId]);

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
    const { data: prof } = await supabase.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle();
    setComments((prev) => [...prev, { ...(data as CommentRow), author: prof as any }]);
    setCommentCount((c) => c + 1);
    setCommentBody("");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 hover:border-primary/20 transition-all duration-300 group"
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/u/${authorUsername}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate hover:text-primary transition-colors">{userName}</p>
            <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
          </div>
        </Link>
        <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Album info */}
      <div className="flex gap-4">
        <div className="w-20 md:w-28 shrink-0 aspect-square rounded-xl overflow-hidden bg-muted shadow-lg shadow-black/20">
          <img src={imageUrl} loading="lazy" alt={albumName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="font-bold text-base md:text-lg text-foreground truncate leading-tight">{albumName}</h3>
          <p className="text-muted-foreground text-xs mb-2.5">{artistName}</p>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-gradient font-bold text-2xl leading-none">{rating.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground">/10</span>
            <Star className="w-3.5 h-3.5 text-accent fill-accent ml-0.5" />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{reviewText}</p>
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
          onClick={() => setCommentsOpen((v) => !v)}
          className={`flex items-center gap-1.5 transition-colors text-sm ${commentsOpen ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentCount}</span>
        </button>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 text-xs">
                  <Link
                    to={c.author?.username ? `/u/${c.author.username}` : "#"}
                    className="font-semibold text-foreground hover:text-primary transition-colors shrink-0"
                  >
                    {c.author?.display_name ?? "—"}
                  </Link>
                  <p className="text-muted-foreground break-words">{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Seja o primeiro a comentar.</p>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder={user ? "Adicione um comentário..." : "Entre para comentar"}
                disabled={!user || busy}
                maxLength={500}
                className="flex-1 bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/40"
              />
              <button
                onClick={submitComment}
                disabled={!user || busy || !commentBody.trim()}
                className="bg-primary text-primary-foreground rounded-lg px-3 disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default ReviewCard;
