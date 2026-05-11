import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProfileView, { ProfileData } from "@/components/ProfileView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, favorite_artists, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as ProfileData | null));
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      {!profile ? (
        <p className="text-xs text-muted-foreground text-center py-20">Carregando...</p>
      ) : (
        <ProfileView profile={profile} onProfileUpdate={setProfile} />
      )}
    </div>
  );
};

export default ProfilePage;
