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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Search, ShieldCheck } from "lucide-react";

interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  question_type: string;
  set_number: number;
  source_label: string | null;
  exam_id: string;
}

const emptyQuestion = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  explanation: "",
  question_type: "mcq",
  set_number: 1,
  question_number: 1,
  source_label: "",
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccessControl();

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSet, setSelectedSet] = useState("1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyQuestion);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
    if (!authLoading && !accessLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, accessLoading, user, isAdmin, navigate]);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      const { data } = await supabase.from("exams").select("id, name, slug, category").order("name");
      setExams(data || []);
      if (data && data.length > 0 && !selectedExamId) setSelectedExamId(data[0].id);
    };
    if (isAdmin) fetchExams();
  }, [isAdmin]);

  // Fetch questions when exam/set changes
  useEffect(() => {
    if (!selectedExamId) return;
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", selectedExamId)
        .eq("set_number", parseInt(selectedSet))
        .order("question_number", { ascending: true });
      setQuestions((data as Question[]) || []);
      setLoadingQuestions(false);
    };
    fetchQuestions();
  }, [selectedExamId, selectedSet]);

  const openAdd = () => {
    setEditing(null);
    const nextNum = questions.length > 0 ? Math.max(...questions.map(q => q.question_number)) + 1 : 1;
    setForm({ ...emptyQuestion, set_number: parseInt(selectedSet), question_number: nextNum });
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      question_type: q.question_type,
      set_number: q.set_number,
      question_number: q.question_number,
      source_label: q.source_label || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) {
      toast({ title: "Question text is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      exam_id: selectedExamId,
      question_text: form.question_text.trim(),
      option_a: form.option_a.trim(),
      option_b: form.option_b.trim(),
      option_c: form.option_c.trim(),
      option_d: form.option_d.trim(),
      correct_answer: form.correct_answer.trim(),
      explanation: form.explanation.trim() || null,
      question_type: form.question_type,
      set_number: form.set_number,
      question_number: form.question_number,
      source_label: form.source_label?.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("questions").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "Error updating question", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Question updated!" });
        setQuestions(prev => prev.map(q => q.id === editing.id ? { ...q, ...payload } : q));
      }
    } else {
      const { data, error } = await supabase.from("questions").insert(payload).select().single();
      if (error) {
        toast({ title: "Error adding question", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Question added!" });
        setQuestions(prev => [...prev, data as Question].sort((a, b) => a.question_number - b.question_number));
      }
    }

    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("questions").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question deleted" });
      setQuestions(prev => prev.filter(q => q.id !== deleteTarget.id));
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filtered = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    q.question_number.toString().includes(search)
  );

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
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel — Questions</h1>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Exam</label>
                  <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                    <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                    <SelectContent>
                      {exams.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name} ({e.category})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <label className="text-sm text-muted-foreground mb-1 block">Set #</label>
                  <Input
                    type="number"
                    min={1}
                    value={selectedSet}
                    onChange={e => setSelectedSet(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} question{filtered.length !== 1 ? "s" : ""} in Set {selectedSet}
            </p>
            <Button onClick={openAdd} disabled={!selectedExamId}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loadingQuestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No questions found. Click "Add Question" to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead className="w-20">Answer</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(q => (
                      <TableRow key={q.id}>
                        <TableCell className="font-mono text-sm">{q.question_number}</TableCell>
                        <TableCell className="max-w-md truncate text-sm">{q.question_text}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs uppercase">{q.question_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{q.correct_answer}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(q)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Q Number</label>
                <Input type="number" min={1} value={form.question_number} onChange={e => setForm(f => ({ ...f, question_number: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                <Select value={form.question_type} onValueChange={v => setForm(f => ({ ...f, question_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="msq">MSQ</SelectItem>
                    <SelectItem value="integer">Integer (NAT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Source Label</label>
                <Input placeholder="e.g. GATE 2023" value={form.source_label} onChange={e => setForm(f => ({ ...f, source_label: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Question Text</label>
              <Textarea rows={3} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Option A</label>
                <Input value={form.option_a} onChange={e => setForm(f => ({ ...f, option_a: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Option B</label>
                <Input value={form.option_b} onChange={e => setForm(f => ({ ...f, option_b: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Option C</label>
                <Input value={form.option_c} onChange={e => setForm(f => ({ ...f, option_c: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Option D</label>
                <Input value={form.option_d} onChange={e => setForm(f => ({ ...f, option_d: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Correct Answer {form.question_type === "msq" ? "(comma-separated, e.g. A,C)" : form.question_type === "integer" ? "(numeric value)" : "(A/B/C/D)"}
              </label>
              <Input value={form.correct_answer} onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Explanation (optional)</label>
              <Textarea rows={3} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question #{deleteTarget?.question_number}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
