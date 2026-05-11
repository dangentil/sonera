import { Heart, MessageCircle, Share2, Star, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ReviewCardProps {
  userName: string;
  userInitials: string;
  gradientFrom: string;
  gradientTo: string;
  albumName: string;
  artistName: string;
  rating: number;
  reviewText: string;
  likes: number;
  comments: number;
  timeAgo: string;
  imageUrl: string;
  criteria: { name: string; score: number; weight: number }[];
  index?: number;
}

const ReviewCard = ({
  userName,
  userInitials,
  gradientFrom,
  gradientTo,
  albumName,
  artistName,
  rating,
  reviewText,
  likes,
  comments,
  timeAgo,
  imageUrl,
  criteria,
  index = 0,
}: ReviewCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
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
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{userName}</p>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
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
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{comments}</span>
        </button>
      </div>
    </motion.article>
  );
};

export default ReviewCard;
