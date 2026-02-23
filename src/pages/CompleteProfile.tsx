import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, User, Sparkles } from "lucide-react";

const EXAM_OPTIONS = [
  "UPSC Civil Services (IAS/IPS)",
  "UPSC ESE/IES",
  "UPSC CDS",
  "UPSC NDA",
  "GATE",
  "BARC",
  "ISRO",
  "RBI Grade B",
  "CAT",
  "CA (Foundation/Inter/Final)",
  "SSC CGL",
  "SSC CHSL",
  "SSC CPO",
  "SSC JE",
  "SSC MTS",
  "IBPS PO",
  "IBPS Clerk",
  "SBI PO",
  "SBI Clerk",
  "RBI Assistant",
  "RRB NTPC",
  "RRB Group D",
  "RRB ALP",
  "NABARD Grade A/B",
  "AFCAT",
];

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }

    const checkProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_completed, full_name")
        .eq("id", user.id)
        .single();

      if (data?.profile_completed) {
        navigate("/", { replace: true });
        return;
      }
      if (data?.full_name) setFullName(data.full_name);
      setChecking(false);
    };
    checkProfile();
  }, [user, authLoading, navigate]);

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !gender) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (selectedExams.length === 0) {
      toast({ title: "Select at least one exam", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        gender,
        preparing_for: selectedExams,
        profile_completed: true,
      })
      .eq("id", user!.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Profile completed! 🎉", description: "Welcome to EDUMask" });
    navigate("/", { replace: true });
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">EDUMask</span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us about yourself so we can personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs text-muted-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9"
                required
                maxLength={100}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Gender</Label>
            <div className="flex gap-3">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    gender === g
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-secondary/40 border-border/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Which exams are you preparing for? <span className="text-primary">*</span>
            </Label>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-1.5">
              {EXAM_OPTIONS.map((exam) => (
                <label
                  key={exam}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                    selectedExams.includes(exam)
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={selectedExams.includes(exam)}
                    onCheckedChange={() => toggleExam(exam)}
                  />
                  {exam}
                </label>
              ))}
            </div>
            {selectedExams.length > 0 && (
              <p className="text-[10px] text-primary">{selectedExams.length} exam(s) selected</p>
            )}
          </div>

          <Button type="submit" className="w-full font-display font-semibold" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
