import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface QuestionReviewProps {
  questions: QuestionDetail[];
  answers: Record<string, string>;
}

const QuestionReview = ({ questions, answers }: QuestionReviewProps) => {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");

  const filtered = questions.filter((q) => {
    const userAnswer = answers[q.id];
    if (filter === "correct") return userAnswer === q.correct_answer;
    if (filter === "incorrect") return userAnswer && userAnswer !== q.correct_answer;
    if (filter === "unanswered") return !userAnswer;
    return true;
  });

  const displayQuestions = showAll ? filtered : filtered.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border/50 bg-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Question Review
        </h3>
        <span className="text-xs text-muted-foreground">{filtered.length} questions</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["all", "correct", "incorrect", "unanswered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setShowAll(false); }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "correct" ? "✓ Correct" : f === "incorrect" ? "✗ Wrong" : "— Skipped"}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {displayQuestions.map((q) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correct_answer;
          const isUnanswered = !userAnswer;
          const optionMap: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                isUnanswered
                  ? "border-border/50 bg-card"
                  : isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-destructive/20 bg-destructive/5"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold bg-secondary text-muted-foreground">
                  {q.question_number}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground leading-relaxed">{q.question_text}</p>
                    {isUnanswered ? (
                      <MinusCircle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
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
                      <span className="flex-1">{optionMap[key]}</span>
                      {isRight && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                      {isUserChoice && !isCorrect && <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-3 ml-10 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
                  <strong className="text-foreground">Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length > 5 && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
          ) : (
            <><ChevronDown className="h-4 w-4 mr-1" /> Show All {filtered.length} Questions</>
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default QuestionReview;
