import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  targetUserId: string;
  onChange?: (following: boolean) => void;
  size?: "sm" | "default";
}

const FollowButton = ({ targetUserId, onChange, size = "sm" }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => setFollowing(!!data));
  }, [user, targetUserId]);

  if (user?.id === targetUserId) return null;

  const toggle = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBusy(true);
    const next = !following;
    setFollowing(next);
    onChange?.(next);
    const { error } = next
      ? await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId })
      : await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
    if (error) {
      setFollowing(!next);
      onChange?.(!next);
      toast.error("Não foi possível atualizar");
      setBusy(false);
      return;
    }
    if (next) {
      supabase.from("notifications").insert({
        user_id: targetUserId,
        actor_id: user.id,
        type: "follow" as const,
        rating_id: null,
      }).then();
    }
    setBusy(false);
  };

  return (
    <Button
      size={size}
      onClick={toggle}
      disabled={busy}
      variant={following ? "outline" : "default"}
      className="text-[10px] uppercase tracking-wider h-8 px-3"
    >
      {following ? "Seguindo" : "Seguir"}
    </Button>
  );
};

export default FollowButton;
