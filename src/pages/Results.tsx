import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Loader2, Share2, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScoreOverview from "@/components/results/ScoreOverview";
import PerformanceMetrics from "@/components/results/PerformanceMetrics";
import QuestionReview from "@/components/results/QuestionReview";

interface ResultData {
  id: string;
  score: number;
  total: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  tab_switches: number;
  answers: Record<string, string>;
  section_type: string;
  set_number: number;
  exam_id: string;
}

interface QuestionDetail {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
}

const Results = () => {
  const { resultId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultData | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [examName, setExamName] = useState("");

  useEffect(() => {
    if (!user) { navigate("/auth", { replace: true }); return; }

    const fetchData = async () => {
      const { data: r } = await supabase
        .from("user_results")
        .select("*")
        .eq("id", resultId)
        .single();

      if (!r) { navigate("/"); return; }
      setResult(r as ResultData);

      // Fetch exam name
      const { data: exam } = await supabase
        .from("exams")
        .select("name, duration_minutes")
        .eq("id", r.exam_id)
        .single();

      if (exam) setExamName(exam.name);

      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", r.exam_id)
        .eq("set_number", r.set_number)
        .order("question_number", { ascending: true });

      setQuestions((qs || []) as QuestionDetail[]);
      setLoading(false);
    };
    fetchData();
  }, [user, resultId, navigate]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const percentage = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground mb-1 -ml-3">
                <Home className="mr-1.5 h-3.5 w-3.5" /> Home
              </Button>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {examName || "Exam"} — Analysis Report
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set {result.set_number} • {result.section_type.toUpperCase()}
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake
              </Button>
            </div>
          </motion.div>

          {/* Score Overview with Pie Chart */}
          <ScoreOverview
            score={result.score}
            total={result.total}
            correctCount={result.correct_count}
            incorrectCount={result.incorrect_count}
            unansweredCount={result.unanswered_count}
            percentage={percentage}
          />

          {/* Performance Metrics */}
          <div className="mt-6">
            <PerformanceMetrics
              timeTakenSeconds={result.time_taken_seconds}
              tabSwitches={result.tab_switches}
              correctCount={result.correct_count}
              incorrectCount={result.incorrect_count}
              unansweredCount={result.unanswered_count}
              total={result.total}
            />
          </div>

          {/* Question Review */}
          <div className="mt-6">
            <QuestionReview
              questions={questions}
              answers={result.answers}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
