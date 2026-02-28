import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProctoring } from "@/hooks/useProctoring";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Maximize,
  Loader2,
  Eye,
  CheckSquare,
  Star,
  Trash2,
  User,
  LayoutGrid,
} from "lucide-react";
import ExamInstructionsPage from "@/components/ExamInstructionsPage";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_type: "mcq" | "msq" | "integer";
  question_category: string;
  source_label?: string | null;
}

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked" | "answered-marked";

const Quiz = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId, setNumber } = useParams();
  const { user } = useAuth();
  const { canAccessSet } = useAccessControl();
  const [examStarted, setExamStarted] = useState(false);
  const { tabSwitches, isFullscreen, enterFullscreen, exitFullscreen } = useProctoring(examStarted);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("core");
  const startTimeRef = useRef(Date.now());

  // Split questions into sections by category
  const coreQuestions = useMemo(() => questions.filter((q) => q.question_category !== "reasoning"), [questions]);
  const reasoningQuestions = useMemo(() => questions.filter((q) => q.question_category === "reasoning"), [questions]);

  // Determine available sections dynamically
  const availableSections = useMemo(() => {
    const sections: { id: string; label: string }[] = [];
    if (coreQuestions.length > 0) sections.push({ id: "core", label: "Core CS" });
    if (reasoningQuestions.length > 0) sections.push({ id: "reasoning", label: "Reasoning & Aptitude" });
    // Fallback: if no reasoning questions, show all as single section
    if (sections.length === 0) sections.push({ id: "core", label: "All Questions" });
    return sections;
  }, [coreQuestions, reasoningQuestions]);

  const currentSectionQuestions = activeSection === "reasoning" ? reasoningQuestions : coreQuestions;
  const sectionIndex = Math.min(currentIndex, currentSectionQuestions.length - 1);
  const currentQ = currentSectionQuestions[sectionIndex];

  // Mark visited
  useEffect(() => {
    if (currentQ && examStarted) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQ.id));
    }
  }, [currentQ, examStarted]);

  // Check access
  useEffect(() => {
    const setNum = parseInt(setNumber || "1");
    if (!canAccessSet(setNum)) navigate(-1);
  }, [canAccessSet, setNumber, navigate]);

  // Fetch questions
  useEffect(() => {
    if (!user) { navigate("/auth", { replace: true }); return; }

    const fetchQuestions = async () => {
      const slug = decodeURIComponent(examSlug || "");
      const { data: exam } = await supabase
        .from("exams")
        .select("id, duration_minutes, name, total_questions")
        .eq("slug", slug)
        .maybeSingle();

      if (!exam) { setLoading(false); return; }

      setExamId(exam.id);
      setExamName(exam.name);
      setTotalQuestions(exam.total_questions);
      setDurationMinutes(exam.duration_minutes);
      if (exam.duration_minutes) setTimeLeft(exam.duration_minutes * 60);

      const { data: qs } = await supabase
        .from("questions")
        .select("id, question_number, question_text, option_a, option_b, option_c, option_d, question_type, question_category, source_label")
        .eq("exam_id", exam.id)
        .eq("set_number", parseInt(setNumber || "1"))
        .order("question_number", { ascending: true });

      setQuestions((qs as Question[]) || []);
      setLoading(false);
    };
    fetchQuestions();
  }, [user, examSlug, setNumber, navigate]);

  // Timer
  useEffect(() => {
    if (!examStarted || loading || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); handleSubmit(); return 0; }
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
      .select("id, correct_answer, question_type")
      .eq("exam_id", examId)
      .eq("set_number", parseInt(setNumber || "1"));

    let correct = 0, incorrect = 0, unanswered = 0;

    (fullQs || []).forEach((q) => {
      const userAnswer = answers[q.id];
      if (!userAnswer) { unanswered++; }
      else if (q.question_type === "msq") {
        const userSorted = userAnswer.split(",").sort().join(",");
        const correctSorted = q.correct_answer.split(",").sort().join(",");
        if (userSorted === correctSorted) correct++; else incorrect++;
      } else if (q.question_type === "integer") {
        if (userAnswer.trim() === q.correct_answer.trim()) correct++; else incorrect++;
      } else {
        if (userAnswer === q.correct_answer) correct++; else incorrect++;
      }
    });

    const total = fullQs?.length || 0;

    const { data: result } = await supabase
      .from("user_results")
      .insert({
        user_id: user.id, exam_id: examId, set_number: parseInt(setNumber || "1"),
        section_type: sectionId || "pyqs", score: correct, total,
        correct_count: correct, incorrect_count: incorrect, unanswered_count: unanswered,
        answers, time_taken_seconds: timeTaken, tab_switches: tabSwitches,
      })
      .select("id")
      .single();

    navigate(`/results/${result?.id}`, { replace: true });
  }, [submitting, examId, user, answers, setNumber, sectionId, tabSwitches, navigate, exitFullscreen]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  };

  const getStatus = (q: Question): QuestionStatus => {
    const hasAnswer = !!answers[q.id];
    const isMarked = markedForReview.has(q.id);
    const isVisited = visitedQuestions.has(q.id);
    if (hasAnswer && isMarked) return "answered-marked";
    if (isMarked) return "marked";
    if (hasAnswer) return "answered";
    if (isVisited) return "not-answered";
    return "not-visited";
  };

  const statusColors: Record<QuestionStatus, string> = {
    "not-visited": "bg-muted text-muted-foreground",
    "not-answered": "bg-destructive text-destructive-foreground",
    answered: "bg-emerald-500 text-white",
    marked: "bg-purple-500 text-white",
    "answered-marked": "bg-emerald-500 text-white ring-2 ring-purple-400",
  };

  const statusCounts = useMemo(() => {
    const counts: Record<QuestionStatus, number> = { "not-visited": 0, "not-answered": 0, answered: 0, marked: 0, "answered-marked": 0 };
    currentSectionQuestions.forEach((q) => { counts[getStatus(q)]++; });
    return counts;
  }, [currentSectionQuestions, answers, markedForReview, visitedQuestions]);

  const toggleMark = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id); else next.add(currentQ.id);
      return next;
    });
  };

  const clearResponse = () => {
    if (!currentQ) return;
    setAnswers((prev) => { const next = { ...prev }; delete next[currentQ.id]; return next; });
  };

  const handleSaveNext = () => {
    if (sectionIndex < currentSectionQuestions.length - 1) setCurrentIndex(sectionIndex + 1);
  };

  const switchSection = (section: string) => {
    setActiveSection(section);
    setCurrentIndex(0);
  };

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
          <p className="text-muted-foreground text-sm max-w-md">Questions for this set haven't been added yet.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (showInstructions && !examStarted) {
    return (
      <ExamInstructionsPage
        onStart={handleStartExam}
        onCancel={() => navigate(-1)}
        examName={examName}
        totalQuestions={questions.length}
        durationMinutes={durationMinutes}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* === Top Header Bar === */}
      <header className="bg-card border-b border-border/50 shrink-0">
        {/* Row 1: Exam name + Timer + Submit */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Computer Based Test</p>
              <p className="text-sm font-display font-bold text-foreground">{examName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Time Left:</span>
              <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-lg ${
                timeLeft < 300
                  ? "bg-destructive/10 text-destructive animate-pulse"
                  : "bg-secondary text-foreground"
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <Button size="sm" variant="destructive" onClick={handleSubmit} disabled={submitting} className="font-display font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Submit Test
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isFullscreen && (
              <Button variant="ghost" size="icon" onClick={enterFullscreen} className="h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{user?.email?.split("@")[0]}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Section Tabs */}
        <div className="flex items-center px-4 gap-1">
          <span className="text-xs text-muted-foreground mr-2 font-medium">SECTIONS</span>
          {availableSections.map((sec) => {
            const secQuestions = sec.id === "reasoning" ? reasoningQuestions : coreQuestions;
            const answeredCount = secQuestions.filter((q) => answers[q.id]).length;
            return (
              <button
                key={sec.id}
                onClick={() => switchSection(sec.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === sec.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {sec.label}{" "}
                <span className="text-xs ml-1 opacity-70">
                  {answeredCount}/{secQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Question number bar */}
        {currentQ && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-secondary/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Question No.</span>
              <span className="bg-primary text-primary-foreground w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
                {sectionIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground">of {currentSectionQuestions.length}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Marks: <span className="text-emerald-400 font-bold">+2</span>{" "}
                <span className="text-destructive font-bold">-0.67</span>
              </span>
              <span className="text-foreground font-medium">
                {currentQ.question_type === "integer"
                  ? "Numerical"
                  : currentQ.question_type === "msq"
                  ? "Multiple Select"
                  : "Single Choice"}
              </span>
            </div>

            {tabSwitches > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                <Eye className="h-3 w-3" /> {tabSwitches}
              </span>
            )}
          </div>
        )}
      </header>

      {/* === Main Content === */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentQ && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {currentQ.source_label && (
                  <div className="inline-block mb-3 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
                    {currentQ.source_label}
                  </div>
                )}
                <p className="text-sm md:text-base text-foreground leading-relaxed mb-8">
                  <span className="text-muted-foreground font-medium">Q{sectionIndex + 1}.</span>{" "}
                  {currentQ.question_text}
                </p>

                {currentQ.question_type === "integer" ? (
                  <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Enter your numerical answer:</label>
                    <Input
                      type="number"
                      placeholder="Type your answer..."
                      value={answers[currentQ.id] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                      className="max-w-xs text-lg font-mono"
                    />
                  </div>
                ) : currentQ.question_type === "msq" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">Select all correct options</p>
                    {options.map((opt) => {
                      const selectedKeys = (answers[currentQ.id] || "").split(",").filter(Boolean);
                      const isSelected = selectedKeys.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setAnswers((prev) => {
                              const current = (prev[currentQ.id] || "").split(",").filter(Boolean);
                              const updated = isSelected ? current.filter((k) => k !== opt.key) : [...current, opt.key];
                              return { ...prev, [currentQ.id]: updated.sort().join(",") };
                            });
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                              : "border-border/50 bg-card hover:border-border hover:bg-secondary/50"
                          }`}
                        >
                          <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : opt.key}
                          </span>
                          <span className="text-sm text-foreground pt-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
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
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* === Right Sidebar === */}
        <aside className="hidden md:flex flex-col w-72 border-l border-border/50 bg-card shrink-0 overflow-y-auto">
          {/* User info */}
          <div className="p-4 border-b border-border/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.email?.split("@")[0]}</p>
              <p className="text-[10px] text-muted-foreground">Candidate</p>
            </div>
          </div>

          {/* Status summary */}
          <div className="p-4 border-b border-border/30 grid grid-cols-2 gap-2">
            {[
              { count: statusCounts["not-visited"], label: "Not Visited", color: "bg-muted text-muted-foreground" },
              { count: statusCounts["not-answered"], label: "Not Answered", color: "bg-destructive text-destructive-foreground" },
              { count: statusCounts.answered, label: "Answered", color: "bg-emerald-500 text-white" },
              { count: statusCounts.marked, label: "Marked for Review", color: "bg-purple-500 text-white" },
              { count: statusCounts["answered-marked"], label: "Answered & Marked", color: "bg-emerald-500 text-white ring-2 ring-purple-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${item.color}`}>
                  {item.count}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Question Palette */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Question Palette</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {currentSectionQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${statusColors[getStatus(q)]} ${
                    i === sectionIndex ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Submit */}
          <div className="p-4 border-t border-border/30">
            <Button
              className="w-full font-display font-semibold"
              variant="destructive"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit Test
            </Button>
          </div>
        </aside>
      </div>

      {/* === Bottom Action Bar === */}
      <footer className="bg-card border-t border-border/50 px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMark}
              className={`text-xs ${markedForReview.has(currentQ?.id || "") ? "text-purple-400" : "text-primary"}`}
            >
              <Star className="h-4 w-4 mr-1" />
              Mark for Review
            </Button>
            <Button variant="ghost" size="sm" onClick={clearResponse} className="text-xs text-muted-foreground">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Response
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={sectionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button size="sm" onClick={handleSaveNext} disabled={sectionIndex === currentSectionQuestions.length - 1} className="font-display font-semibold">
              Save & Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
