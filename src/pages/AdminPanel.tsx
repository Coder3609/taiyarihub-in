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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Loader2, ShieldCheck, CheckCircle2, RotateCcw, List,
  Database, Upload, FileText, Pencil, Trash2, BookOpen, RefreshCw, AlertTriangle, Radio,
} from "lucide-react";

interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
  duration_minutes: number;
  total_questions: number;
  description: string | null;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccessControl();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const fetchExams = async () => {
    setLoadingExams(true);
    const { data } = await supabase.from("exams").select("*").order("name");
    setExams((data as Exam[]) || []);
    setLoadingExams(false);
  };

  useEffect(() => {
    if (isAdmin) fetchExams();
  }, [isAdmin]);

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
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage exams, questions, and content</p>
            </div>
          </div>

          <Tabs defaultValue="exams" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="exams" className="flex items-center gap-1.5 text-xs py-2.5">
                <Database className="h-3.5 w-3.5" /> Exams
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-1.5 text-xs py-2.5">
                <Upload className="h-3.5 w-3.5" /> Bulk Import
              </TabsTrigger>
              <TabsTrigger value="single" className="flex items-center gap-1.5 text-xs py-2.5">
                <Plus className="h-3.5 w-3.5" /> Add Question
              </TabsTrigger>
              <TabsTrigger value="sets" className="flex items-center gap-1.5 text-xs py-2.5">
                <BookOpen className="h-3.5 w-3.5" /> Set Names
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-1.5 text-xs py-2.5">
                <Radio className="h-3.5 w-3.5" /> Live Tests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exams"><ExamsTab exams={exams} onRefresh={fetchExams} loading={loadingExams} /></TabsContent>
            <TabsContent value="bulk"><BulkImportTab exams={exams} /></TabsContent>
            <TabsContent value="single"><SingleQuestionTab exams={exams} /></TabsContent>
            <TabsContent value="sets"><SetNamesTab exams={exams} /></TabsContent>
            <TabsContent value="live"><LiveTestsTab exams={exams} /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// ========================
