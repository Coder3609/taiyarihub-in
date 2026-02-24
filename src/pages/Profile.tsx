import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Crown, Shield, BookOpen, Loader2, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  username: string | null;
  gender: string | null;
  preparing_for: string[] | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPaid, isAdmin, loading: accessLoading } = useAccessControl();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, username, gender, preparing_for, created_at")
        .eq("id", user.id)
        .single();

      setProfile(data as ProfileData | null);
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  if (authLoading || loading || accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planLabel = isAdmin ? "Admin" : isPaid ? "Premium" : "Free";
  const planColor = isAdmin
    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
    : isPaid
    ? "bg-primary/10 text-primary border-primary/30"
    : "bg-secondary text-muted-foreground border-border/50";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">My Profile</h1>

            {/* Plan Status Box */}
            <div className={`rounded-2xl border p-5 mb-6 ${planColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <Shield className="h-6 w-6" />
                  ) : isPaid ? (
                    <Crown className="h-6 w-6" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <div>
                    <p className="font-display font-bold text-lg">{planLabel} Plan</p>
                    <p className="text-xs opacity-80">
                      {isPaid || isAdmin
                        ? "Full access to all exam sets"
                        : "First 2 sets free per exam • Upgrade for unlimited access"}
                    </p>
                  </div>
                </div>
                {!isPaid && !isAdmin && (
                  <Button size="sm" onClick={() => navigate("/#pricing")} className="font-display font-semibold">
                    Upgrade
                  </Button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">Details</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/complete-profile")} className="text-primary gap-1">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField icon={<User className="h-4 w-4" />} label="Full Name" value={profile?.full_name || "Not set"} />
                <InfoField icon={<Mail className="h-4 w-4" />} label="Email" value={profile?.email || user?.email || ""} />
                <InfoField icon={<User className="h-4 w-4" />} label="Gender" value={profile?.gender || "Not set"} />
                <InfoField icon={<User className="h-4 w-4" />} label="Member Since" value={memberSince} />
              </div>

              {/* Preparing For */}
              <div className="pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Preparing For</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.preparing_for && profile.preparing_for.length > 0 ? (
                    profile.preparing_for.map((exam) => (
                      <Badge key={exam} variant="secondary" className="text-xs">
                        {exam}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No exams selected</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-muted-foreground">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default Profile;
