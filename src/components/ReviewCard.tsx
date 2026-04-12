import { Heart, MessageCircle, Share2, Star } from "lucide-react";

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
}: ReviewCardProps) => {
  return (
    <article className="bg-card rounded-xl p-5 md:p-6 border border-border shadow-lg shadow-black/30 hover:border-primary/30 transition-colors duration-300">
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground`}
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          {userInitials}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{userName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Album info */}
      <div className="flex gap-4 md:gap-5">
        <div className="w-24 md:w-32 shrink-0 aspect-square rounded-lg overflow-hidden bg-muted">
          <img src={imageUrl} loading="lazy" alt={albumName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-accent font-bold text-lg md:text-xl truncate">{albumName}</h3>
          <p className="text-muted-foreground text-sm mb-2">{artistName}</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary font-bold text-2xl">{rating.toFixed(1)}</span>
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{reviewText}</p>
        </div>
      </div>

      {/* Criteria breakdown */}
      {/* Criteria breakdown — collapsible */}
      <details className="mt-4 group">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
          Ver critérios ({criteria.length})
        </summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
          {criteria.map((c) => (
            <div key={c.name} className="flex items-center justify-between bg-muted/50 rounded-md px-2.5 py-1">
              <span className="text-[11px] text-muted-foreground truncate mr-1.5">{c.name}</span>
              <span className="text-[11px] font-semibold text-foreground">{c.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-5 pt-3 border-t border-border">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
          <Heart className="w-4 h-4" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
          <MessageCircle className="w-4 h-4" />
          <span>{comments}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};

export default ReviewCard;
