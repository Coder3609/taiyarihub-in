import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ScrollText, ClipboardList, Building2, BookOpen, ChevronRight, Lock, Crown, LogIn, Clock, HelpCircle } from "lucide-react";
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

const QUOTES = [
  "Believe you can and you're halfway there.",
  "Success is the sum of small efforts.",
  "Dream big. Start small. Act now.",
  "Discipline is the bridge to goals.",
  "Your only limit is your mind.",
  "Push yourself — no one else will.",
  "Progress, not perfection.",
  "Stay hungry, stay foolish.",
  "Hard work beats talent.",
  "Focus. Hustle. Repeat.",
  "One step at a time wins the race.",
  "Doubt kills more dreams than failure.",
  "Be so good they can't ignore you.",
  "Today's pain is tomorrow's power.",
  "Champions keep playing until they win.",
  "You didn't come this far to stop.",
  "Consistency is the key to mastery.",
  "Fall seven times, stand up eight.",
  "The expert was once a beginner.",
  "Make yourself proud.",
  "Winners never quit.",
  "Knowledge is power.",
  "Strive for greatness.",
  "Every question is a chance to learn.",
  "Practice makes permanent.",
  "Aim higher than yesterday.",
  "Persistence guarantees success.",
  "Small progress is still progress.",
  "Believe in the process.",
  "Your future self will thank you.",
  "Stay focused and never give up.",
  "Work hard in silence, let success roar.",
  "Turn obstacles into opportunities.",
  "Embrace the grind.",
  "Great things take time.",
  "Own your journey.",
  "Rise by lifting others.",
  "Be the change you seek.",
  "Effort today, results tomorrow.",
  "Learn. Grow. Conquer.",
  "Nothing worth having comes easy.",
  "Keep going — you're closer than you think.",
  "Excellence is a habit, not an act.",
  "The pain of discipline or the pain of regret.",
  "You are capable of amazing things.",
];

const getQuote = (num: number) => QUOTES[num % QUOTES.length];

interface SetStats {
  total: number;
  mcq: number;
  msq: number;
  integer: number;
}

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
  const [setStats, setSetStats] = useState<Record<number, SetStats>>({});
  const [examDuration, setExamDuration] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const slug = decodeURIComponent(examSlug || "");
      const { data: exam } = await supabase
        .from("exams")
        .select("id, duration_minutes")
        .eq("slug", slug)
        .maybeSingle();
      if (!exam) return;

      setExamDuration(exam.duration_minutes || 0);

      // Fetch set names
      const { data: names } = await supabase
        .from("exam_set_names")
        .select("set_number, display_name")
        .eq("exam_id", exam.id)
        .eq("section_type", sectionId || "pyqs");

      if (names) {
        const map: Record<number, string> = {};
        names.forEach((row: any) => { map[row.set_number] = row.display_name; });
        setSetNames(map);
      }

      // Fetch all questions for this exam to count by set
      const { data: allQ } = await supabase
        .from("questions")
        .select("set_number, question_type")
        .eq("exam_id", exam.id);

      if (allQ) {
        const stats: Record<number, SetStats> = {};
        allQ.forEach((q: any) => {
          if (!stats[q.set_number]) stats[q.set_number] = { total: 0, mcq: 0, msq: 0, integer: 0 };
          stats[q.set_number].total++;
          if (q.question_type === "mcq") stats[q.set_number].mcq++;
          else if (q.question_type === "msq") stats[q.set_number].msq++;
          else if (q.question_type === "integer") stats[q.set_number].integer++;
        });
        setSetStats(stats);
      }
    };
    fetchData();
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
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {sets.map((num) => {
              const locked = !user || (!accessLoading && !canAccessSet(num));
              const stats = setStats[num];
              return (
                <motion.div
                  key={num}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  whileHover={locked ? {} : { y: -4, scale: 1.02 }}
                  onClick={() => handleSetClick(num)}
                  className={`rounded-xl p-4 aspect-square bg-gradient-to-br ${meta.color} border ${meta.borderColor} cursor-pointer transition-all flex flex-col group ${
                    locked ? "opacity-60 grayscale" : "hover:shadow-lg hover:shadow-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${meta.badgeColor}`}>
                      {String(num).padStart(2, "0")}
                    </span>
                    {locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    )}
                  </div>

                  <div className="mt-2 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                      {setNames[num] || `Set ${num}`}
                    </p>
                    <p className="text-[10px] italic text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      "{getQuote(num)}"
                    </p>
                  </div>

                  <div className="mt-auto pt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <HelpCircle className="h-3 w-3 shrink-0" />
                      <span className="text-[11px] font-medium">{stats ? `${stats.total} Qs` : "—"}</span>
                      <span className="text-muted-foreground/40 mx-0.5">•</span>
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="text-[11px] font-medium">{examDuration ? `${examDuration} min` : "—"}</span>
                    </div>
                    {stats && (
                      <div className="flex flex-wrap gap-1">
                        {stats.mcq > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">MCQ {stats.mcq}</span>}
                        {stats.msq > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">MSQ {stats.msq}</span>}
                        {stats.integer > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">NAT {stats.integer}</span>}
                      </div>
                    )}
                  </div>
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
