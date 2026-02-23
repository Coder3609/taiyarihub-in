import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, MinusCircle, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const DetailedAnswers = () => {
  const { resultId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [examName, setExamName] = useState("");
  const [setNumber, setSetNumber] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/auth", { replace: true }); return; }

    const fetchData = async () => {
      const { data: r } = await supabase
        .from("user_results")
        .select("*")
        .eq("id", resultId)
        .single();

      if (!r) { navigate("/"); return; }
      setAnswers((r.answers as Record<string, string>) || {});
      setSetNumber(r.set_number);

      const { data: exam } = await supabase
        .from("exams")
        .select("name")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/results/${resultId}`)}
              className="text-muted-foreground mb-2 -ml-3"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Results
            </Button>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Detailed Solutions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {examName} — Set {setNumber} • {questions.length} Questions
            </p>
          </motion.div>

          {/* All Questions */}
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;
              const isUnanswered = !userAnswer;
              const optionMap: Record<string, string> = {
                A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d,
              };

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`rounded-2xl border p-5 md:p-6 ${
                    isUnanswered
                      ? "border-border/50 bg-card"
                      : isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-destructive/20 bg-destructive/5"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                      {q.question_number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                          {q.question_text}
                        </p>
                        {isUnanswered ? (
                          <MinusCircle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const isUserChoice = userAnswer === key;
                      const isRight = q.correct_answer === key;
                      return (
                        <div
                          key={key}
                          className={`text-sm px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                            isRight
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : isUserChoice && !isCorrect
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-border/30 text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold">{key}.</span>
                          <span className="flex-1">{optionMap[key]}</span>
                          {isRight && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          {isUserChoice && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-4 ml-11 text-sm text-muted-foreground bg-secondary/50 rounded-xl p-4 leading-relaxed">
                      <strong className="text-foreground">Explanation:</strong> {q.explanation}
                    </div>
                  )}

                  {/* Video Solution Link */}
                  <div className="mt-3 ml-11">
                    <button
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={() => {
                        // Placeholder: video_url can be added to questions table later
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q.question_text)}`, "_blank");
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Video Solution
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetailedAnswers;
