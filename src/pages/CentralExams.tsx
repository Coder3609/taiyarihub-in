import { motion } from "framer-motion";
import { ArrowLeft, Shield, Award, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const groups = [
  {
    title: "GROUP A",
    subtitle: "Officer Level",
    icon: Shield,
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-400",
    exams: [
      "UPSC Civil Services Examination (IAS/IPS/IFS/IRS)",
      "UPSC Engineering Services Examination (ESE/IES)",
      "UPSC Combined Defence Services (CDS)",
      "UPSC National Defence Academy (NDA)",
      "UPSC Indian Forest Service (IFoS)",
      "UPSC Central Armed Police Forces (Assistant Commandant)",
      "UPSC Indian Economic Service (IES)",
      "UPSC Indian Statistical Service (ISS)",
      "UPSC Combined Medical Services (CMS)",
      "UPSC Geo-Scientist Examination",
      "GATE (Graduate Aptitude Test in Engineering)",
      "RBI Grade B Officer",
      "NABARD Grade A Officer",
      "AFCAT (Air Force Common Admission Test)",
      "Indian Coast Guard Assistant Commandant",
    ],
  },
  {
    title: "GROUP B",
    subtitle: "Gazetted / Inspector Level",
    icon: Award,
    color: "from-slate-400/20 to-slate-500/5",
    borderColor: "border-slate-400/30",
    badgeColor: "bg-slate-400/10 text-slate-300",
    exams: [
      "SSC Combined Graduate Level (SSC CGL)",
      "SSC Central Police Organization (SSC CPO)",
      "SSC Junior Engineer (SSC JE)",
      "SSC Stenographer Grade B",
      "IBPS Probationary Officer (IBPS PO)",
      "SBI Probationary Officer (SBI PO)",
      "IBPS Specialist Officer (IBPS SO)",
      "RBI Assistant Manager (various)",
      "NABARD Grade B",
      "Assistant Section Officer (through SSC CGL)",
    ],
  },
  {
    title: "GROUP C",
    subtitle: "Clerical / Technical",
    icon: FileText,
    color: "from-orange-500/20 to-orange-600/5",
    borderColor: "border-orange-500/30",
    badgeColor: "bg-orange-500/10 text-orange-400",
    exams: [
      "SSC Combined Higher Secondary Level (SSC CHSL)",
      "SSC Multi-Tasking Staff (SSC MTS)",
      "SSC Stenographer Grade C",
      "SSC Selection Post",
      "IBPS Clerk",
      "SBI Clerk",
      "RBI Assistant",
      "NABARD Assistant",
      "RRB NTPC",
      "RRB ALP (Assistant Loco Pilot)",
      "RRB Technician",
      "India Post GDS",
      "Postal Assistant",
      "Sorting Assistant",
    ],
  },
  {
    title: "GROUP D",
    subtitle: "Entry Level",
    icon: Wrench,
    color: "from-zinc-500/20 to-zinc-600/5",
    borderColor: "border-zinc-500/30",
    badgeColor: "bg-zinc-500/10 text-zinc-300",
    exams: [
      "RRB Group D",
      "SSC Multi-Tasking Staff (MTS – some posts)",
      "Various Central Department Peon recruitments",
      "Safai Karamchari (various central bodies)",
      "Helper / Support Staff (central units)",
    ],
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
              <span className="font-semibold">1-Year: ₹1,799</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-semibold">Lifetime: ₹3,199</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.exams.map((exam) => (
                    <motion.div
                      key={exam}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className={`rounded-lg p-4 bg-gradient-to-br ${group.color} border ${group.borderColor} cursor-pointer transition-shadow hover:shadow-card`}
                    >
                      <p className="text-sm font-medium text-foreground">{exam}</p>
                    </motion.div>
                  ))}
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
