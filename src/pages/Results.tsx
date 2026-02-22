import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, MinusCircle, Clock, Eye, ArrowLeft, Home, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth", { replace: true }); return; }

    const fetch = async () => {
      const { data: r } = await supabase
        .from("user_results")
        .select("*")
        .eq("id", resultId)
        .single();

      if (!r) { navigate("/"); return; }
      setResult(r as ResultData);

      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", r.exam_id)
        .eq("set_number", r.set_number)
        .order("question_number", { ascending: true });

      setQuestions((qs || []) as QuestionDetail[]);
      setLoading(false);
    };
    fetch();
  }, [user, resultId, navigate]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const percentage = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const minutes = Math.floor(result.time_taken_seconds / 60);
  const seconds = result.time_taken_seconds % 60;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-muted-foreground">
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>

          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 mb-6 text-center"
          >
            <Trophy className={`h-12 w-12 mx-auto mb-4 ${percentage >= 70 ? "text-primary" : percentage >= 40 ? "text-amber-400" : "text-destructive"}`} />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {result.score}/{result.total}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{percentage}% Score</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { icon: CheckCircle2, label: "Correct", value: result.correct_count, color: "text-emerald-400" },
                { icon: XCircle, label: "Incorrect", value: result.incorrect_count, color: "text-destructive" },
                { icon: MinusCircle, label: "Unanswered", value: result.unanswered_count, color: "text-muted-foreground" },
                { icon: Clock, label: "Time", value: `${minutes}m ${seconds}s`, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-secondary/50 p-3">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="font-display font-bold text-foreground text-lg">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {result.tab_switches > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-destructive">
                <Eye className="h-3.5 w-3.5" />
                {result.tab_switches} tab switch{result.tab_switches > 1 ? "es" : ""} detected
              </div>
            )}
          </motion.div>

          {/* Detailed review toggle */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show"} Detailed Review
          </Button>

          {/* Detailed review */}
          {showDetails && (
            <div className="space-y-4">
              {questions.map((q) => {
                const userAnswer = result.answers[q.id];
                const isCorrect = userAnswer === q.correct_answer;
                const isUnanswered = !userAnswer;
                const optionMap = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-4 ${
                      isUnanswered
                        ? "border-border/50 bg-card"
                        : isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="shrink-0 text-xs font-bold text-muted-foreground mt-0.5">
                        Q{q.question_number}
                      </span>
                      <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-7">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const isUserChoice = userAnswer === key;
                        const isRight = q.correct_answer === key;
                        return (
                          <div
                            key={key}
                            className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                              isRight
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : isUserChoice && !isCorrect
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-border/30 text-muted-foreground"
                            }`}
                          >
                            <span className="font-bold">{key}.</span>
                            {optionMap[key]}
                            {isRight && <CheckCircle2 className="h-3.5 w-3.5 ml-auto shrink-0" />}
                            {isUserChoice && !isCorrect && <XCircle className="h-3.5 w-3.5 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && !isCorrect && (
                      <div className="mt-3 ml-7 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
                        <strong className="text-foreground">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
