import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ScrollText, ClipboardList, Building2, BookOpen, ChevronRight, Lock, Crown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const sectionMeta: Record<string, { title: string; icon: React.ElementType; color: string; borderColor: string; badgeColor: string }> = {
  pyqs: { title: "Previous Year Questions (PYQs)", icon: ScrollText, color: "from-blue-500/20 to-blue-600/5", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-400" },
  mocks: { title: "Mock Tests", icon: ClipboardList, color: "from-purple-500/20 to-purple-600/5", borderColor: "border-purple-500/30", badgeColor: "bg-purple-500/10 text-purple-400" },
  institute: { title: "Institute Questions", icon: Building2, color: "from-amber-500/20 to-amber-600/5", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-400" },
  books: { title: "Popular Books Questions", icon: BookOpen, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-400" },
};

const TOTAL_SETS = 45;

const SectionSets = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId, streamId } = useParams();
  const meta = sectionMeta[sectionId || ""] || sectionMeta.pyqs;
  const Icon = meta.icon;
  const examName = decodeURIComponent(examSlug || "").replace(/-/g, " ");
  const basePath = streamId ? `/exam/${examSlug}/stream/${streamId}` : `/exam/${examSlug}`;
  const { user } = useAuth();
  const { canAccessSet, loading: accessLoading } = useAccessControl();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [setNames, setSetNames] = useState<Record<number, string>>({});

  // Fetch custom set names
  useEffect(() => {
    const fetchSetNames = async () => {
      const slug = decodeURIComponent(examSlug || "");
      const { data: exam } = await supabase
        .from("exams")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!exam) return;

      const { data } = await supabase
        .from("exam_set_names")
        .select("set_number, display_name")
        .eq("exam_id", exam.id)
        .eq("section_type", sectionId || "pyqs");

      if (data) {
        const map: Record<number, string> = {};
        data.forEach((row: any) => { map[row.set_number] = row.display_name; });
        setSetNames(map);
      }
    };
    fetchSetNames();
  }, [examSlug, sectionId]);

  const sets = Array.from({ length: TOTAL_SETS }, (_, i) => i + 1);

  const handleSetClick = (num: number) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!canAccessSet(num)) {
      setShowPaywall(true);
      return;
    }
    navigate(`${basePath}/${sectionId}/${num}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-xl ${meta.badgeColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl md:text-3xl font-bold text-foreground">
                  {meta.title}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground capitalize">{examName}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {sets.map((num) => {
              const locked = !user || (!accessLoading && !canAccessSet(num));
              return (
                <motion.div
                  key={num}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  whileHover={locked ? {} : { y: -2, scale: 1.01 }}
                  onClick={() => handleSetClick(num)}
                  className={`rounded-xl p-3.5 bg-gradient-to-br ${meta.color} border ${meta.borderColor} cursor-pointer transition-all flex items-center justify-between group ${
                    locked ? "opacity-60 grayscale" : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${meta.badgeColor}`}>
                      {String(num).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {setNames[num] || `${meta.title.split(" ")[0]} Set ${num}`}
                    </span>
                  </div>
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Paywall Dialog */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Premium Content</DialogTitle>
            <DialogDescription>
              This set is locked. Please upgrade to premium to unlock all 45 sets across every section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm text-muted-foreground">
            <p>✅ First 2 sets are free for registered users</p>
            <p>🔒 Sets 3–45 require a premium subscription</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full font-display font-semibold" disabled>
              Pay & Unlock (Coming Soon)
            </Button>
            <Button variant="ghost" onClick={() => setShowPaywall(false)} className="w-full">
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Register to Practice</DialogTitle>
            <DialogDescription>
              Create a free account to unlock practice sets and track your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm text-muted-foreground">
            <p>✅ Free access to first 2 sets of every section</p>
            <p>📊 Track your scores and progress</p>
            <p>⏱️ Timed exam simulations</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full font-display font-semibold" onClick={() => navigate("/auth")}>
              Sign Up / Sign In
            </Button>
            <Button variant="ghost" onClick={() => setShowLoginPrompt(false)} className="w-full">
              Browse More
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionSets;
