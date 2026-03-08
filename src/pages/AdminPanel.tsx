import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, ShieldCheck, CheckCircle2, RotateCcw, List } from "lucide-react";

interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccessControl();

  const [exams, setExams] = useState<Exam[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [recentQuestions, setRecentQuestions] = useState<{ id: string; question_number: number; question_text: string }[]>([]);

  // Form fields
  const [examId, setExamId] = useState("");
  const [setNumber, setSetNumber] = useState("1");
  const [sectionType, setSectionType] = useState("pyqs");
  const [questionCategory, setQuestionCategory] = useState("core");
  const [questionNumber, setQuestionNumber] = useState("1");
  const [questionType, setQuestionType] = useState("mcq");
  const [sourceLabel, setSourceLabel] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
    if (!authLoading && !accessLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, accessLoading, user, isAdmin, navigate]);

  useEffect(() => {
    const fetchExams = async () => {
      const { data } = await supabase.from("exams").select("id, name, slug, category").order("name");
      setExams(data || []);
    };
    if (isAdmin) fetchExams();
  }, [isAdmin]);

  // Auto-increment question number when exam/set changes
  useEffect(() => {
    if (!examId) return;
    const fetchNext = async () => {
      const { data } = await supabase
        .from("questions")
        .select("question_number")
        .eq("exam_id", examId)
        .eq("set_number", parseInt(setNumber))
        .order("question_number", { ascending: false })
        .limit(1);
      const next = data && data.length > 0 ? data[0].question_number + 1 : 1;
      setQuestionNumber(String(next));
    };
    fetchNext();
  }, [examId, setNumber]);

  const resetQuestionFields = () => {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setExplanation("");
    setQuestionNumber(prev => String(parseInt(prev) + 1));
  };

  const handleSave = async () => {
    if (!examId) {
      toast({ title: "Please select an exam first", variant: "destructive" });
      return;
    }
    if (!questionText.trim()) {
      toast({ title: "Question text is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      exam_id: examId,
      set_number: parseInt(setNumber),
      question_category: questionCategory,
      question_number: parseInt(questionNumber),
      question_type: questionType,
      source_label: sourceLabel.trim() || null,
      question_text: questionText.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      correct_answer: correctAnswer.trim(),
      explanation: explanation.trim() || null,
    };

    const { data, error } = await supabase.from("questions").insert(payload).select("id, question_number, question_text").single();

    if (error) {
      toast({ title: "Error adding question", description: error.message, variant: "destructive" });
    } else {
      setSavedCount(c => c + 1);
      setRecentQuestions(prev => [data, ...prev].slice(0, 5));
      toast({ title: `✅ Q${data.question_number} added!` });
      resetQuestionFields();
    }
    setSaving(false);
  };

  const handleResetAll = () => {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setExplanation("");
    setSourceLabel("");
    setQuestionType("mcq");
    setSavedCount(0);
    setRecentQuestions([]);
  };

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Add Questions</h1>
              <p className="text-sm text-muted-foreground">Simple form — fill & save, repeat.</p>
            </div>
            {savedCount > 0 && (
              <Badge variant="secondary" className="ml-auto text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {savedCount} added
              </Badge>
            )}
          </div>

          {/* Step 1: Select exam & settings */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">① Select Exam & Settings</CardTitle>
              <CardDescription>These stay the same while you add multiple questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Exam *</label>
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger><SelectValue placeholder="Pick an exam..." /></SelectTrigger>
                  <SelectContent>
                    {exams.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Set #</label>
                  <Input type="number" min={1} value={setNumber} onChange={e => setSetNumber(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Section</label>
                  <Select value={sectionType} onValueChange={setSectionType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pyqs">PYQs</SelectItem>
                      <SelectItem value="mocks">Mocks</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select value={questionCategory} onValueChange={setQuestionCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="aptitude">Aptitude</SelectItem>
                      <SelectItem value="reasoning">Reasoning</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Type</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="msq">MSQ</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Source Label (optional)</label>
                <Input placeholder="e.g. GATE 2023, Cormen Ch.5" value={sourceLabel} onChange={e => setSourceLabel(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Question details */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                ② Question Details
                <span className="text-sm font-normal text-muted-foreground">Q#{questionNumber}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Question Text *</label>
                <Textarea
                  rows={4}
                  placeholder="Type or paste your question here..."
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-emerald-400">A</label>
                  <Input placeholder="Option A" value={optionA} onChange={e => setOptionA(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-blue-400">B</label>
                  <Input placeholder="Option B" value={optionB} onChange={e => setOptionB(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-amber-400">C</label>
                  <Input placeholder="Option C" value={optionC} onChange={e => setOptionC(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-rose-400">D</label>
                  <Input placeholder="Option D" value={optionD} onChange={e => setOptionD(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Correct Answer *
                    <span className="text-xs text-muted-foreground ml-1">
                      {questionType === "msq" ? "(e.g. A,C)" : questionType === "integer" ? "(number)" : "(A/B/C/D)"}
                    </span>
                  </label>
                  <Input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Q Number</label>
                  <Input type="number" min={1} value={questionNumber} onChange={e => setQuestionNumber(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Explanation (optional)</label>
                <Textarea
                  rows={2}
                  placeholder="Why is this the correct answer?"
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button onClick={handleSave} disabled={saving || !examId} className="flex-1" size="lg">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save & Next
            </Button>
            <Button variant="outline" onClick={handleResetAll} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          {/* Recently added */}
          {recentQuestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <List className="h-4 w-4" /> Recently Added
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentQuestions.map(q => (
                    <div key={q.id} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="shrink-0 mt-0.5">Q{q.question_number}</Badge>
                      <span className="text-muted-foreground line-clamp-1">{q.question_text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
