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
  Globe,
  ChevronDown,
  FileText,
  HelpCircle,
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
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Split questions into sections by category
  const coreQuestions = useMemo(() => questions.filter((q) => q.question_category !== "reasoning"), [questions]);
  const reasoningQuestions = useMemo(() => questions.filter((q) => q.question_category === "reasoning"), [questions]);

  // Determine available sections dynamically
  const availableSections = useMemo(() => {
    const sections: { id: string; label: string; icon: string }[] = [];
    if (coreQuestions.length > 0) sections.push({ id: "core", label: "Core CS", icon: "⚙️" });
    if (reasoningQuestions.length > 0) sections.push({ id: "reasoning", label: "General Aptitude", icon: "🧠" });
    if (sections.length === 0) sections.push({ id: "core", label: "All Questions", icon: "📝" });
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#f0f0f0" }}>
      {/* === NTA-Style Top Header === */}
      <header className="shrink-0" style={{ background: "linear-gradient(135deg, hsl(230 60% 28%), hsl(230 65% 22%))" }}>
        {/* Row 1: Branding + Exam Name + User */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-white/60 font-medium tracking-wide">National Testing Agency</p>
              <p className="text-xs text-white/80">Computer Based Test</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-white tracking-wide">{examName}</p>
            <p className="text-[11px] text-white/60">Session 1</p>
          </div>

          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white font-medium">{user?.email?.split("@")[0]}</span>
          </div>
        </div>

        {/* Row 2: Language + Timer + Submit */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10" style={{ background: "hsl(230 50% 95%)" }}>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">View in:</span>
            <button className="text-xs font-medium text-foreground bg-white border border-border rounded px-2.5 py-1 flex items-center gap-1">
              English <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Time Left:</span>
            <div className={`font-mono text-base font-bold px-4 py-1.5 rounded-lg border-2 ${
              timeLeft < 300
                ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse"
                : "bg-foreground text-background border-foreground"
            }`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="font-semibold text-xs px-5"
            style={{ background: "hsl(0 72% 51%)", color: "white" }}
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Submit Test
          </Button>
        </div>

        {/* Row 3: Section Tabs */}
        <div className="flex items-center px-4 border-t border-border/20" style={{ background: "white" }}>
          <span className="text-[11px] text-muted-foreground mr-3 font-semibold tracking-wider uppercase">Sections</span>
          {availableSections.map((sec) => {
            const secQuestions = sec.id === "reasoning" ? reasoningQuestions : coreQuestions;
            const answeredCount = secQuestions.filter((q) => answers[q.id]).length;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => switchSection(sec.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-[3px] transition-all ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {answeredCount}/{secQuestions.length}
                </span>
              </button>
            );
          })}

          {/* Fullscreen button */}
          {!isFullscreen && (
            <button onClick={enterFullscreen} className="ml-auto p-1.5 rounded hover:bg-muted/50 transition-colors">
              <Maximize className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Row 4: Question Info Bar */}
        {currentQ && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/20" style={{ background: "hsl(230 50% 97%)" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground font-medium">Question No.</span>
              <span className="text-xs font-bold text-white w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(230 60% 45%)" }}>
                {sectionIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground">of {currentSectionQuestions.length}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                Marks: <span className="font-bold" style={{ color: "hsl(142 72% 40%)" }}>+4</span>{" "}
                <span className="font-bold text-destructive">-1</span>
              </span>
              <span className="font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded">
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

      {/* === Main Content Area === */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto" style={{ background: "white" }}>
          <div className="p-6 md:p-8 max-w-3xl">
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
                  <p className="text-sm md:text-[15px] text-foreground leading-relaxed mb-8">
                    <span className="font-semibold text-muted-foreground">Q{sectionIndex + 1}.</span>{" "}
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
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-white hover:border-muted-foreground/30 hover:bg-muted/20"
                            }`}
                          >
                            <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                              isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border"
                            }`}>
                              {isSelected ? <CheckSquare className="h-4 w-4" /> : opt.key}
                            </span>
                            <span className="text-sm text-foreground">{opt.text}</span>
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
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-white hover:border-muted-foreground/30 hover:bg-muted/20"
                            }`}
                          >
                            <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                              selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border"
                            }`}>
                              {opt.key}
                            </span>
                            <span className="text-sm text-foreground">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* === NTA-Style Right Sidebar === */}
        <aside className="hidden md:flex flex-col w-[280px] border-l border-border shrink-0 overflow-y-auto" style={{ background: "hsl(230 50% 98%)" }}>
          {/* User info */}
          <div className="p-4 border-b border-border flex items-center gap-3" style={{ background: "white" }}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.email?.split("@")[0]}</p>
              <p className="text-[11px] text-muted-foreground">Candidate</p>
            </div>
          </div>

          {/* Status Legend */}
          <div className="p-3 border-b border-border grid grid-cols-2 gap-y-2.5 gap-x-3" style={{ background: "white" }}>
            {[
              { count: statusCounts["not-visited"], label: "Not Visited", bg: "hsl(210 15% 85%)", text: "hsl(210 10% 40%)", border: "none" },
              { count: statusCounts["not-answered"], label: "Not Answered", bg: "hsl(0 72% 51%)", text: "white", border: "none" },
              { count: statusCounts.answered, label: "Answered", bg: "hsl(142 72% 40%)", text: "white", border: "none" },
              { count: statusCounts.marked, label: "Marked for Revi...", bg: "hsl(271 72% 55%)", text: "white", border: "none" },
              { count: statusCounts["answered-marked"], label: "Answered & Ma...", bg: "hsl(142 72% 40%)", text: "white", border: "3px solid hsl(271 72% 55%)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ background: item.bg, color: item.text, border: item.border }}
                >
                  {item.count}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Question Palette */}
          <div className="p-3 flex-1" style={{ background: "white" }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">Question Palette</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {currentSectionQuestions.map((q, i) => {
                const status = getStatus(q);
                const isCurrent = i === sectionIndex;
                const paletteStyles: Record<QuestionStatus, { bg: string; text: string; border: string }> = {
                  "not-visited": { bg: "hsl(210 15% 85%)", text: "hsl(210 10% 30%)", border: "none" },
                  "not-answered": { bg: "hsl(0 72% 51%)", text: "white", border: "none" },
                  "answered": { bg: "hsl(142 72% 40%)", text: "white", border: "none" },
                  "marked": { bg: "hsl(271 72% 55%)", text: "white", border: "none" },
                  "answered-marked": { bg: "hsl(142 72% 40%)", text: "white", border: "3px solid hsl(271 72% 55%)" },
                };
                const s = paletteStyles[status];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                      isCurrent ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                    style={{ background: s.bg, color: s.text, border: s.border }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Submit */}
          <div className="p-3 border-t border-border" style={{ background: "white" }}>
            <Button
              className="w-full font-semibold text-sm"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: "hsl(230 60% 45%)", color: "white" }}
            >
              Submit Test
            </Button>
          </div>
        </aside>
      </div>

      {/* === NTA-Style Bottom Action Bar === */}
      <footer className="shrink-0 border-t border-border" style={{ background: "hsl(230 50% 97%)" }}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMark}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                markedForReview.has(currentQ?.id || "")
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : "bg-white text-primary border-primary/30 hover:bg-primary/5"
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              Mark for Review
            </button>
            <button
              onClick={clearResponse}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted/30 transition-all"
            >
              Clear Response
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={sectionIndex === 0}
              className="text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNext}
              disabled={sectionIndex === currentSectionQuestions.length - 1}
              className="text-xs font-semibold px-5"
              style={{ background: "hsl(230 60% 45%)", color: "white" }}
            >
              Save & Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          {/* Mobile submit (md hidden in sidebar) */}
          <div className="md:hidden">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: "hsl(230 60% 45%)", color: "white" }}
              className="text-xs font-semibold"
            >
              Submit Test
            </Button>
          </div>

          {/* Help icon */}
          <button className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
