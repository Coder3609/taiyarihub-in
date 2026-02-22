import { motion } from "framer-motion";
import { ArrowLeft, MapPin, ArrowRight, BookOpen, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { statesWithExams, unionTerritoriesWithExams } from "./StateExams";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StateExamDetail = () => {
  const navigate = useNavigate();
  const { stateSlug } = useParams();

  const allRegions = [...statesWithExams, ...unionTerritoriesWithExams];
  const region = allRegions.find(
    (r) => encodeURIComponent(r.name.replace(/\s+/g, "-")) === stateSlug
  );

  if (!region) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">State/UT not found</h1>
          <Button onClick={() => navigate("/exams/state")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to States
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/exams/state")}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to States
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <MapPin className="inline h-3 w-3 mr-1" />
              {region.name}
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              {region.name} Exams
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {region.exams.length} competitive exams available for {region.name}. Choose an exam and start preparing.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {region.exams.map((exam) => (
              <motion.div
                key={exam}
                variants={item}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => navigate(`/exam/${encodeURIComponent(exam.replace(/\s+/g, "-"))}`)}
                className="rounded-xl p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 cursor-pointer transition-all hover:shadow-card group/card flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 leading-snug">
                    {exam}
                  </h4>
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
                    Start Preparing <ArrowRight className="h-3 w-3" />
                  </span>
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

export default StateExamDetail;
