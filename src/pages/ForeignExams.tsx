import { motion } from "framer-motion";
import { ArrowLeft, Globe, GraduationCap, BookOpen, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const admissionExams = [
  "SAT (Scholastic Assessment Test)",
  "ACT (American College Testing)",
  "GRE (Graduate Record Examination)",
  "GMAT (Graduate Management Admission Test)",
  "LSAT India (Law School Admission Test – India)",
  "UCAT (University Clinical Aptitude Test)",
  "BMAT (BioMedical Admissions Test)",
];

const englishProficiency = [
  "IELTS Academic",
  "IELTS General Training",
  "TOEFL iBT",
  "PTE Academic",
  "Duolingo English Test",
  "Cambridge English: C1 Advanced (CAE)",
  "Cambridge English: C2 Proficiency (CPE)",
  "Cambridge English: B2 First (FCE)",
];

const internationalSchool = [
  "Cambridge IGCSE",
  "Cambridge AS Level",
  "Cambridge A Level",
  "International Baccalaureate (IB Diploma Programme)",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const sections = [
  {
    title: "Foreign University Admission Exams",
    subtitle: "Conducted in India",
    icon: Globe,
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/30",
    badgeColor: "bg-purple-500/10 text-purple-400",
    iconColor: "text-purple-400",
    exams: admissionExams,
  },
  {
    title: "English Language Proficiency",
    subtitle: "Required by foreign universities",
    icon: BookOpen,
    color: "from-cyan-500/20 to-cyan-600/5",
    borderColor: "border-cyan-500/30",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
    iconColor: "text-cyan-400",
    exams: englishProficiency,
  },
  {
    title: "School-Level International",
    subtitle: "Foreign curriculum entry",
    icon: GraduationCap,
    color: "from-pink-500/20 to-pink-600/5",
    borderColor: "border-pink-500/30",
    badgeColor: "bg-pink-500/10 text-pink-400",
    iconColor: "text-pink-400",
    exams: internationalSchool,
  },
];

const ForeignExams = () => {
  const navigate = useNavigate();

  const toSlug = (name: string) => name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              Foreign Exams
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              Foreign Exams Directory
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              University admissions, English proficiency, and international school-level exams.
            </p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2 rounded-lg ${section.badgeColor}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                  </div>
                </div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {section.exams.map((exam) => (
                    <motion.div
                      key={exam}
                      variants={item}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => navigate(`/exam/${toSlug(exam)}`)}
                      className={`rounded-xl p-4 bg-gradient-to-br ${section.color} border ${section.borderColor} cursor-pointer transition-all hover:shadow-card group/card flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <section.icon className={`h-4 w-4 ${section.iconColor} shrink-0`} />
                          <h4 className="text-sm font-bold text-foreground leading-snug">{exam}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 shrink-0" />
                            Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 shrink-0" />
                            Mock Tests
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="h-3 w-3 shrink-0" />
                            Solutions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end pt-2 border-t border-border/30 mt-3">
                        <span className="text-xs text-primary flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                          Visit Page <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForeignExams;
