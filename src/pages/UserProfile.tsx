import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import ProfileView, { ProfileData } from "@/components/ProfileView";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, favorite_artists, created_at, avatar_url")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as ProfileData | null);
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-20">Carregando...</p>
      ) : !profile ? (
        <div className="text-center py-20">
          <p className="text-sm text-muted-foreground mb-3">Usuário não encontrado.</p>
          <Link to="/" className="text-[11px] text-primary uppercase tracking-wider hover:underline">
            Voltar ao feed →
          </Link>
        </div>
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
};

export default UserProfile;
