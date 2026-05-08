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
  Moon,
  Sun,
  GraduationCap,
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
  question_text_hi?: string | null;
  option_a_hi?: string | null;
  option_b_hi?: string | null;
  option_c_hi?: string | null;
  option_d_hi?: string | null;
}

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked" | "answered-marked";

const Quiz = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId, setNumber } = useParams();
  const { user } = useAuth();
  const { canAccessSet } = useAccessControl();
  const [examStarted, setExamStarted] = useState(false);
  const submitRef = useRef<() => void>();
  const { tabSwitches, isFullscreen, enterFullscreen, exitFullscreen } = useProctoring(examStarted, () => {
    // Auto-submit when user exits fullscreen during exam
    if (submitRef.current) submitRef.current();
  });

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
  const [nightMode, setNightMode] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const startTimeRef = useRef(Date.now());

  // Detect if this is a JEE Advanced exam
  const isJEEAdvanced = useMemo(() => {
    const slug = decodeURIComponent(examSlug || "");
    return slug.toLowerCase().includes("jee-advanced");
  }, [examSlug]);

  // Split questions into sections by category
  const sectionGroups = useMemo(() => {
    if (isJEEAdvanced) {
      // JEE Advanced: Physics, Chemistry, Mathematics
      const physics = questions.filter((q) => q.question_category === "physics");
      const chemistry = questions.filter((q) => q.question_category === "chemistry");
      const mathematics = questions.filter((q) => q.question_category === "mathematics");
      return { physics, chemistry, mathematics };
    }
    return {};
  }, [questions, isJEEAdvanced]);

  const coreQuestions = useMemo(() => {
    if (isJEEAdvanced) return [];
    return questions.filter((q) => q.question_category !== "reasoning");
  }, [questions, isJEEAdvanced]);
  const reasoningQuestions = useMemo(() => {
    if (isJEEAdvanced) return [];
    return questions.filter((q) => q.question_category === "reasoning");
  }, [questions, isJEEAdvanced]);

  // Determine available sections dynamically
  const availableSections = useMemo(() => {
    if (isJEEAdvanced) {
      const sections: { id: string; label: string; icon: string }[] = [];
      if ((sectionGroups.physics?.length || 0) > 0) sections.push({ id: "physics", label: "Physics", icon: "⚛️" });
      if ((sectionGroups.chemistry?.length || 0) > 0) sections.push({ id: "chemistry", label: "Chemistry", icon: "🧪" });
      if ((sectionGroups.mathematics?.length || 0) > 0) sections.push({ id: "mathematics", label: "Mathematics", icon: "📐" });
      if (sections.length === 0) sections.push({ id: "physics", label: "All Questions", icon: "📝" });
      return sections;
    }
    const sections: { id: string; label: string; icon: string }[] = [];
    if (coreQuestions.length > 0) sections.push({ id: "core", label: "Core CS", icon: "⚙️" });
    if (reasoningQuestions.length > 0) sections.push({ id: "reasoning", label: "General Aptitude", icon: "🧠" });
    if (sections.length === 0) sections.push({ id: "core", label: "All Questions", icon: "📝" });
    return sections;
  }, [isJEEAdvanced, sectionGroups, coreQuestions, reasoningQuestions]);

  const currentSectionQuestions = useMemo(() => {
    if (isJEEAdvanced) {
      if (activeSection === "chemistry") return sectionGroups.chemistry || [];
      if (activeSection === "mathematics") return sectionGroups.mathematics || [];
      return sectionGroups.physics || [];
    }
    return activeSection === "reasoning" ? reasoningQuestions : coreQuestions;
  }, [isJEEAdvanced, activeSection, sectionGroups, coreQuestions, reasoningQuestions]);

  const sectionIndex = Math.min(currentIndex, currentSectionQuestions.length - 1);
  const currentQ = currentSectionQuestions[sectionIndex];

  // Set initial section for JEE Advanced
  useEffect(() => {
    if (isJEEAdvanced && questions.length > 0 && activeSection === "core") {
      setActiveSection("physics");
    }
  }, [isJEEAdvanced, questions, activeSection]);

  // Mark visited
  useEffect(() => {
    if (currentQ && examStarted) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQ.id));
    }
  }, [currentQ, examStarted]);

  // Check access
  useEffect(() => {
    const setNum = parseInt(setNumber || "1");
    if (!canAccessSet(setNum, examSlug)) navigate(-1);
  }, [canAccessSet, setNumber, navigate, examSlug]);

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
        .select("id, question_number, question_text, option_a, option_b, option_c, option_d, question_type, question_category, source_label, question_text_hi, option_a_hi, option_b_hi, option_c_hi, option_d_hi")
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
    // Only exit fullscreen if we're still in it (don't call if triggered by fullscreen exit)
    if (document.fullscreenElement) exitFullscreen();

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

  // Keep submitRef in sync so proctoring callback always has latest
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

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

  const isHindi = language === "hi";
  const hasHindi = !!(currentQ?.question_text_hi);

  const qText = (isHindi && currentQ?.question_text_hi) ? currentQ.question_text_hi : currentQ?.question_text || "";
  const options = currentQ
    ? [
        { key: "A", text: (isHindi && currentQ.option_a_hi) ? currentQ.option_a_hi : currentQ.option_a },
        { key: "B", text: (isHindi && currentQ.option_b_hi) ? currentQ.option_b_hi : currentQ.option_b },
        { key: "C", text: (isHindi && currentQ.option_c_hi) ? currentQ.option_c_hi : currentQ.option_c },
        { key: "D", text: (isHindi && currentQ.option_d_hi) ? currentQ.option_d_hi : currentQ.option_d },
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

  // Night mode theme
  const t = nightMode ? {
    pageBg: "hsl(222 47% 8%)", pageText: "hsl(210 40% 90%)",
    headerBg: "linear-gradient(135deg, hsl(230 50% 15%), hsl(230 55% 10%))",
    row2Bg: "hsl(222 40% 12%)", row2Text: "hsl(215 20% 65%)",
    sectionBg: "hsl(222 47% 10%)", sectionBorder: "hsl(222 30% 20%)",
    sectionActive: { borderColor: "hsl(38 92% 50%)", color: "hsl(38 92% 60%)", background: "hsl(38 92% 50% / 0.08)" },
    sectionInactive: { borderColor: "transparent", color: "hsl(215 20% 60%)" },
    badgeActive: { background: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 60%)" },
    badgeInactive: { background: "hsl(222 30% 18%)", color: "hsl(215 20% 60%)" },
    infoBarBg: "hsl(222 40% 11%)", infoBarBorder: "hsl(222 30% 20%)",
    mainBg: "hsl(222 47% 9%)",
    questionText: "hsl(210 40% 90%)", questionNum: "hsl(215 20% 65%)",
    optionBorder: "hsl(222 30% 25%)", optionBg: "hsl(222 47% 11%)",
    optionSelectedBorder: "hsl(38 92% 50%)", optionSelectedBg: "hsl(38 92% 50% / 0.1)",
    circleBg: "hsl(222 30% 18%)", circleText: "hsl(215 20% 65%)", circleBorder: "hsl(222 30% 25%)",
    sidebarBg: "hsl(222 47% 10%)", sidebarBorder: "hsl(222 30% 20%)", sidebarCardBg: "hsl(222 47% 11%)",
    footerBg: "hsl(222 40% 10%)", footerBorder: "hsl(222 30% 20%)",
    btnBg: "white", btnBorder: "hsl(222 30% 25%)", btnText: "hsl(215 20% 65%)",
    inputBg: "hsl(222 47% 11%)", inputBorder: "hsl(222 30% 25%)", inputText: "hsl(210 40% 90%)",
    langBtnBg: "hsl(222 47% 12%)", langBtnBorder: "hsl(222 30% 25%)", langBtnText: "hsl(210 40% 85%)",
    timerBg: "hsl(222 47% 15%)", timerText: "hsl(210 40% 90%)", timerBorder: "hsl(222 30% 25%)",
    markBg: "hsl(271 50% 15%)", markText: "hsl(271 72% 70%)", markBorder: "hsl(271 50% 30%)",
    markDefaultBg: "hsl(222 47% 11%)", markDefaultText: "hsl(38 92% 60%)", markDefaultBorder: "hsl(38 92% 50% / 0.3)",
    sourceBg: "hsl(38 92% 50% / 0.1)", sourceBorder: "hsl(38 92% 50% / 0.2)", sourceText: "hsl(38 92% 60%)",
  } : {
    pageBg: "#f0f0f0", pageText: "hsl(222 47% 11%)",
    headerBg: "linear-gradient(135deg, hsl(230 60% 28%), hsl(230 65% 22%))",
    row2Bg: "hsl(230 50% 95%)", row2Text: "hsl(215 20% 45%)",
    sectionBg: "white", sectionBorder: "hsl(220 13% 90%)",
    sectionActive: { borderColor: "hsl(38 92% 50%)", color: "hsl(38 92% 40%)", background: "hsl(38 92% 97%)" },
    sectionInactive: { borderColor: "transparent", color: "hsl(215 20% 45%)" },
    badgeActive: { background: "hsl(38 92% 93%)", color: "hsl(38 92% 40%)" },
    badgeInactive: { background: "hsl(220 13% 91%)", color: "hsl(215 20% 45%)" },
    infoBarBg: "hsl(230 50% 97%)", infoBarBorder: "hsl(220 13% 90%)",
    mainBg: "white",
    questionText: "hsl(222 47% 11%)", questionNum: "hsl(215 20% 45%)",
    optionBorder: "hsl(220 13% 80%)", optionBg: "white",
    optionSelectedBorder: "hsl(38 92% 50%)", optionSelectedBg: "hsl(38 92% 97%)",
    circleBg: "hsl(220 13% 95%)", circleText: "hsl(215 20% 45%)", circleBorder: "hsl(220 13% 80%)",
    sidebarBg: "hsl(230 50% 98%)", sidebarBorder: "hsl(220 13% 90%)", sidebarCardBg: "white",
    footerBg: "hsl(230 50% 97%)", footerBorder: "hsl(220 13% 90%)",
    btnBg: "white", btnBorder: "hsl(220 13% 80%)", btnText: "hsl(215 20% 45%)",
    inputBg: "white", inputBorder: "hsl(220 13% 80%)", inputText: "hsl(222 47% 11%)",
    langBtnBg: "white", langBtnBorder: "hsl(220 13% 80%)", langBtnText: "hsl(222 47% 11%)",
    timerBg: "hsl(222 47% 11%)", timerText: "white", timerBorder: "hsl(222 47% 11%)",
    markBg: "hsl(271 90% 95%)", markText: "hsl(271 72% 45%)", markBorder: "hsl(271 72% 75%)",
    markDefaultBg: "white", markDefaultText: "hsl(38 92% 50%)", markDefaultBorder: "hsl(38 92% 50% / 0.3)",
    sourceBg: "hsl(38 92% 50% / 0.1)", sourceBorder: "hsl(38 92% 50% / 0.2)", sourceText: "hsl(38 92% 50%)",
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: t.pageBg, color: t.pageText }}>
      {/* === Top Header === */}
      <header className="shrink-0" style={{ background: isJEEAdvanced ? "linear-gradient(135deg, hsl(25 80% 28%), hsl(0 65% 22%))" : t.headerBg }}>
        {/* Row 1: Branding + Exam Name + User */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              {isJEEAdvanced ? <GraduationCap className="h-4 w-4 text-white" /> : <LayoutGrid className="h-4 w-4 text-white" />}
            </div>
            <div>
              <p className="text-[11px] text-white/60 font-medium tracking-wide">
                {isJEEAdvanced ? "Joint Admission Board (JAB)" : "National Testing Agency"}
              </p>
              <p className="text-xs text-white/80">
                {isJEEAdvanced ? "IIT JEE Advanced — Computer Based Test" : "Computer Based Test"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-white tracking-wide">{examName}</p>
            <p className="text-[11px] text-white/60">
              {isJEEAdvanced
                ? (examSlug?.includes("Paper-1") ? "Paper 1" : examSlug?.includes("Paper-2") ? "Paper 2" : "Session 1")
                : "Session 1"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Night Mode Toggle */}
            <button
              onClick={() => setNightMode(!nightMode)}
              className="p-1.5 rounded-full transition-colors hover:bg-white/10"
              title={nightMode ? "Switch to Light Mode" : "Switch to Night Mode"}
            >
              {nightMode ? <Sun className="h-4 w-4 text-yellow-300" /> : <Moon className="h-4 w-4 text-white/70" />}
            </button>
            <User className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white font-medium">{user?.email?.split("@")[0]}</span>
          </div>
        </div>

        {/* Row 2: Language + Timer + Submit */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10" style={{ background: t.row2Bg }}>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" style={{ color: t.row2Text }} />
            <span className="text-xs" style={{ color: t.row2Text }}>View in:</span>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: t.langBtnBorder }}>
              <button
                onClick={() => setLanguage("en")}
                className="text-xs font-medium px-2.5 py-1 transition-all"
                style={language === "en"
                  ? { background: "hsl(230 60% 45%)", color: "white" }
                  : { background: t.langBtnBg, color: t.langBtnText }
                }
              >
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className="text-xs font-medium px-2.5 py-1 transition-all"
                style={language === "hi"
                  ? { background: "hsl(230 60% 45%)", color: "white" }
                  : { background: t.langBtnBg, color: t.langBtnText }
                }
              >
                हिन्दी
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4" style={{ color: t.row2Text }} />
            <span className="text-xs font-medium" style={{ color: t.row2Text }}>Time Left:</span>
            <div className="font-mono text-base font-bold px-4 py-1.5 rounded-lg border-2" style={
              timeLeft < 300
                ? { background: "hsl(0 84% 95%)", color: "hsl(0 84% 50%)", borderColor: "hsl(0 84% 80%)" }
                : { background: t.timerBg, color: t.timerText, borderColor: t.timerBorder }
            }>
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
        <div className="flex items-center px-4 border-t" style={{ background: t.sectionBg, borderColor: t.sectionBorder }}>
          <span className="text-[11px] mr-3 font-semibold tracking-wider uppercase" style={{ color: t.row2Text }}>Sections</span>
          {availableSections.map((sec) => {
            const secQuestions = sec.id === "reasoning" ? reasoningQuestions : coreQuestions;
            const answeredCount = secQuestions.filter((q) => answers[q.id]).length;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => switchSection(sec.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-[3px] transition-all"
                style={isActive ? t.sectionActive : t.sectionInactive}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={isActive ? t.badgeActive : t.badgeInactive}>
                  {answeredCount}/{secQuestions.length}
                </span>
              </button>
            );
          })}

          {/* Fullscreen button */}
          {!isFullscreen && (
            <button onClick={enterFullscreen} className="ml-auto p-1.5 rounded hover:bg-white/10 transition-colors">
              <Maximize className="h-4 w-4" style={{ color: t.row2Text }} />
            </button>
          )}
        </div>

        {/* Row 4: Question Info Bar */}
        {currentQ && (
          <div className="flex items-center justify-between px-4 py-2 border-t" style={{ background: t.infoBarBg, borderColor: t.infoBarBorder }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium" style={{ color: t.row2Text }}>Question No.</span>
              <span className="text-xs font-bold text-white w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(230 60% 45%)" }}>
                {sectionIndex + 1}
              </span>
              <span className="text-xs" style={{ color: t.row2Text }}>of {currentSectionQuestions.length}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span style={{ color: t.row2Text }}>
                Marks: <span className="font-bold" style={{ color: "hsl(142 72% 40%)" }}>+4</span>{" "}
                <span className="font-bold" style={{ color: "hsl(0 84% 50%)" }}>-1</span>
              </span>
              <span className="font-semibold px-2.5 py-1 rounded" style={{ color: t.pageText, background: nightMode ? "hsl(222 30% 18%)" : "hsl(220 13% 91%)" }}>
                {currentQ.question_type === "integer"
                  ? "Numerical"
                  : currentQ.question_type === "msq"
                  ? "Multiple Select"
                  : "Single Choice"}
              </span>
            </div>

            {tabSwitches > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "hsl(0 84% 95%)", color: "hsl(0 84% 50%)", border: "1px solid hsl(0 84% 85%)" }}>
                <Eye className="h-3 w-3" /> {tabSwitches}
              </span>
            )}
          </div>
        )}
      </header>

      {/* === Main Content Area === */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto" style={{ background: t.mainBg }}>
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
                    <div className="inline-block mb-3 px-2.5 py-1 rounded-md border text-[11px] font-semibold" style={{ background: t.sourceBg, borderColor: t.sourceBorder, color: t.sourceText }}>
                      {currentQ.source_label}
                    </div>
                  )}
                  <p className="text-sm md:text-[15px] leading-relaxed mb-8" style={{ color: t.questionText }}>
                    <span className="font-semibold" style={{ color: t.questionNum }}>Q{sectionIndex + 1}.</span>{" "}
                    {qText}
                  </p>

                  {currentQ.question_type === "integer" ? (
                    <div className="space-y-3">
                      <label className="text-sm" style={{ color: t.row2Text }}>Enter your numerical answer:</label>
                      <Input
                        type="number"
                        placeholder="Type your answer..."
                        value={answers[currentQ.id] || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                        className="max-w-xs text-lg font-mono"
                        style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.inputText }}
                      />
                    </div>
                  ) : currentQ.question_type === "msq" ? (
                    <div className="space-y-3">
                      <p className="text-xs mb-2" style={{ color: t.row2Text }}>Select all correct options</p>
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
                            className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4"
                            style={isSelected
                              ? { borderColor: t.optionSelectedBorder, background: t.optionSelectedBg }
                              : { borderColor: t.optionBorder, background: t.optionBg }
                            }
                          >
                            <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2" style={
                              isSelected ? { background: "hsl(38 92% 50%)", color: "hsl(222 47% 6%)", borderColor: "hsl(38 92% 50%)" } : { background: t.circleBg, color: t.circleText, borderColor: t.circleBorder }
                            }>
                              {isSelected ? <CheckSquare className="h-4 w-4" /> : opt.key}
                            </span>
                            <span className="text-sm" style={{ color: t.questionText }}>{opt.text}</span>
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
                            className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4"
                            style={selected
                              ? { borderColor: t.optionSelectedBorder, background: t.optionSelectedBg }
                              : { borderColor: t.optionBorder, background: t.optionBg }
                            }
                          >
                            <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2" style={
                              selected ? { background: "hsl(38 92% 50%)", color: "hsl(222 47% 6%)", borderColor: "hsl(38 92% 50%)" } : { background: t.circleBg, color: t.circleText, borderColor: t.circleBorder }
                            }>
                              {opt.key}
                            </span>
                            <span className="text-sm" style={{ color: t.questionText }}>{opt.text}</span>
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
        <aside className="hidden md:flex flex-col w-[280px] border-l shrink-0 overflow-y-auto" style={{ background: t.sidebarBg, borderColor: t.sidebarBorder }}>
          {/* User info */}
          <div className="p-4 border-b flex items-center gap-3" style={{ background: t.sidebarCardBg, borderColor: t.sidebarBorder }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: t.circleBg, borderColor: t.circleBorder }}>
              <User className="h-5 w-5" style={{ color: t.row2Text }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: t.pageText }}>{user?.email?.split("@")[0]}</p>
              <p className="text-[11px]" style={{ color: t.row2Text }}>Candidate</p>
            </div>
          </div>

          {/* Status Legend */}
          <div className="p-3 border-b grid grid-cols-2 gap-y-2.5 gap-x-3" style={{ background: t.sidebarCardBg, borderColor: t.sidebarBorder }}>
            {[
              { count: statusCounts["not-visited"], label: "Not Visited", bg: nightMode ? "hsl(210 15% 25%)" : "hsl(210 15% 85%)", text: nightMode ? "hsl(210 10% 70%)" : "hsl(210 10% 40%)", border: "none" },
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
                <span className="text-[10px] leading-tight" style={{ color: t.row2Text }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Question Palette */}
          <div className="p-3 flex-1" style={{ background: t.sidebarCardBg }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: t.sidebarBorder }}>
              <LayoutGrid className="h-3.5 w-3.5" style={{ color: t.row2Text }} />
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: t.row2Text }}>Question Palette</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {currentSectionQuestions.map((q, i) => {
                const status = getStatus(q);
                const isCurrent = i === sectionIndex;
                const paletteStyles: Record<QuestionStatus, { bg: string; text: string; border: string }> = {
                  "not-visited": { bg: nightMode ? "hsl(210 15% 25%)" : "hsl(210 15% 85%)", text: nightMode ? "hsl(210 10% 70%)" : "hsl(210 10% 30%)", border: "none" },
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
          <div className="p-3 border-t" style={{ background: t.sidebarCardBg, borderColor: t.sidebarBorder }}>
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
      <footer className="shrink-0 border-t" style={{ background: t.footerBg, borderColor: t.footerBorder }}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMark}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all"
              style={markedForReview.has(currentQ?.id || "")
                ? { background: t.markBg, color: t.markText, borderColor: t.markBorder }
                : { background: t.markDefaultBg, color: t.markDefaultText, borderColor: t.markDefaultBorder }
              }
            >
              <Star className="h-3.5 w-3.5" />
              Mark for Review
            </button>
            <button
              onClick={clearResponse}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all"
              style={{ borderColor: t.btnBorder, background: nightMode ? t.sidebarCardBg : t.btnBg, color: t.btnText }}
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
              style={nightMode ? { background: t.sidebarCardBg, borderColor: t.btnBorder, color: t.pageText } : {}}
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
