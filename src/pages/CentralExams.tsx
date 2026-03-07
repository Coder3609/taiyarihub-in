import { motion } from "framer-motion";
import { ArrowLeft, Shield, Award, FileText, Wrench, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ExamInfo {
  name: string;
  questions: string;
  tests: string;
  solutions: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Very Hard";
}

const difficultyColor: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-orange-400",
  "Very Hard": "text-red-400",
};

// Only these exams are available right now
const AVAILABLE_EXAMS = [
  "GATE (Graduate Aptitude Test in Engineering)",
  "BARC (Bhabha Atomic Research Centre)",
  "ISRO (Indian Space Research Organisation)",
  "CAT (Common Admission Test)",
  "CA (Chartered Accountant – Foundation, Inter & Final)",
  "RBI Grade B Officer",
];

const isExamAvailable = (name: string) => AVAILABLE_EXAMS.includes(name);

const groups = [
  {
    title: "GROUP A",
    subtitle: "Officer Level",
    icon: Shield,
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-400",
    exams: [
      { name: "UPSC Civil Services Examination (IAS/IPS/IFS/IRS)", questions: "5,000+", tests: "120+", solutions: "4,500+", difficulty: "Very Hard" },
      { name: "UPSC Engineering Services Examination (ESE/IES)", questions: "3,200+", tests: "80+", solutions: "2,800+", difficulty: "Very Hard" },
      { name: "UPSC Combined Defence Services (CDS)", questions: "2,500+", tests: "60+", solutions: "2,200+", difficulty: "Hard" },
      { name: "UPSC National Defence Academy (NDA)", questions: "2,800+", tests: "65+", solutions: "2,500+", difficulty: "Hard" },
      { name: "UPSC Indian Forest Service (IFoS)", questions: "1,800+", tests: "45+", solutions: "1,500+", difficulty: "Very Hard" },
      { name: "UPSC Central Armed Police Forces (Assistant Commandant)", questions: "1,500+", tests: "40+", solutions: "1,200+", difficulty: "Hard" },
      { name: "UPSC Indian Economic Service (IES)", questions: "1,200+", tests: "35+", solutions: "1,000+", difficulty: "Very Hard" },
      { name: "UPSC Indian Statistical Service (ISS)", questions: "1,000+", tests: "30+", solutions: "800+", difficulty: "Very Hard" },
      { name: "UPSC Combined Medical Services (CMS)", questions: "2,000+", tests: "50+", solutions: "1,800+", difficulty: "Hard" },
      { name: "UPSC Geo-Scientist Examination", questions: "900+", tests: "25+", solutions: "750+", difficulty: "Very Hard" },
      { name: "GATE (Graduate Aptitude Test in Engineering)", questions: "8,000+", tests: "200+", solutions: "7,500+", difficulty: "Hard" },
      { name: "RBI Grade B Officer", questions: "2,000+", tests: "50+", solutions: "1,800+", difficulty: "Hard" },
      { name: "NABARD Grade A Officer", questions: "1,500+", tests: "40+", solutions: "1,300+", difficulty: "Hard" },
      { name: "AFCAT (Air Force Common Admission Test)", questions: "1,800+", tests: "45+", solutions: "1,600+", difficulty: "Medium" },
      { name: "Indian Coast Guard Assistant Commandant", questions: "1,200+", tests: "30+", solutions: "1,000+", difficulty: "Medium" },
      { name: "CAT (Common Admission Test)", questions: "3,500+", tests: "90+", solutions: "3,200+", difficulty: "Very Hard" },
      { name: "CA (Chartered Accountant – Foundation, Inter & Final)", questions: "4,000+", tests: "100+", solutions: "3,500+", difficulty: "Very Hard" },
      { name: "BARC (Bhabha Atomic Research Centre)", questions: "3,000+", tests: "75+", solutions: "2,800+", difficulty: "Very Hard" },
      { name: "ISRO (Indian Space Research Organisation)", questions: "2,500+", tests: "60+", solutions: "2,200+", difficulty: "Very Hard" },
    ] as ExamInfo[],
  },
  {
    title: "GROUP B",
    subtitle: "Gazetted / Inspector Level",
    icon: Award,
    color: "from-slate-400/20 to-slate-500/5",
    borderColor: "border-slate-400/30",
    badgeColor: "bg-slate-400/10 text-slate-300",
    exams: [
      { name: "SSC Combined Graduate Level (SSC CGL)", questions: "6,000+", tests: "150+", solutions: "5,500+", difficulty: "Hard" },
      { name: "SSC Central Police Organization (SSC CPO)", questions: "2,500+", tests: "60+", solutions: "2,200+", difficulty: "Medium" },
      { name: "SSC Junior Engineer (SSC JE)", questions: "3,000+", tests: "70+", solutions: "2,700+", difficulty: "Medium" },
      { name: "SSC Stenographer Grade B", questions: "1,500+", tests: "40+", solutions: "1,300+", difficulty: "Medium" },
      { name: "IBPS Probationary Officer (IBPS PO)", questions: "4,000+", tests: "100+", solutions: "3,600+", difficulty: "Hard" },
      { name: "SBI Probationary Officer (SBI PO)", questions: "4,500+", tests: "110+", solutions: "4,000+", difficulty: "Hard" },
      { name: "IBPS Specialist Officer (IBPS SO)", questions: "2,000+", tests: "50+", solutions: "1,800+", difficulty: "Medium" },
      { name: "RBI Assistant Manager (various)", questions: "1,800+", tests: "45+", solutions: "1,500+", difficulty: "Hard" },
      { name: "NABARD Grade B", questions: "1,200+", tests: "35+", solutions: "1,000+", difficulty: "Hard" },
      { name: "Assistant Section Officer (through SSC CGL)", questions: "1,500+", tests: "40+", solutions: "1,300+", difficulty: "Medium" },
    ] as ExamInfo[],
  },
  {
    title: "GROUP C",
    subtitle: "Clerical / Technical",
    icon: FileText,
    color: "from-orange-500/20 to-orange-600/5",
    borderColor: "border-orange-500/30",
    badgeColor: "bg-orange-500/10 text-orange-400",
    exams: [
      { name: "SSC Combined Higher Secondary Level (SSC CHSL)", questions: "5,000+", tests: "120+", solutions: "4,500+", difficulty: "Medium" },
      { name: "SSC Multi-Tasking Staff (SSC MTS)", questions: "3,000+", tests: "80+", solutions: "2,700+", difficulty: "Easy" },
      { name: "SSC Stenographer Grade C", questions: "1,500+", tests: "40+", solutions: "1,300+", difficulty: "Medium" },
      { name: "SSC Selection Post", questions: "2,000+", tests: "50+", solutions: "1,800+", difficulty: "Medium" },
      { name: "IBPS Clerk", questions: "4,000+", tests: "100+", solutions: "3,600+", difficulty: "Medium" },
      { name: "SBI Clerk", questions: "4,500+", tests: "110+", solutions: "4,000+", difficulty: "Medium" },
      { name: "RBI Assistant", questions: "2,000+", tests: "50+", solutions: "1,800+", difficulty: "Medium" },
      { name: "NABARD Assistant", questions: "1,200+", tests: "30+", solutions: "1,000+", difficulty: "Medium" },
      { name: "RRB NTPC", questions: "5,000+", tests: "130+", solutions: "4,500+", difficulty: "Medium" },
      { name: "RRB ALP (Assistant Loco Pilot)", questions: "3,500+", tests: "90+", solutions: "3,000+", difficulty: "Medium" },
      { name: "RRB Technician", questions: "2,500+", tests: "60+", solutions: "2,200+", difficulty: "Medium" },
      { name: "India Post GDS", questions: "1,500+", tests: "40+", solutions: "1,300+", difficulty: "Easy" },
      { name: "Postal Assistant", questions: "1,800+", tests: "45+", solutions: "1,600+", difficulty: "Easy" },
      { name: "Sorting Assistant", questions: "1,200+", tests: "30+", solutions: "1,000+", difficulty: "Easy" },
    ] as ExamInfo[],
  },
  {
    title: "GROUP D",
    subtitle: "Entry Level",
    icon: Wrench,
    color: "from-zinc-500/20 to-zinc-600/5",
    borderColor: "border-zinc-500/30",
    badgeColor: "bg-zinc-500/10 text-zinc-300",
    exams: [
      { name: "RRB Group D", questions: "5,000+", tests: "120+", solutions: "4,500+", difficulty: "Easy" },
      { name: "SSC Multi-Tasking Staff (MTS – some posts)", questions: "3,000+", tests: "80+", solutions: "2,700+", difficulty: "Easy" },
      { name: "Various Central Department Peon recruitments", questions: "800+", tests: "20+", solutions: "700+", difficulty: "Easy" },
      { name: "Safai Karamchari (various central bodies)", questions: "500+", tests: "15+", solutions: "400+", difficulty: "Easy" },
      { name: "Helper / Support Staff (central units)", questions: "600+", tests: "15+", solutions: "500+", difficulty: "Easy" },
    ] as ExamInfo[],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CentralExams = () => {
  const navigate = useNavigate();

  const handleExamClick = (exam: ExamInfo) => {
    if (isExamAvailable(exam.name)) {
      navigate(`/exam/${exam.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`);
    } else {
      toast.info("Coming Soon! 🚧", {
        description: `${exam.name} is under development. Stay tuned!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">
              Central Government Exams
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              Central Exams Directory
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore all central government competitive exams organized by group level. Choose your target exam and start preparing today.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
              <span className="font-semibold">All Exams: ₹999 for 1.3 Years</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FREE TIER AVAILABLE
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10"
          >
            {groups.map((group) => (
              <motion.div key={group.title} variants={item}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2 rounded-lg ${group.badgeColor}`}>
                    <group.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      {group.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {group.exams.map((exam) => {
                    const available = isExamAvailable(exam.name);
                    return (
                      <motion.div
                        key={exam.name}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleExamClick(exam)}
                        className={`rounded-xl p-4 bg-gradient-to-br ${group.color} border ${group.borderColor} cursor-pointer transition-all hover:shadow-card group/card flex flex-col justify-between ${!available ? "opacity-60" : ""}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                              {exam.name}
                            </h4>
                            {!available && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground whitespace-nowrap">
                                SOON
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 shrink-0" />
                              {exam.questions} Qs
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3 shrink-0" />
                              {exam.tests} Tests
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="h-3 w-3 shrink-0" />
                              {exam.solutions}
                            </span>
                            <span className={`text-[10px] font-semibold ${difficultyColor[exam.difficulty]}`}>
                              {exam.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end pt-2 border-t border-border/30 mt-3">
                          <span className="text-xs text-primary flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                            {available ? "Visit Page" : "Coming Soon"} <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralExams;