// TAB 1: EXAMS MANAGEMENT
// ========================
const ExamsTab = ({ exams, onRefresh, loading }: { exams: Exam[]; onRefresh: () => void; loading: boolean }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", category: "central", duration_minutes: "60", total_questions: "0", description: "" });

  const resetForm = () => {
    setForm({ name: "", slug: "", category: "central", duration_minutes: "60", total_questions: "0", description: "" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (exam: Exam) => {
    setForm({
      name: exam.name,
      slug: exam.slug,
      category: exam.category,
      duration_minutes: String(exam.duration_minutes),
      total_questions: String(exam.total_questions),
      description: exam.description || "",
    });
    setEditing(exam);
    setShowForm(true);
  };

  const autoSlug = (name: string) => name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      duration_minutes: parseInt(form.duration_minutes) || 60,
      total_questions: parseInt(form.total_questions) || 0,
      description: form.description.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("exams").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: `✅ "${payload.name}" updated!` });
    } else {
      const { error } = await supabase.from("exams").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: `✅ "${payload.name}" created!` });
    }

    setSaving(false);
    resetForm();
    onRefresh();
  };

  const handleDelete = async (exam: Exam) => {
    if (!confirm(`Delete "${exam.name}"? This will also delete all its questions.`)) return;
    const { error } = await supabase.from("exams").delete().eq("id", exam.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Deleted "${exam.name}"` }); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">All Exams ({exams.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Exam
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editing ? "Edit Exam" : "Create New Exam"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Name *</label>
                <Input
                  placeholder="e.g. GATE CS"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : autoSlug(e.target.value) }));
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Slug * <span className="text-muted-foreground">(URL-safe)</span></label>
                <Input placeholder="e.g. GATE-CS" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="foreign">Foreign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Duration (min)</label>
                <Input type="number" min={1} value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Total Questions</label>
                <Input type="number" min={0} value={form.total_questions} onChange={(e) => setForm((f) => ({ ...f, total_questions: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                {editing ? "Update" : "Create"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : exams.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No exams yet. Create your first one!</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="outline" className="shrink-0 text-[10px]">{exam.category}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{exam.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      /{exam.slug} · {exam.duration_minutes}min · {exam.total_questions}Q
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(exam)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(exam)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ========================
// TAB 2: BULK IMPORT
// ========================
const BulkImportTab = ({ exams }: { exams: Exam[] }) => {
  const [examId, setExamId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const sampleJson = `[
  {
    "question_number": 1,
    "question_text": "What is the time complexity of binary search?",
    "option_a": "O(n)",
    "option_b": "O(log n)",
    "option_c": "O(n log n)",
    "option_d": "O(1)",
    "correct_answer": "B",
    "question_type": "mcq",
    "question_category": "core",
    "set_number": 1,
    "source_label": "PYQ 2023",
    "explanation": "Binary search halves the search space each step."
  }
]`;

  const handleImport = async () => {
    if (!examId) { toast({ title: "Select an exam first", variant: "destructive" }); return; }

    let questions: any[];
    try {
      questions = JSON.parse(jsonInput);
      if (!Array.isArray(questions)) throw new Error("Must be an array");
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e.message, variant: "destructive" });
      return;
    }

    if (questions.length === 0) { toast({ title: "No questions found in JSON", variant: "destructive" }); return; }
    if (questions.length > 500) { toast({ title: "Max 500 questions per batch", variant: "destructive" }); return; }

    setImporting(true);
    setResult(null);
    const errors: string[] = [];
    let success = 0;

    // Validate and prepare
    const validRows = questions.map((q, i) => {
      if (!q.question_text?.trim()) { errors.push(`Row ${i + 1}: missing question_text`); return null; }
      if (!q.correct_answer?.trim()) { errors.push(`Row ${i + 1}: missing correct_answer`); return null; }
      return {
        exam_id: examId,
        question_number: q.question_number || i + 1,
        question_text: q.question_text.trim(),
        option_a: (q.option_a || "").trim(),
        option_b: (q.option_b || "").trim(),
        option_c: (q.option_c || "").trim(),
        option_d: (q.option_d || "").trim(),
        correct_answer: q.correct_answer.trim(),
        question_type: q.question_type || "mcq",
        question_category: q.question_category || "core",
        set_number: q.set_number || 1,
        source_label: q.source_label || null,
        explanation: q.explanation || null,
      };
    }).filter(Boolean);

    if (validRows.length > 0) {
      // Insert in batches of 50
      for (let i = 0; i < validRows.length; i += 50) {
        const batch = validRows.slice(i, i + 50);
        const { error, data } = await supabase.from("questions").insert(batch as any[]).select("id");
        if (error) {
          errors.push(`Batch ${Math.floor(i / 50) + 1}: ${error.message}`);
        } else {
          success += data?.length || 0;
        }
      }
    }

    setResult({ success, errors });
    setImporting(false);
    if (success > 0) toast({ title: `✅ ${success} questions imported!` });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Bulk Import Questions</CardTitle>
          <CardDescription>Paste a JSON array of questions to import them all at once (max 500 per batch)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block">Target Exam *</label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger><SelectValue placeholder="Select exam..." /></SelectTrigger>
              <SelectContent>
                {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Questions JSON *</label>
            <Textarea
              rows={14}
              placeholder="Paste your JSON array here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleImport} disabled={importing || !examId || !jsonInput.trim()}>
              {importing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              Import {jsonInput.trim() ? `(${(() => { try { return JSON.parse(jsonInput).length; } catch { return "?"; } })()})` : ""}
            </Button>
            <Button variant="outline" onClick={() => setJsonInput(sampleJson)}>
              <FileText className="h-4 w-4 mr-1" /> Load Sample
            </Button>
          </div>

          {result && (
            <Card className={result.errors.length > 0 ? "border-destructive/30" : "border-emerald-500/30"}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold">{result.success} questions imported successfully</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-1 text-destructive text-xs font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" /> {result.errors.length} error(s):
                    </div>
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive/80 pl-5">{err}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">JSON Format Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-[11px] font-mono bg-muted/30 rounded-lg p-3 overflow-x-auto text-muted-foreground">{sampleJson}</pre>
          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p><strong>Required:</strong> question_text, correct_answer</p>
            <p><strong>Optional:</strong> question_number, option_a–d, question_type (mcq/msq/integer), question_category (core/physics/chemistry/mathematics/reasoning), set_number, source_label, explanation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ========================
// TAB 3: SINGLE QUESTION
// ========================
const SingleQuestionTab = ({ exams }: { exams: Exam[] }) => {
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [recentQuestions, setRecentQuestions] = useState<{ id: string; question_number: number; question_text: string }[]>([]);
  const [examId, setExamId] = useState("");
  const [setNumber, setSetNumber] = useState("1");
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
    if (!examId) return;
    const fetchNext = async () => {
      const { data } = await supabase
        .from("questions")
        .select("question_number")
        .eq("exam_id", examId)
        .eq("set_number", parseInt(setNumber))
        .order("question_number", { ascending: false })
        .limit(1);
      setQuestionNumber(String(data && data.length > 0 ? data[0].question_number + 1 : 1));
    };
    fetchNext();
  }, [examId, setNumber]);

  const handleSave = async () => {
    if (!examId) { toast({ title: "Select an exam", variant: "destructive" }); return; }
    if (!questionText.trim()) { toast({ title: "Question text required", variant: "destructive" }); return; }
    setSaving(true);
    const { data, error } = await supabase.from("questions").insert({
      exam_id: examId, set_number: parseInt(setNumber), question_category: questionCategory,
      question_number: parseInt(questionNumber), question_type: questionType,
      source_label: sourceLabel.trim() || null, question_text: questionText.trim(),
      option_a: optionA.trim(), option_b: optionB.trim(), option_c: optionC.trim(), option_d: optionD.trim(),
      correct_answer: correctAnswer.trim(), explanation: explanation.trim() || null,
    }).select("id, question_number, question_text").single();

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setSavedCount((c) => c + 1);
      setRecentQuestions((prev) => [data, ...prev].slice(0, 5));
      toast({ title: `✅ Q${data.question_number} added!` });
      setQuestionText(""); setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
      setCorrectAnswer("A"); setExplanation("");
      setQuestionNumber(String(parseInt(questionNumber) + 1));
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            ① Exam & Settings
            {savedCount > 0 && <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />{savedCount} added</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger><SelectValue placeholder="Pick an exam..." /></SelectTrigger>
            <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className="text-xs font-medium mb-1 block">Set #</label><Input type="number" min={1} value={setNumber} onChange={(e) => setSetNumber(e.target.value)} /></div>
            <div><label className="text-xs font-medium mb-1 block">Category</label>
              <Select value={questionCategory} onValueChange={setQuestionCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem><SelectItem value="aptitude">Aptitude</SelectItem>
                  <SelectItem value="reasoning">Reasoning</SelectItem><SelectItem value="english">English</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem><SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium mb-1 block">Type</label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="mcq">MCQ</SelectItem><SelectItem value="msq">MSQ</SelectItem><SelectItem value="integer">Integer</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium mb-1 block">Q#</label><Input type="number" min={1} value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} /></div>
          </div>
          <Input placeholder="Source label (optional)" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">② Question</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={4} placeholder="Question text..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} />
            <Input placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} />
            <Input placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
            <Input placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium mb-1 block">Correct Answer *</label><Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} /></div>
          </div>
          <Textarea rows={2} placeholder="Explanation (optional)" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="text-sm" />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || !examId} className="w-full" size="lg">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Save & Next
      </Button>

      {recentQuestions.length > 0 && (
        <Card>
          <CardContent className="py-3 space-y-2">
            {recentQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-muted/30">
                <Badge variant="secondary" className="shrink-0">Q{q.question_number}</Badge>
                <span className="text-muted-foreground line-clamp-1">{q.question_text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========================
// TAB 4: SET NAMES
// ========================
const SetNamesTab = ({ exams }: { exams: Exam[] }) => {
  const [examId, setExamId] = useState("");
  const [sectionType, setSectionType] = useState("pyqs");
  const [entries, setEntries] = useState<{ id?: string; set_number: number; display_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNames = async () => {
    if (!examId) return;
    setLoading(true);
    const { data } = await supabase
      .from("exam_set_names")
      .select("id, set_number, display_name")
      .eq("exam_id", examId)
      .eq("section_type", sectionType)
      .order("set_number");
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNames(); }, [examId, sectionType]);

  const addRow = () => {
    const nextNum = entries.length > 0 ? Math.max(...entries.map((e) => e.set_number)) + 1 : 1;
    setEntries([...entries, { set_number: nextNum, display_name: "" }]);
  };

  const handleSaveAll = async () => {
    if (!examId) return;
    setSaving(true);

    // Delete existing and re-insert
    await supabase.from("exam_set_names").delete().eq("exam_id", examId).eq("section_type", sectionType);

    const rows = entries.filter((e) => e.display_name.trim()).map((e) => ({
      exam_id: examId,
      section_type: sectionType,
      set_number: e.set_number,
      display_name: e.display_name.trim(),
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from("exam_set_names").insert(rows);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: `✅ ${rows.length} set names saved!` });
    }
    setSaving(false);
    fetchNames();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manage Set Display Names</CardTitle>
          <CardDescription>Give friendly names to question sets (e.g., "GATE 2023", "Paper 1 — Shift 1")</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Exam</label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger><SelectValue placeholder="Select exam..." /></SelectTrigger>
                <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Section</label>
              <Select value={sectionType} onValueChange={setSectionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pyqs">PYQs</SelectItem><SelectItem value="mocks">Mocks</SelectItem>
                  <SelectItem value="books">Books</SelectItem><SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="space-y-2">
                {entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20"
                      value={entry.set_number}
                      onChange={(e) => { const next = [...entries]; next[i].set_number = parseInt(e.target.value) || 1; setEntries(next); }}
                    />
                    <Input
                      placeholder="Display name..."
                      value={entry.display_name}
                      onChange={(e) => { const next = [...entries]; next[i].display_name = e.target.value; setEntries(next); }}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEntries(entries.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addRow} disabled={!examId}><Plus className="h-3.5 w-3.5 mr-1" /> Add Row</Button>
                <Button size="sm" onClick={handleSaveAll} disabled={saving || !examId}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />} Save All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ========================
// TAB 5: LIVE TESTS
// ========================
interface LiveTestRow {
  id: string;
  exam_slug: string;
  exam_name: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  questions: any[];
  is_published: boolean;
}

const LiveTestsTab = ({ exams }: { exams: Exam[] }) => {
  const [tests, setTests] = useState<LiveTestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LiveTestRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [importExamId, setImportExamId] = useState<string>("");
  const [importSet, setImportSet] = useState<string>("1");
  const [form, setForm] = useState({
    exam_slug: "", title: "", description: "",
    start_at: "", end_at: "", duration_minutes: "60",
    questions_json: "[]", is_published: true,
  });

  const fetchTests = async () => {
    setLoading(true);
    const { data } = await supabase.from("live_tests").select("*").order("start_at", { ascending: false });
    setTests((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTests(); }, []);

  const reset = () => {
    setForm({ exam_slug: "", title: "", description: "", start_at: "", end_at: "", duration_minutes: "60", questions_json: "[]", is_published: true });
    setEditing(null);
    setShowForm(false);
    setImportExamId("");
    setImportSet("1");
  };

  const startEdit = (t: LiveTestRow) => {
    setEditing(t);
    setForm({
      exam_slug: t.exam_slug,
      title: t.title,
      description: t.description ?? "",
      start_at: new Date(t.start_at).toISOString().slice(0, 16),
      end_at: new Date(t.end_at).toISOString().slice(0, 16),
      duration_minutes: String(t.duration_minutes),
      questions_json: JSON.stringify(t.questions, null, 2),
      is_published: t.is_published,
    });
    setShowForm(true);
  };

  const importFromExam = async () => {
    if (!importExamId) { toast({ title: "Pick an exam to import from" }); return; }
    const { data, error } = await supabase
      .from("questions")
      .select("question_text, option_a, option_b, option_c, option_d, correct_answer")
      .eq("exam_id", importExamId)
      .eq("set_number", parseInt(importSet) || 1)
      .order("question_number");
    if (error) { toast({ title: "Import failed", description: error.message }); return; }
    const formatted = (data || []).map((q: any) => ({
      question_text: q.question_text,
      option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
      correct_answer: q.correct_answer,
    }));
    setForm((f) => ({ ...f, questions_json: JSON.stringify(formatted, null, 2) }));
    toast({ title: `Imported ${formatted.length} questions` });
  };

  const save = async () => {
    if (!form.exam_slug || !form.title || !form.start_at || !form.end_at) {
      toast({ title: "Fill exam, title, start and end" });
      return;
    }
    let parsed: any[];
    try { parsed = JSON.parse(form.questions_json); if (!Array.isArray(parsed)) throw new Error(); }
    catch { toast({ title: "Questions JSON must be an array" }); return; }

    const exam = exams.find((e) => e.slug === form.exam_slug);
    setSaving(true);
    const payload = {
      exam_slug: form.exam_slug,
      exam_name: exam?.name || form.exam_slug,
      title: form.title,
      description: form.description || null,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      duration_minutes: parseInt(form.duration_minutes) || 60,
      questions: parsed,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await supabase.from("live_tests").update(payload).eq("id", editing.id)
      : await supabase.from("live_tests").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message }); return; }
    toast({ title: editing ? "Live test updated" : "Live test created" });
    reset();
    fetchTests();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this live test and all attempts?")) return;
    const { error } = await supabase.from("live_tests").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message }); return; }
    toast({ title: "Deleted" });
    fetchTests();
  };

  const statusOf = (t: LiveTestRow) => {
    const n = Date.now();
    if (n < new Date(t.start_at).getTime()) return { label: "UPCOMING", color: "bg-primary/15 text-primary" };
    if (n > new Date(t.end_at).getTime()) return { label: "ENDED", color: "bg-muted text-muted-foreground" };
    return { label: "LIVE", color: "bg-destructive/15 text-destructive" };
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" /> Live Tests
            </CardTitle>
            <CardDescription>Schedule live tests with leaderboards</CardDescription>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1.5" /> New Live Test</>}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-3 border-t border-border/50 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Exam</label>
                <Select value={form.exam_slug} onValueChange={(v) => setForm((f) => ({ ...f, exam_slug: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {exams.map((e) => <SelectItem key={e.id} value={e.slug}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duration (minutes)</label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="GATE CS Live Mock 1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start At</label>
                <Input type="datetime-local" value={form.start_at} onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End At</label>
                <Input type="datetime-local" value={form.end_at} onChange={(e) => setForm((f) => ({ ...f, end_at: e.target.value }))} />
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border/60 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">Quick Import Questions from Existing Exam</p>
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={importExamId} onValueChange={setImportExamId}>
                  <SelectTrigger className="md:flex-1"><SelectValue placeholder="Source exam" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="md:w-32" type="number" value={importSet} onChange={(e) => setImportSet(e.target.value)} placeholder="Set #" />
                <Button onClick={importFromExam} variant="outline"><Upload className="h-4 w-4 mr-1.5" /> Import</Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Questions JSON (array of {"{ question_text, option_a, option_b, option_c, option_d, correct_answer }"})
              </label>
              <Textarea
                value={form.questions_json}
                onChange={(e) => setForm((f) => ({ ...f, questions_json: e.target.value }))}
                rows={10}
                className="font-mono text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
              Published (visible to users)
            </label>

            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                {editing ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-base">All Live Tests ({tests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : tests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No live tests yet</p>
          ) : (
            <div className="space-y-2">
              {tests.map((t) => {
                const s = statusOf(t);
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.color}`}>{s.label}</span>
                        <span className="text-xs text-muted-foreground">{t.exam_name}</span>
                        {!t.is_published && <Badge variant="outline" className="text-[10px]">DRAFT</Badge>}
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.start_at).toLocaleString()} → {new Date(t.end_at).toLocaleString()} • {(t.questions || []).length} Qs
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;

