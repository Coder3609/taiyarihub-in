import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, FlaskConical } from "lucide-react";
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
              className="grid grid-cols-2 gap-3"
            >
              {boards.map((board) => (
                <motion.div
                  key={board}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{board}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
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
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {entranceExams.map((exam) => (
                <motion.div
                  key={exam}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{exam}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
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
