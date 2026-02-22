import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProctoring } from "@/hooks/useProctoring";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Maximize, Loader2, Eye } from "lucide-react";
import ExamInstructionsDialog from "@/components/ExamInstructionsDialog";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

const EXAM_DURATION_SECONDS = 60 * 60;

const Quiz = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId, setNumber } = useParams();
  const { user } = useAuth();
  const { canAccessSet } = useAccessControl();
  const [examStarted, setExamStarted] = useState(false);
  const { tabSwitches, isFullscreen, enterFullscreen, exitFullscreen } = useProctoring(examStarted);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [showInstructions, setShowInstructions] = useState(true);
  const startTimeRef = useRef(Date.now());

  // Check access
  useEffect(() => {
    const setNum = parseInt(setNumber || "1");
    if (!canAccessSet(setNum)) {
      navigate(-1);
    }
  }, [canAccessSet, setNumber, navigate]);

  // Fetch questions
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    const fetchQuestions = async () => {
      const slug = decodeURIComponent(examSlug || "");
      const { data: exam } = await supabase
        .from("exams")
        .select("id, duration_minutes, name, total_questions")
        .eq("slug", slug)
        .maybeSingle();

      if (!exam) {
        setLoading(false);
        return;
      }

      setExamId(exam.id);
      setExamName(exam.name);
      setTotalQuestions(exam.total_questions);
      setDurationMinutes(exam.duration_minutes);
      if (exam.duration_minutes) {
        setTimeLeft(exam.duration_minutes * 60);
      }

      const { data: qs } = await supabase
        .from("questions")
        .select("id, question_number, question_text, option_a, option_b, option_c, option_d")
        .eq("exam_id", exam.id)
        .eq("set_number", parseInt(setNumber || "1"))
        .order("question_number", { ascending: true });

      setQuestions(qs || []);
      setLoading(false);
    };

    fetchQuestions();
  }, [user, examSlug, setNumber, navigate]);

  // Timer — only runs after exam starts
  useEffect(() => {
    if (!examStarted || loading || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, loading, questions.length]);

  const handleStartExam = () => {
    setShowInstructions(false);
    setExamStarted(true);
    startTimeRef.current = Date.now();
    enterFullscreen();
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || !examId || !user) return;
    setSubmitting(true);
    exitFullscreen();

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const { data: fullQs } = await supabase
      .from("questions")
      .select("id, correct_answer")
      .eq("exam_id", examId)
      .eq("set_number", parseInt(setNumber || "1"));

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    (fullQs || []).forEach((q) => {
      const userAnswer = answers[q.id];
      if (!userAnswer) unanswered++;
      else if (userAnswer === q.correct_answer) correct++;
      else incorrect++;
    });

    const total = fullQs?.length || 0;

    const { data: result } = await supabase
      .from("user_results")
      .insert({
        user_id: user.id,
        exam_id: examId,
        set_number: parseInt(setNumber || "1"),
        section_type: sectionId || "pyqs",
        score: correct,
        total,
        correct_count: correct,
        incorrect_count: incorrect,
        unanswered_count: unanswered,
        answers,
        time_taken_seconds: timeTaken,
        tab_switches: tabSwitches,
      })
      .select("id")
      .single();

    navigate(`/results/${result?.id}`, { replace: true });
  }, [submitting, examId, user, answers, setNumber, sectionId, tabSwitches, navigate, exitFullscreen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];
  const options = currentQ
    ? [
        { key: "A", text: currentQ.option_a },
        { key: "B", text: currentQ.option_b },
        { key: "C", text: currentQ.option_c },
        { key: "D", text: currentQ.option_d },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto" />
          <h2 className="font-display text-xl font-bold text-foreground">No Questions Yet</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Questions for this set haven't been added yet. They'll appear here once uploaded.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Show instructions popup before exam starts
  if (showInstructions && !examStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ExamInstructionsDialog
          open={true}
          onStart={handleStartExam}
          onCancel={() => navigate(-1)}
          examName={examName}
          totalQuestions={questions.length}
          durationMinutes={durationMinutes}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-display font-bold text-foreground">
              Q {currentIndex + 1}/{questions.length}
            </span>
            {tabSwitches > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                <Eye className="h-3 w-3" /> {tabSwitches} tab switch{tabSwitches > 1 ? "es" : ""}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm font-bold ${
            timeLeft < 300 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-primary/10 text-primary"
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-2">
            {!isFullscreen && (
              <Button variant="ghost" size="sm" onClick={enterFullscreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleSubmit}
              disabled={submitting}
              className="font-display font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-6 leading-relaxed">
              {currentQ.question_text}
            </h2>

            <div className="space-y-3">
              {options.map((opt) => {
                const selected = answers[currentQ.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt.key }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/50 bg-card hover:border-border hover:bg-secondary/50"
                    }`}
                  >
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-sm text-foreground pt-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-md">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                  i === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id]
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
