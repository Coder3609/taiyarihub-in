import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, FlaskConical, ArrowRight, BookOpen, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { TiltCard } from "@/components/ui/TiltCard";

const boards = ["CBSE", "ICSE"];

const entranceExams = ["JEE Mains", "JEE Advanced", "NEET"];

const examStreams: Record<string, string[]> = {
  "CBSE": ["CBSE-Class-9", "CBSE-Class-10", "CBSE-Class-11", "CBSE-Class-12"],
  "ICSE": ["ICSE-Class-9", "ICSE-Class-10", "ICSE-Class-11", "ICSE-Class-12"],
  "JEE-Advanced": ["JEE-Advanced-Paper-1", "JEE-Advanced-Paper-2"]
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const SchoolExams = () => {
  const navigate = useNavigate();
  const [liveSlugs, setLiveSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveExams = async () => {
      try {
        const { data: dbExams } = await supabase.from('exams').select('id, slug');
        const { data: qMappings } = await supabase.from('exam_questions').select('exam_id');
        if (dbExams && qMappings) {
          const activeIds = Array.from(new Set(qMappings.map(m => m.exam_id)));
          const activeExams = dbExams.filter(e => activeIds.includes(e.id));
          setLiveSlugs(activeExams.map(e => e.slug.toLowerCase()));
        }
      } catch (err) {
        console.error("Error fetching live exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveExams();
  }, []);

  const toSlug = (name: string) => name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

  const isAvailable = (name: string) => {
    const slug = toSlug(name);
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug === "cuet") {
      return false;
    }
    if (
      lowerSlug === "jee-mains" || 
      lowerSlug === "jee-advanced" || 
      lowerSlug === "neet" || 
      lowerSlug.startsWith("gate-")
    ) {
      return true;
    }
    if (examStreams[slug]) {
      return examStreams[slug].some(
        streamSlug => 
          streamSlug.toLowerCase().startsWith("gate-") || 
          liveSlugs.includes(streamSlug.toLowerCase()) ||
          ["jee-mains", "jee-advanced", "neet", "jee-advanced-paper-1", "jee-advanced-paper-2"].includes(streamSlug.toLowerCase())
      );
    }
    return liveSlugs.includes(slug.toLowerCase()) || 
      ["jee-mains", "jee-advanced", "neet", "jee-advanced-paper-1", "jee-advanced-paper-2"].includes(slug.toLowerCase());
  };

  const handleClick = (exam: string) => {
    if (isAvailable(exam)) {
      navigate(`/exam/${toSlug(exam)}`);
    } else {
      toast.info("Coming Soon! 🚧", {
        description: `${exam} is under development. Stay tuned!`,
      });
    }
  };

  const ExamCard = ({ 
    exam, 
    icon: Icon, 
    color, 
    borderColor, 
    iconColor,
    hoverGlow,
    accentTextColor
  }: { 
    exam: string; 
    icon: any; 
    color: string; 
    borderColor: string; 
    iconColor: string;
    hoverGlow: string;
    accentTextColor: string;
  }) => {
    const available = isAvailable(exam);
    const isBlue = color.includes("blue");
    const calculatedGlow = available ? (isBlue ? "bg-blue-500/20" : "bg-orange-500/20") : "";
    const cleanBorderHover = borderColor.replace("hover:border-", "group-hover:border-");

    return (
      <TiltCard
        variants={item}
        onClick={() => handleClick(exam)}
        glowClass={calculatedGlow}
        className={`relative border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent ${
          available 
            ? `backdrop-blur-md ${cleanBorderHover}` 
            : "opacity-40 hover:opacity-60 pointer-events-none"
        }`}
      >
        {/* Background container with overflow-hidden */}
        <div className={`absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br ${color} pointer-events-none`} />

        {/* Foreground Content with preserve-3d and translateZ */}
        <div 
          className="relative z-10 p-5 flex flex-col justify-between w-full h-full min-h-[185px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-4.5 w-4.5 ${iconColor} shrink-0`} />
                <h4 className="text-sm font-bold text-white group-hover/card:text-amber-400 transition-colors leading-snug line-clamp-1">
                  {exam}
                </h4>
              </div>
              {!available && (
                <span className="shrink-0 px-2 py-0.5 rounded text-[8px] font-black bg-white/5 border border-white/10 text-slate-400 uppercase tracking-wider">
                  SOON
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                Questions
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                Mock Tests
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400/90 col-span-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                Solutions Included
              </span>
            </div>
          </div>
          <div 
            className="flex items-center justify-end pt-3 border-t border-white/5 mt-4"
            style={{ transform: "translateZ(20px)" }}
          >
            <span className={`text-xs font-bold flex items-center gap-1 transition-all ${
              available ? `${accentTextColor} group-hover/card:translate-x-1` : "text-slate-500"
            }`}>
              {available ? "Start Preparing" : "Coming Soon"} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </TiltCard>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[130px] animate-glow-pulse" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px] animate-glow-pulse" style={{ animationDelay: "2.5s" }} />
      </div>

      <Navbar />
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4 backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(59,130,246,0.1)]">
              School Level Exams
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tight text-white">
              School & <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-orange-400 text-shimmer">Entrance</span> Exams
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Board exams and national-level entrance tests for students.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs md:text-sm bg-white/[0.02] border border-white/5 rounded-full px-4 py-2 backdrop-blur-sm shadow-md">
              <span className="font-bold text-blue-400">All School Exams: ₹999 for 3 Years</span>
            </div>
          </motion.div>

          {/* Boards */}
          <div className="mb-16">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-white/5">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-black text-white tracking-tight">
                  Board Exams
                </h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">National Education Boards</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {boards.map((board) => (
                <ExamCard 
                  key={board} 
                  exam={board} 
                  icon={GraduationCap} 
                  color="from-blue-500/10 via-blue-600/5 to-transparent" 
                  borderColor="hover:border-blue-500/40" 
                  iconColor="text-blue-400" 
                  hoverGlow="hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]"
                  accentTextColor="text-blue-400"
                />
              ))}
            </motion.div>
          </div>

          {/* Entrance Exams */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-white/5">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-black text-white tracking-tight">
                  Entrance Exams
                </h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">National Level Entrance Tests</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {entranceExams.map((exam) => (
                <ExamCard 
                  key={exam} 
                  exam={exam} 
                  icon={FlaskConical} 
                  color="from-orange-500/10 via-orange-600/5 to-transparent" 
                  borderColor="hover:border-orange-500/40" 
                  iconColor="text-orange-400" 
                  hoverGlow="hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.2)]"
                  accentTextColor="text-orange-400"
                />
              ))}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SchoolExams;
