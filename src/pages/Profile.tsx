import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, User, Mail, Crown, Shield, BookOpen, Loader2, Edit, Camera, ChevronDown, X, Check } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarPicker, { getAvatarSrc } from "@/components/AvatarPicker";

const EXAM_CATEGORIES: { category: string; exams: string[] }[] = [
  {
    category: "Central Govt — Group A (Officer Level)",
    exams: [
      "UPSC Civil Services (IAS/IPS/IFS/IRS)", "UPSC ESE/IES", "UPSC CDS", "UPSC NDA",
      "UPSC IFoS", "UPSC CAPF (Asst. Commandant)", "UPSC Indian Economic Service",
      "UPSC Indian Statistical Service", "UPSC CMS", "UPSC Geo-Scientist",
      "GATE", "RBI Grade B", "NABARD Grade A", "AFCAT",
      "Indian Coast Guard (Asst. Commandant)", "CAT", "CA (Foundation/Inter/Final)",
      "BARC", "ISRO",
    ],
  },
  {
    category: "Central Govt — Group B (Gazetted/Inspector)",
    exams: [
      "SSC CGL", "SSC CPO", "SSC JE", "SSC Stenographer Grade B",
      "IBPS PO", "SBI PO", "IBPS SO", "RBI Assistant Manager", "NABARD Grade B",
    ],
  },
  {
    category: "Central Govt — Group C (Clerical/Technical)",
    exams: [
      "SSC CHSL", "SSC MTS", "SSC Stenographer Grade C", "SSC Selection Post",
      "IBPS Clerk", "SBI Clerk", "RBI Assistant", "NABARD Assistant",
      "RRB NTPC", "RRB ALP", "RRB Technician", "India Post GDS",
      "Postal Assistant", "Sorting Assistant",
    ],
  },
  {
    category: "Central Govt — Group D (Entry Level)",
    exams: ["RRB Group D", "SSC MTS (Group D posts)"],
  },
  {
    category: "School — Board Exams",
    exams: ["CBSE", "ICSE"],
  },
  {
    category: "School — Entrance Exams",
    exams: ["JEE Mains", "JEE Advanced", "NEET PG", "CUET"],
  },
  {
    category: "State Exams",
    exams: ["State PSC", "State Police", "State SSC", "Other State Exams"],
  },
  {
    category: "Foreign Exams",
    exams: ["GRE", "GMAT", "TOEFL", "IELTS", "SAT"],
  },
];

interface ProfileData {
  full_name: string | null;
  email: string | null;
  username: string | null;
  gender: string | null;
  preparing_for: string[] | null;
  avatar_url: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPaid, isAdmin, loading: accessLoading } = useAccessControl();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editExams, setEditExams] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, username, gender, preparing_for, avatar_url, created_at")
      .eq("id", user.id)
      .single();
    setProfile(data as ProfileData | null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    fetchProfile();
  }, [user, authLoading, navigate]);

  const openEdit = () => {
    setEditName(profile?.full_name || "");
    setEditGender(profile?.gender || "");
    setEditExams(profile?.preparing_for || []);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName, gender: editGender, preparing_for: editExams })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("Failed to update profile"); return; }
    toast.success("Profile updated");
    setEditOpen(false);
    fetchProfile();
  };

  const handleAvatarSelect = async (avatarId: string) => {
    if (!user) return;
    setAvatarSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarId })
      .eq("id", user.id);
    setAvatarSaving(false);
    if (error) { toast.error("Failed to update avatar"); return; }
    toast.success("Avatar updated!");
    setAvatarOpen(false);
    fetchProfile();
  };

  const toggleExam = (exam: string) => {
    setEditExams(prev => prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]);
  };

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

  const avatarSrc = getAvatarSrc(profile?.avatar_url);
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
            {/* Avatar + Name Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full border-[3px] border-primary/60 overflow-hidden bg-muted flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => setAvatarOpen(true)}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {profile?.full_name || "My Profile"}
                </h1>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>

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
                <Button variant="ghost" size="sm" onClick={openEdit} className="text-primary gap-1">
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

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email || user?.email || ""} disabled className="opacity-60" />
                    <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={editGender} onValueChange={setEditGender}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preparing For</Label>
                    {editExams.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {editExams.map(exam => (
                          <Badge key={exam} variant="secondary" className="text-xs gap-1 pr-1">
                            {exam}
                            <button type="button" onClick={() => toggleExam(exam)} className="ml-0.5 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-sm font-normal">
                          {editExams.length === 0 ? "Select exams..." : `${editExams.length} exam(s) selected`}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="max-h-64 overflow-y-auto p-2 space-y-3">
                          {EXAM_CATEGORIES.map((cat) => (
                            <div key={cat.category}>
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1 px-2 sticky top-0 bg-popover py-1">
                                {cat.category}
                              </p>
                              {cat.exams.map((exam) => (
                                <button
                                  key={exam}
                                  type="button"
                                  onClick={() => toggleExam(exam)}
                                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
                                    editExams.includes(exam)
                                      ? "bg-primary/10 text-foreground"
                                      : "text-muted-foreground hover:bg-secondary/60"
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    editExams.includes(exam) ? "border-primary bg-primary" : "border-muted-foreground/40"
                                  }`}>
                                    {editExams.includes(exam) && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                  </div>
                                  {exam}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="w-full font-display font-semibold">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Avatar Picker Dialog */}
            <AvatarPicker
              open={avatarOpen}
              onOpenChange={setAvatarOpen}
              currentAvatar={profile?.avatar_url || null}
              onSelect={handleAvatarSelect}
              saving={avatarSaving}
            />
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
