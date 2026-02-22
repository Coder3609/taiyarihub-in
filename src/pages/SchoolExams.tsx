import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, FlaskConical, ArrowRight, BookOpen, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const boards = ["CBSE", "ICSE"];

const entranceExams = ["JEE Mains", "JEE Advanced", "NEET PG", "CUET"];

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

  const toSlug = (name: string) => encodeURIComponent(name.replace(/\s+/g, "-"));

  const ExamCard = ({ exam, icon: Icon, color, borderColor, iconColor }: { exam: string; icon: any; color: string; borderColor: string; iconColor: string }) => (
    <motion.div
      variants={item}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={() => navigate(`/exam/${toSlug(exam)}`)}
      className={`rounded-xl p-4 bg-gradient-to-br ${color} border ${borderColor} cursor-pointer transition-all hover:shadow-card group/card flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Icon className={`h-4 w-4 ${iconColor} shrink-0`} />
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
  );

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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              School Level Exams
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              School & Entrance Exams
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Board exams and national-level entrance tests for students.
            </p>
          </motion.div>

          {/* Boards */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Board Exams
                </h2>
                <p className="text-sm text-muted-foreground">National education boards</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {boards.map((board) => (
                <ExamCard key={board} exam={board} icon={GraduationCap} color="from-blue-500/20 to-blue-600/5" borderColor="border-blue-500/30" iconColor="text-blue-400" />
              ))}
            </motion.div>
          </div>

          {/* Entrance Exams */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Entrance Exams
                </h2>
                <p className="text-sm text-muted-foreground">National level entrance tests</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {entranceExams.map((exam) => (
                <ExamCard key={exam} exam={exam} icon={FlaskConical} color="from-orange-500/20 to-orange-600/5" borderColor="border-orange-500/30" iconColor="text-orange-400" />
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
