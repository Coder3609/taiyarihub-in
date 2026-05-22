import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, LayoutDashboard, Database, Upload, FileText, 
  Settings, LogOut, Star, BookOpen, Radio, Plus, AlertTriangle, Search, Pencil, Trash2, ArrowLeft,
  ChevronRight, Globe, School, Landmark, CheckCircle2, Image as ImageIcon, Table as TableIcon,
  Shield, Award, Clock, Target, ArrowRight, X
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getDBSetNumber = (sectionId: string, setNumber: number) => {
  switch (sectionId) {
    case 'pyqs': return 1000 + setNumber;
    case 'mocks': return 2000 + setNumber;
    case 'books': return 3000 + setNumber;
    case 'master': return 4000 + setNumber;
    default: return setNumber;
  }
};

const getDisplaySetNumber = (dbSetNumber: number) => {
  if (dbSetNumber >= 4000) return dbSetNumber - 4000;
  if (dbSetNumber >= 3000) return dbSetNumber - 3000;
  if (dbSetNumber >= 2000) return dbSetNumber - 2000;
  if (dbSetNumber >= 1000) return dbSetNumber - 1000;
  return dbSetNumber;
};

import { useAccessControl } from "@/hooks/useAccessControl";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccessControl();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ exams: 0, questions: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"directory" | "exam-detail" | "section-sets" | "question-bank">("directory");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSetNumber, setSelectedSetNumber] = useState<number | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [examQuestionCounts, setExamQuestionCounts] = useState<Record<string, number>>({});
  const [newExamName, setNewExamName] = useState("");
  const [newExamSlug, setNewExamSlug] = useState("");
  const [newExamCategory, setNewExamCategory] = useState("central");
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [examSections, setExamSections] = useState<any[]>([]);
  const [selectedSectionUUID, setSelectedSectionUUID] = useState<string>("");

  // Form State for questions_v2
  const [contentJson, setContentJson] = useState<any>(null);
  const [optionAJson, setOptionAJson] = useState<any>(null);
  const [optionBJson, setOptionBJson] = useState<any>(null);
  const [optionCJson, setOptionCJson] = useState<any>(null);
  const [optionDJson, setOptionDJson] = useState<any>(null);
  const [explanationJson, setExplanationJson] = useState<any>(null);
  
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [setNumber, setSetNumber] = useState("1");
  const [qNumber, setQNumber] = useState("");
  const [type, setType] = useState("mcq");
  const [marks, setMarks] = useState("1");
  const [negativeMarks, setNegativeMarks] = useState("0.33");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if ((activeTab === 'questions' || viewMode === 'question-bank' || isEditing) && selectedExamId) {
      fetchQuestions();
      fetchExamSections();
    }
  }, [activeTab, selectedExamId, viewMode, selectedSetNumber, isEditing]);

  const fetchExamSections = async () => {
    if (!selectedExamId) return;
    try {
      const { data, error } = await supabase
        .from('exam_sections')
        .select('*')
        .eq('exam_id', selectedExamId)
        .order('order_index');
      
      if (error) {
        console.error("Error fetching exam sections:", error);
        return;
      }

      if (data && data.length > 0) {
        setExamSections(data);
        const exists = data.some(sec => sec.id === selectedSectionUUID);
        if (!selectedSectionUUID || !exists) {
          setSelectedSectionUUID(data[0].id);
        }
      } else {
        // Auto-initialize standard GATE sections!
        console.log("No sections found for this exam. Auto-initializing standard GATE sections...");
        const sections = [
          { name: "General Aptitude", order_index: 0, total_questions: 10 },
          { name: "Technical Section", order_index: 1, total_questions: 55 }
        ];
        
        const { data: insertedData, error: insertError } = await supabase
          .from('exam_sections')
          .insert(sections.map(s => ({ ...s, exam_id: selectedExamId })))
          .select();

        if (insertError) {
          console.error("Failed to auto-initialize exam sections:", insertError);
          toast({ title: "Section Init Failure", description: insertError.message, variant: "destructive" });
          setExamSections([]);
        } else if (insertedData && insertedData.length > 0) {
          console.log("Successfully auto-initialized GATE sections!");
          setExamSections(insertedData);
          setSelectedSectionUUID(insertedData[0].id);
        }
      }
    } catch (err: any) {
      console.error("Unexpected error in fetchExamSections:", err);
      toast({ title: "Error Loading Sections", description: err.message, variant: "destructive" });
    }
  };

  const fetchData = async () => {
    try {
      const { data: examsData } = await supabase.from('exams').select('*').order('name');
      const { count: qCount } = await supabase.from('questions_v2').select('*', { count: 'exact', head: true });
      
      // Auto-sync database to remove CUET and seed JEE/NEET
      const cuetExam = examsData?.find(e => e.slug.toUpperCase() === 'CUET');
      const hasJeeMains = examsData?.some(e => e.slug === 'JEE-Mains');
      const hasJeeAdv = examsData?.some(e => e.slug === 'JEE-Advanced');
      const hasNeet = examsData?.some(e => e.slug === 'NEET');
      const needCategoryUpdate = examsData?.some(e => 
        ['JEE-Mains', 'JEE-Advanced', 'JEE-Advanced-Paper-1', 'JEE-Advanced-Paper-2', 'NEET'].includes(e.slug) && 
        e.category !== 'school'
      );
      
      let finalExamsData = examsData || [];
      
      if (cuetExam || !hasJeeMains || !hasJeeAdv || !hasNeet || needCategoryUpdate) {
        console.log("Auto-syncing database: removing CUET and seeding JEE/NEET with category 'school'...");
        if (cuetExam) {
          await supabase.from('exams').delete().eq('slug', cuetExam.slug);
        }
        
        const examsToSeed = [
          { name: 'JEE Mains', slug: 'JEE-Mains', category: 'school', duration_minutes: 180, total_questions: 90, description: 'Joint Entrance Examination - Main' },
          { name: 'JEE Advanced', slug: 'JEE-Advanced', category: 'school', duration_minutes: 180, total_questions: 54, description: 'Joint Entrance Examination - Advanced' },
          { name: 'JEE Advanced Paper 1', slug: 'JEE-Advanced-Paper-1', category: 'school', duration_minutes: 180, total_questions: 54, description: 'Joint Entrance Examination - Advanced Paper 1' },
          { name: 'JEE Advanced Paper 2', slug: 'JEE-Advanced-Paper-2', category: 'school', duration_minutes: 180, total_questions: 54, description: 'Joint Entrance Examination - Advanced Paper 2' },
          { name: 'NEET', slug: 'NEET', category: 'school', duration_minutes: 200, total_questions: 200, description: 'National Eligibility cum Entrance Test' },
        ];
        
        for (const ex of examsToSeed) {
          const exists = examsData?.find(e => e.slug === ex.slug);
          if (!exists) {
            await supabase.from('exams').insert(ex);
          } else if (exists.category !== 'school') {
            await supabase.from('exams').update({ category: 'school' }).eq('slug', ex.slug);
          }
        }
        
        // Re-fetch updated exams list
        const { data: updatedExams } = await supabase.from('exams').select('*').order('name');
        finalExamsData = updatedExams || [];
      }
      
      setExams(finalExamsData);
      setStats({ exams: finalExamsData.length, questions: qCount || 0 });

      // Fetch actual question counts per exam
      const { data: qCounts } = await supabase.from('exam_questions').select('exam_id');
      const countsMap: Record<string, number> = {};
      qCounts?.forEach(eq => {
        countsMap[eq.exam_id] = (countsMap[eq.exam_id] || 0) + 1;
      });
      setExamQuestionCounts(countsMap);

      // Fetch Debug Info
      const { data: rData, error: rError } = await supabase.from('user_roles').select('*');
      const { data: sessionData } = await supabase.auth.getSession();
      if (new URLSearchParams(window.location.search).get('debug') === 'true') {
        setDebugInfo({
          roles: rData || [],
          rolesError: rError?.message || null,
          sessionUser: sessionData?.session?.user || null
        });
      } else {
        setDebugInfo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) {
      toast({ title: "Validation Error", description: "Exam name is required", variant: "destructive" });
      return;
    }

    setIsCreatingExam(true);
    try {
      const generatedSlug = newExamSlug.trim() || newExamName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          name: newExamName.trim(),
          slug: generatedSlug,
          category: newExamCategory
        }])
        .select();

      if (error) {
        toast({ title: "Failed to create exam", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Exam Created", description: `Successfully created "${newExamName.trim()}"` });
        setNewExamName("");
        setNewExamSlug("");
        setNewExamCategory("central");
        await fetchData();
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Unexpected error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingExam(false);
    }
  };

  const handleDeleteExam = async (examId: string, examName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${examName}"? All question mappings for this exam will also be deleted.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) {
        toast({ title: "Failed to delete exam", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Exam Deleted", description: `Successfully deleted "${examName}"` });
        await fetchData();
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Unexpected error", description: err.message, variant: "destructive" });
    }
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      let query = supabase
        .from('exam_questions')
        .select('question_id, question_number, set_number, section_id')
        .eq('exam_id', selectedExamId);

      if (viewMode === "question-bank" && selectedSetNumber) {
        query = query.eq('set_number', selectedSetNumber);
      }

      const { data: mapping } = await query.order('question_number');

      if (mapping && mapping.length > 0) {
        const qIds = mapping.map(m => m.question_id);
        const { data: qs } = await supabase
          .from('questions_v2')
          .select('*')
          .in('id', qIds);
        
        // Match numbers back with dynamic section auto-healing
        const merged = (qs || []).map(q => {
          const mapItem = mapping.find(m => m.question_id === q.id);
          let secId = mapItem?.section_id;
          if (!secId && mapItem?.question_number) {
            const qNum = mapItem.question_number;
            const sec1 = examSections.find(s => s.order_index === 0 || s.name.toLowerCase().includes("aptitude"));
            const sec2 = examSections.find(s => s.order_index === 1 || s.name.toLowerCase().includes("technical"));
            if (qNum <= 10 && sec1) secId = sec1.id;
            else if (qNum > 10 && sec2) secId = sec2.id;
          }
          return { ...q, question_number: mapItem?.question_number, section_id: secId };
        });
        setQuestions(merged.sort((a, b) => (a.question_number || 0) - (b.question_number || 0)));
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startEditing = (q: any) => {
    setEditingQuestion(q);
    setContentJson(q.content_json);
    setOptionAJson(q.option_a_json);
    setOptionBJson(q.option_b_json);
    setOptionCJson(q.option_c_json);
    setOptionDJson(q.option_d_json);
    setExplanationJson(q.explanation_json);
    setCorrectAnswer(q.correct_answer);
    setQNumber(q.question_number?.toString() || "");
    setType(q.type);
    setMarks(q.marks?.toString() || "1");
    setNegativeMarks(q.negative_marks?.toString() || "0.33");
    if (q.section_id) {
      setSelectedSectionUUID(q.section_id);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedExamId) {
      toast({ title: "Error", description: "Select an exam first", variant: "destructive" });
      return;
    }

    try {
      const defaultTiptap = (json: any) => {
        if (!json || (typeof json === 'object' && Object.keys(json).length === 0)) {
          return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }] };
        }
        return json;
      };

      const qData = {
        content_json: defaultTiptap(contentJson),
        option_a_json: defaultTiptap(optionAJson),
        option_b_json: defaultTiptap(optionBJson),
        option_c_json: defaultTiptap(optionCJson),
        option_d_json: defaultTiptap(optionDJson),
        explanation_json: explanationJson ? defaultTiptap(explanationJson) : null,
        correct_answer: correctAnswer || "A",
        type: type || "mcq",
        marks: parseFloat(marks) || 1,
        negative_marks: parseFloat(negativeMarks) || 0.33
      };

      let questionId;

      // Respect manual section dropdown selection first. Only fallback to auto-mapping if none is selected.
      const qNum = parseInt(qNumber) || 1;
      let targetSectionUUID = selectedSectionUUID;
      if (!targetSectionUUID) {
        const sec1 = examSections.find(s => s.order_index === 0 || s.name.toLowerCase().includes("aptitude"));
        const sec2 = examSections.find(s => s.order_index === 1 || s.name.toLowerCase().includes("technical"));
        if (qNum <= 10 && sec1) {
          targetSectionUUID = sec1.id;
        } else if (qNum > 10 && sec2) {
          targetSectionUUID = sec2.id;
        }
      }

      // Sanitize UUID values: if targetSectionUUID is empty or invalid, keep it as null to prevent constraint crashes
      const finalSectionId = (targetSectionUUID && typeof targetSectionUUID === 'string' && targetSectionUUID.trim() !== "") ? targetSectionUUID : null;

      if (editingQuestion) {
        const { error: qError } = await supabase.from('questions_v2').update(qData).eq('id', editingQuestion.id);
        if (qError) throw qError;
        questionId = editingQuestion.id;

        // Update mapping if it exists
        const { error: mapError } = await supabase.from('exam_questions').update({
          section_id: finalSectionId,
          set_number: selectedSetNumber || parseInt(setNumber) || 1,
          question_number: qNum
        }).eq('question_id', questionId).eq('exam_id', selectedExamId);

        if (mapError) throw mapError;

        toast({ title: "Updated", description: "Question saved successfully" });
      } else {
        const { data: newQ, error: qError } = await supabase.from('questions_v2').insert([qData]).select().single();
        if (qError) throw qError;
        questionId = newQ.id;
        
        // Create mapping
        const { error: mapError } = await supabase.from('exam_questions').insert([{
          exam_id: selectedExamId,
          question_id: questionId,
          section_id: finalSectionId,
          set_number: selectedSetNumber || parseInt(setNumber) || 1,
          question_number: qNum
        }]);

        if (mapError) throw mapError;
        
        toast({ title: "Created", description: "New question added" });
      }
      
      setIsEditing(false);
      fetchQuestions();
    } catch (error: any) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExamId) return;

    setIsImporting(true);
    toast({ title: "Importing", description: "Parsing CSV payloads..." });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          let successCount = 0;

          // Fetch Sections for the exam to auto-sync section mapping!
          const { data: sections } = await supabase
            .from('exam_sections')
            .select('*')
            .eq('exam_id', selectedExamId);

          const sec1 = (sections || []).find(s => s.order_index === 0 || s.name.toLowerCase().includes("aptitude"));
          const sec2 = (sections || []).find(s => s.order_index === 1 || s.name.toLowerCase().includes("technical"));

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            // Parse content columns
            let cJson = null, optA = null, optB = null, optC = null, optD = null, expJson = null;
            try { cJson = typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json; } catch { cJson = { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.content_json || row.question_text || "" }] }] }; }
            try { optA = typeof row.option_a_json === 'string' ? JSON.parse(row.option_a_json) : row.option_a_json; } catch { optA = { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.option_a || "" }] }] }; }
            try { optB = typeof row.option_b_json === 'string' ? JSON.parse(row.option_b_json) : row.option_b_json; } catch { optB = { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.option_b || "" }] }] }; }
            try { optC = typeof row.option_c_json === 'string' ? JSON.parse(row.option_c_json) : row.option_c_json; } catch { optC = { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.option_c || "" }] }] }; }
            try { optD = typeof row.option_d_json === 'string' ? JSON.parse(row.option_d_json) : row.option_d_json; } catch { optD = { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.option_d || "" }] }] }; }
            try { expJson = typeof row.explanation_json === 'string' ? JSON.parse(row.explanation_json) : row.explanation_json; } catch { expJson = row.explanation ? { content: [{ type: 'paragraph', content: [{ type: 'text', text: row.explanation }] }] } : null; }

            const qNum = parseInt(row.question_number || row.qNumber) || (successCount + 1);
            
            // Resolve section UUID automatically based on question number!
            let targetSectionUUID = selectedSectionUUID || (sections && sections.length > 0 ? sections[0].id : null);
            if (qNum <= 10 && sec1) {
              targetSectionUUID = sec1.id;
            } else if (qNum > 10 && sec2) {
              targetSectionUUID = sec2.id;
            }

            const qData = {
              content_json: cJson,
              option_a_json: optA,
              option_b_json: optB,
              option_c_json: optC,
              option_d_json: optD,
              explanation_json: expJson,
              correct_answer: (row.correct_answer || "A").toString().trim().toUpperCase(),
              type: row.type || "mcq",
              marks: parseFloat(row.marks) || 1,
              negative_marks: parseFloat(row.negative_marks) || 0.33
            };

            const { data: newQ, error: qError } = await supabase
              .from('questions_v2')
              .insert([qData])
              .select()
              .single();

            if (qError) {
              console.error("Bulk insert question error:", qError);
              continue;
            }

            // Create mapping using current selectedSetNumber or default to 1
            const targetSetNumber = selectedSetNumber || parseInt(setNumber) || 1;
            const { error: mapError } = await supabase
              .from('exam_questions')
              .insert([{
                exam_id: selectedExamId,
                question_id: newQ.id,
                section_id: targetSectionUUID,
                set_number: targetSetNumber,
                question_number: qNum
              }]);

            if (mapError) {
              console.error("Bulk insert mapping error:", mapError);
            } else {
              successCount++;
            }
          }

          toast({ title: "Import Successful", description: `Successfully ingested ${successCount} questions into Box set.` });
          fetchQuestions();
        } catch (err: any) {
          toast({ title: "Import Failed", description: err.message, variant: "destructive" });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        toast({ title: "Parse Error", description: error.message, variant: "destructive" });
        setIsImporting(false);
      }
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question? This cannot be undone.")) return;
    
    try {
      const { error: mapError } = await supabase
        .from('exam_questions')
        .delete()
        .eq('question_id', questionId);

      if (mapError) throw mapError;

      const { error: qError } = await supabase
        .from('questions_v2')
        .delete()
        .eq('id', questionId);

      if (qError) throw qError;

      toast({ title: "Success", description: "Question deleted successfully" });
      fetchQuestions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'school': return <School className="w-4 h-4" />;
      case 'state': return <Globe className="w-4 h-4" />;
      case 'foreign': return <Globe className="w-4 h-4 text-blue-400" />;
      default: return <Landmark className="w-4 h-4" />;
    }
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-slate-400 text-sm">Verifying security clearances...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-[#0A0E17] border-white/5 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-4 border-b border-white/5">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
              <Shield size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-white">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-center">
            <p className="text-sm text-slate-400 leading-relaxed">
              Please sign in to access the control center.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/auth")} className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-8">
                Sign In
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="border-white/10">
                Back to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-[#0A0E17] border-red-500/20 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-4 border-b border-white/5">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
              <Shield size={24} />
            </div>
            <CardTitle className="text-xl font-bold text-white">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-sm text-slate-400 text-center leading-relaxed">
              Your account does not have administrative privileges in this database. 
              To enable access to the control center, run the following query in your Supabase SQL Editor:
            </p>
            
            <div className="p-4 bg-black/60 rounded-lg border border-white/10 font-mono text-xs text-amber-500 break-all select-all">
              INSERT INTO public.user_roles (user_id, role)<br/>
              {`VALUES ('${user?.id}', 'admin')`}<br/>
              ON CONFLICT DO NOTHING;
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/")} variant="outline" className="border-white/10">
                Back to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#02040A] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0E17]/80 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black italic">TH</div>
          <h2 className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Control Center
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4">General</p>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "exams", icon: Database, label: "Exam Manager" },
            { id: "questions", icon: FileText, label: "Question Bank" },
            { id: "bulk", icon: Upload, label: "Bulk Import" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === item.id 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-8">System</p>
          <button onClick={() => navigate("/admin/questions")} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5">
            <Star size={18} /> Elite CMS
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5">
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-amber-500 hover:bg-amber-500/5 transition-colors"
          >
            <ArrowLeft size={18} /> Exit to Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-display font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your professional exam ecosystem.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#02040A] bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                ))}
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Admin Online</Badge>
            </div>
          </header>

          {/* Debug Info Panel */}
          {debugInfo && (
            <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-500">Security & Role Debug Status</span>
                <button 
                  onClick={() => setDebugInfo(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p><span className="text-slate-400">Auth User ID:</span> <span className="font-mono text-white">{debugInfo.sessionUser?.id || "Null (Not Logged In)"}</span></p>
                  <p><span className="text-slate-400">Auth Email:</span> <span className="text-white">{debugInfo.sessionUser?.email || "N/A"}</span></p>
                  <p><span className="text-slate-400">Is Frontend Admin:</span> <span className={isAdmin ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{isAdmin ? "YES" : "NO"}</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="text-slate-400">Roles Table Record:</span></p>
                  <pre className="p-2 bg-black/40 rounded text-amber-500 overflow-x-auto max-h-24">
                    {JSON.stringify(debugInfo.roles, null, 2)}
                  </pre>
                  {debugInfo.rolesError && (
                    <p className="text-red-400 font-bold">Error reading roles: {debugInfo.rolesError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Tab - Redesigned to mirror CentralExams */}
          {activeTab === "dashboard" && (
            <div className="space-y-12 pb-20">
              {viewMode === "directory" && (
                <>
                  {/* Hero Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-white/5"
                  >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
                      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                    </div>
                    
                    <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-6">
                      Administrative Control Center
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tight text-white">
                      Content <span className="text-amber-500">Engine</span> v2.0
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                      Manage your professional exam ecosystem with rich text, images, and tables. 
                      Select a category below to start adding or editing questions.
                    </p>
                    
                    <div className="mt-10 flex items-center justify-center gap-4">
                      <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{stats.exams}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Exams</span>
                      </div>
                      <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{stats.questions}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Grouped Exam Directory */}
                  {[
                    { title: "GROUP A", subtitle: "Officer Level (Central)", icon: Shield, color: "from-amber-500/20 to-amber-600/5", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-400", category: "central" },
                    { title: "STATE LEVEL", subtitle: "Civil & Technical", icon: Award, color: "from-slate-400/20 to-slate-500/5", borderColor: "border-slate-400/30", badgeColor: "bg-slate-400/10 text-slate-300", category: "state" },
                    { title: "SCHOOL & ENTRANCE", subtitle: "Board & Competitive", icon: School, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-400", category: "school" },
                    { title: "FOREIGN EXAMS", subtitle: "Global Certifications", icon: Globe, color: "from-blue-500/20 to-blue-600/5", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-400", category: "foreign" },
                  ].map((group) => (
                    <motion.div 
                      key={group.title} 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${group.badgeColor} border ${group.borderColor}`}>
                          <group.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="font-display text-2xl font-black text-white tracking-tight">{group.title}</h2>
                          <p className="text-sm text-slate-500 font-medium">{group.subtitle}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {exams.filter(e => e.category === group.category).length === 0 ? (
                          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Ready for data ingestion</p>
                          </div>
                        ) : (
                          exams.filter(e => e.category === group.category).map((exam) => (
                            <motion.div
                              key={exam.id}
                              whileHover={{ y: -8, scale: 1.02 }}
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setSelectedExam(exam);
                                setViewMode("exam-detail");
                              }}
                              className={`rounded-3xl p-6 bg-gradient-to-br ${group.color} border ${group.borderColor} cursor-pointer transition-all hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.1)] group/card flex flex-col justify-between min-h-[220px]`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-5">
                                  <h4 className="text-base font-bold text-white leading-tight line-clamp-2 group-hover/card:text-amber-500 transition-colors">
                                    {exam.name}
                                  </h4>
                                  <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[9px] font-black text-slate-400 shrink-0 uppercase">
                                    {exam.slug.split('-')[0]}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-y-3 text-[11px] font-bold text-slate-400">
                                  <span className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-amber-500" />
                                    {examQuestionCounts[exam.id] || 0} Qs
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    {exam.duration_minutes}m
                                  </span>
                                  <span className="flex items-center gap-2 text-emerald-400/80">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Verified
                                  </span>
                                  <span className="text-slate-500 font-mono">
                                    # {exam.id.slice(0, 6)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Content Ops</span>
                                <span className="text-xs text-amber-500 flex items-center gap-1.5 group-hover/card:translate-x-1 transition-transform font-black">
                                  ADD QUESTIONS <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {viewMode === "exam-detail" && selectedExam && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => setViewMode("directory")}
                    className="text-slate-400 hover:text-white gap-2"
                  >
                    <ArrowLeft size={16} /> Back to Directory
                  </Button>

                  <div className="flex items-end gap-6 pb-8 border-b border-white/5">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center text-3xl font-black text-black italic shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]">
                      {selectedExam.slug.split('-')[0].slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-4xl font-display font-black text-white tracking-tight">{selectedExam.name}</h2>
                      <p className="text-slate-500 font-medium mt-1">Manage sections and question sets for this exam.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { id: "pyqs", title: "PYQs", icon: FileText, color: "from-blue-500/20 to-blue-600/5", borderColor: "border-blue-500/30", label: "Previous Year Questions" },
                      { id: "mocks", title: "Mocks", icon: Target, color: "from-purple-500/20 to-purple-600/5", borderColor: "border-purple-500/30", label: "Practice Mock Tests" },
                      { id: "books", title: "Books", icon: BookOpen, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "border-emerald-500/30", label: "Popular Books Content" },
                      { id: "master", title: "Master", icon: Award, color: "from-rose-500/20 to-rose-600/5", borderColor: "border-rose-500/30", label: "Subject Mastery Sets" },
                    ].map(section => (
                      <motion.div
                        key={section.id}
                        whileHover={{ y: -6, scale: 1.02 }}
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setViewMode("section-sets");
                        }}
                        className={`p-6 rounded-3xl bg-gradient-to-br ${section.color} border ${section.borderColor} cursor-pointer transition-all hover:shadow-xl group`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <section.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">{section.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{section.label}</p>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">View Sets</span>
                          <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {viewMode === "section-sets" && (
                <SectionSetsView 
                  exam={selectedExam}
                  sectionId={selectedSectionId}
                  onBack={() => setViewMode("exam-detail")}
                  onSelectSet={(setNum) => {
                    setSelectedSetNumber(setNum);
                    setViewMode("question-bank");
                  }}
                />
              )}
            </div>
          )}

          {/* Exam Manager Tab */}
          {activeTab === "exams" && (
            <div className="space-y-8 pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Exam Manager</h2>
                  <p className="text-slate-400 text-sm mt-1">Add, update, and manage exams available in the system.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Exam Form */}
                <Card className="bg-slate-900/40 border-slate-800 lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-purple-400" /> Create New Exam
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddExam} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Exam Name</label>
                        <Input
                          placeholder="e.g. GATE 2025 Computer Science"
                          value={newExamName}
                          onChange={(e) => {
                            setNewExamName(e.target.value);
                            // Auto-generate slug if slug field hasn't been edited
                            setNewExamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }}
                          className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-purple-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Exam Slug (URL Identifier)</label>
                        <Input
                          placeholder="e.g. gate-2025-computer-science-cs1"
                          value={newExamSlug}
                          onChange={(e) => setNewExamSlug(e.target.value)}
                          className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-purple-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Category</label>
                        <Select value={newExamCategory} onValueChange={setNewExamCategory}>
                          <SelectTrigger className="bg-slate-950/60 border-slate-800 text-white focus:ring-purple-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-850 text-white">
                            <SelectItem value="central">Central Govt Exams</SelectItem>
                            <SelectItem value="state">State Exams</SelectItem>
                            <SelectItem value="school">School / Entrance Exams</SelectItem>
                            <SelectItem value="foreign">Foreign Exams</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        disabled={isCreatingExam}
                      >
                        {isCreatingExam ? "Creating..." : "Create Exam"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Exam List Table */}
                <Card className="bg-slate-900/40 border-slate-800 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" /> Registered Exams ({exams.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                          <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {exams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-slate-900/20 text-slate-200">
                              <td className="px-6 py-4 font-semibold text-white">{exam.name}</td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-400">{exam.slug}</td>
                              <td className="px-6 py-4">
                                <Badge
                                  className={
                                    exam.category === "central"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : exam.category === "state"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : exam.category === "school"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  }
                                  variant="outline"
                                >
                                  {exam.category}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteExam(exam.id, exam.name)}
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {exams.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-10 text-slate-500">
                                No exams registered yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Question Bank Tab */}
          {(activeTab === "questions" || viewMode === "question-bank") && (
            <div className="space-y-6">
              {viewMode === "question-bank" && !isEditing && (
                <Button 
                  variant="ghost" 
                  onClick={() => setViewMode("section-sets")}
                  className="text-slate-400 hover:text-white gap-2 mb-2"
                >
                  <ArrowLeft size={16} /> Back to Sets
                </Button>
              )}
              {!isEditing ? (
                <>
                  <div className="flex gap-4 items-center bg-[#0A0E17] p-4 rounded-xl border border-white/5">
                    <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                      <SelectTrigger className="w-72 bg-black/40 border-white/10">
                        <SelectValue placeholder="Select target exam" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0E17] border-white/10">
                        {exams.map(exam => (
                          <SelectItem key={exam.id} value={exam.id} className="text-slate-200">
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input 
                        placeholder="Filter by content..." 
                        className="pl-9 bg-black/40 border-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Button 
                      className="bg-amber-500 text-black hover:bg-amber-400 font-bold gap-2"
                      onClick={() => {
                        setEditingQuestion(null);
                        setContentJson(null);
                        setOptionAJson(null);
                        setOptionBJson(null);
                        setOptionCJson(null);
                        setOptionDJson(null);
                        setExplanationJson(null);
                        setCorrectAnswer("");
                        setQNumber((questions.length + 1).toString());
                        setIsEditing(true);
                      }}
                      disabled={!selectedExamId}
                    >
                      <Plus size={18} /> Add New
                    </Button>
                  </div>

                  {loadingQuestions ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse border border-white/5 bg-[#0A0E17] rounded-xl">
                      Scanning database...
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 border border-white/5 bg-[#0A0E17] rounded-xl">
                      No questions mapped to this exam yet.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {examSections.map((section) => {
                        const sectionQuestions = questions.filter(q => q.section_id === section.id);
                        if (sectionQuestions.length === 0) return null;

                        return (
                          <div key={section.id} className="space-y-3">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                                {section.name}
                              </h3>
                              <span className="text-xs text-slate-500 font-mono">
                                ({sectionQuestions.length} {sectionQuestions.length === 1 ? "question" : "questions"})
                              </span>
                            </div>
                            <Card className="bg-[#0A0E17] border-white/5 overflow-hidden shadow-2xl">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-white/[0.02] uppercase text-[10px] font-bold text-slate-500 tracking-widest border-b border-white/5">
                                    <tr>
                                      <th className="p-4 w-16 text-center">#</th>
                                      <th className="p-4">Content Preview</th>
                                      <th className="p-4 w-48">Section</th>
                                      <th className="p-4 w-24">Type</th>
                                      <th className="p-4 w-24">Answer</th>
                                      <th className="p-4 w-32 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {sectionQuestions.map((q) => (
                                      <tr key={q.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="p-4 text-center font-mono text-amber-500/60 font-bold">{q.question_number}</td>
                                        <td className="p-4">
                                          <div className="max-w-md truncate text-slate-300 font-medium">
                                            {q.content_json?.content?.[0]?.content?.[0]?.text || "Rich Content Question"}
                                          </div>
                                        </td>
                                        <td className="p-4">
                                          <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/10 text-[10px]">
                                            {section.name}
                                          </Badge>
                                        </td>
                                        <td className="p-4">
                                          <Badge variant="outline" className="text-[9px] uppercase border-white/10 text-slate-400">{q.type}</Badge>
                                        </td>
                                        <td className="p-4">
                                          <span className="font-mono text-emerald-400 font-bold">{q.correct_answer}</span>
                                        </td>
                                        <td className="p-4 text-right flex gap-1 justify-end">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white" onClick={() => startEditing(q)}>
                                            <Pencil size={14} />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-400" onClick={() => handleDeleteQuestion(q.id)}>
                                            <Trash2 size={14} />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          </div>
                        );
                      })}

                      {/* Render unassigned questions if there are any */}
                      {(() => {
                        const unassignedQuestions = questions.filter(
                          q => !q.section_id || !examSections.some(s => s.id === q.section_id)
                        );
                        if (unassignedQuestions.length === 0) return null;

                        return (
                          <div className="space-y-3 mt-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">
                                Unassigned Questions
                              </h3>
                              <span className="text-xs text-slate-500 font-mono">
                                ({unassignedQuestions.length} {unassignedQuestions.length === 1 ? "question" : "questions"})
                              </span>
                            </div>
                            <Card className="bg-[#0A0E17] border-white/5 overflow-hidden shadow-2xl">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-white/[0.02] uppercase text-[10px] font-bold text-slate-500 tracking-widest border-b border-white/5">
                                    <tr>
                                      <th className="p-4 w-16 text-center">#</th>
                                      <th className="p-4">Content Preview</th>
                                      <th className="p-4 w-48">Section</th>
                                      <th className="p-4 w-24">Type</th>
                                      <th className="p-4 w-24">Answer</th>
                                      <th className="p-4 w-32 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {unassignedQuestions.map((q) => (
                                      <tr key={q.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="p-4 text-center font-mono text-amber-500/60 font-bold">{q.question_number}</td>
                                        <td className="p-4">
                                          <div className="max-w-md truncate text-slate-300 font-medium">
                                            {q.content_json?.content?.[0]?.content?.[0]?.text || "Rich Content Question"}
                                          </div>
                                        </td>
                                        <td className="p-4">
                                          <Badge variant="outline" className="bg-red-500/5 text-red-400 border-red-500/10 text-[10px]">
                                            Unassigned
                                          </Badge>
                                        </td>
                                        <td className="p-4">
                                          <Badge variant="outline" className="text-[9px] uppercase border-white/10 text-slate-400">{q.type}</Badge>
                                        </td>
                                        <td className="p-4">
                                          <span className="font-mono text-emerald-400 font-bold">{q.correct_answer}</span>
                                        </td>
                                        <td className="p-4 text-right flex gap-1 justify-end">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white" onClick={() => startEditing(q)}>
                                            <Pencil size={14} />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-400" onClick={() => handleDeleteQuestion(q.id)}>
                                            <Trash2 size={14} />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6 max-w-5xl mx-auto pb-20">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white gap-2">
                      <ArrowLeft size={16} /> Back to List
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-white/10" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-8" onClick={handleSave}>
                        Save Question
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="bg-[#0A0E17] border-white/5 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-white flex items-center gap-2">
                            <FileText size={16} className="text-amber-500" /> Question Content
                          </label>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-white/5"><ImageIcon size={10} className="mr-1" /> Images</Badge>
                            <Badge variant="secondary" className="bg-white/5"><TableIcon size={10} className="mr-1" /> Tables</Badge>
                          </div>
                        </div>
                        <RichTextEditor 
                          content={contentJson} 
                          onChange={setContentJson} 
                          placeholder="Type your question here... use the toolbar for images and tables"
                        />
                      </Card>

                      {type !== 'nat' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Option A", json: optionAJson, setter: setOptionAJson },
                            { label: "Option B", json: optionBJson, setter: setOptionBJson },
                            { label: "Option C", json: optionCJson, setter: setOptionCJson },
                            { label: "Option D", json: optionDJson, setter: setOptionDJson },
                          ].map((opt, i) => (
                            <Card key={i} className="bg-[#0A0E17] border-white/5 p-4 space-y-3">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.label}</label>
                              <RichTextEditor 
                                content={opt.json} 
                                onChange={opt.setter} 
                              />
                            </Card>
                          ))}
                        </div>
                      )}

                      <Card className="bg-[#0A0E17] border-white/5 p-6 space-y-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" /> Professional Explanation
                        </label>
                        <RichTextEditor 
                          content={explanationJson} 
                          onChange={setExplanationJson} 
                          placeholder="Explain the logic behind the correct answer..."
                        />
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="bg-[#0A0E17] border-white/5 p-6 space-y-6 sticky top-8">
                        <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3">Properties</h3>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-emerald-500">Target Section</label>
                          {examSections.length > 0 ? (
                            <Select value={selectedSectionUUID} onValueChange={setSelectedSectionUUID}>
                              <SelectTrigger className="bg-black/40 border-emerald-500/20">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0A0E17] border-white/10">
                                {examSections.map((sec, idx) => {
                                  const count = questions.filter(q => q.section_id === sec.id).length;
                                  return (
                                    <SelectItem key={sec.id} value={sec.id}>
                                      Section {idx + 1}: {sec.name} ({count}/{sec.total_questions || '??'})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                              <p className="text-[10px] text-slate-400 leading-tight">No sections defined for this exam. Required for GATE structure.</p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-[10px] h-7 border-amber-500/30 text-amber-500"
                                onClick={async () => {
                                  toast({ title: "Initializing", description: "Creating GATE sections..." });
                                  const sections = [
                                    { name: "General Aptitude", order_index: 0, total_questions: 10 },
                                    { name: "Technical Section", order_index: 1, total_questions: 55 }
                                  ];
                                  const { error } = await supabase.from('exam_sections').insert(
                                    sections.map(s => ({ ...s, exam_id: selectedExamId }))
                                  );
                                  if (error) {
                                    toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
                                    console.error("Failed to initialize exam sections:", error);
                                  } else {
                                    toast({ title: "Initialized", description: "GATE sections (10/55) successfully created!" });
                                    fetchExamSections();
                                  }
                                }}
                              >
                                Initialize GATE Sections
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marks</label>
                            <Input 
                              type="number" 
                              value={marks} 
                              onChange={(e) => setMarks(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Negative</label>
                            <Input 
                              type="number" 
                              value={negativeMarks} 
                              onChange={(e) => setNegativeMarks(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question Type</label>
                          <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0E17] border-white/10">
                              <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                              <SelectItem value="msq">Multiple Select (MSQ)</SelectItem>
                              <SelectItem value="nat">Numerical Type (NAT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Q. Number</label>
                            <Input 
                              value={qNumber} 
                              onChange={e => {
                                const val = e.target.value;
                                setQNumber(val);
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                  const sec1 = examSections.find(s => s.order_index === 0 || s.name.toLowerCase().includes("aptitude"));
                                  const sec2 = examSections.find(s => s.order_index === 1 || s.name.toLowerCase().includes("technical"));
                                  if (num <= 10 && sec1) {
                                    setSelectedSectionUUID(sec1.id);
                                  } else if (num > 10 && sec2) {
                                    setSelectedSectionUUID(sec2.id);
                                  }
                                }
                              }} 
                              className="bg-black/40 border-white/10 font-mono" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correct Key</label>
                            {type === 'mcq' ? (
                              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                                <SelectTrigger className="bg-black/40 border-white/10 text-emerald-400 font-bold">
                                  <SelectValue placeholder="Select Option" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0E17] border-white/10">
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : type === 'msq' ? (
                              <div className="flex gap-3 h-10 items-center">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                  <label key={opt} className="flex items-center gap-2 text-sm text-emerald-400 font-bold cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={correctAnswer.split(',').includes(opt)}
                                      onChange={(e) => {
                                        let curr = correctAnswer ? correctAnswer.split(',') : [];
                                        if (e.target.checked) curr.push(opt);
                                        else curr = curr.filter(x => x !== opt);
                                        setCorrectAnswer(curr.sort().join(','));
                                      }}
                                      className="rounded border-white/20 bg-black/40 text-emerald-500"
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <Input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="bg-black/40 border-white/10 font-mono text-emerald-400 font-bold" placeholder="e.g. 10.5 or 10-12" />
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                          <p className="text-[10px] text-amber-500/70 font-medium">
                            <AlertTriangle size={10} className="inline mr-1" />
                            Use comma separated values for MSQ (e.g., A,B). For NAT, enter a single numerical value.
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bulk Import Tab */}
          {activeTab === "bulk" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="bg-[#0A0E17] border-white/5">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-500" /> Massive Data Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">1. Target System</label>
                    <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                      <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue placeholder="Select target exam" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0E17] border-white/10">
                        {exams.map(exam => (
                          <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">2. Upload Payload (CSV)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors relative group">
                      <Input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleBulkImport}
                        disabled={isImporting || !selectedExamId}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:bg-amber-500/10 transition-colors">
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Drop CSV file here or click to browse</p>
                        <p className="text-xs text-slate-500">Max size 50MB • Legacy Format Supported</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="flex gap-3">
                      <AlertTriangle className="text-blue-500 h-5 w-5 shrink-0" />
                      <div className="text-xs space-y-2">
                        <p className="font-bold text-blue-400 uppercase tracking-wider">CSV Protocol:</p>
                        <p className="text-slate-400">content_json, option_a_json, option_b_json, option_c_json, option_d_json, correct_answer, type, marks</p>
                        <p className="text-slate-500 italic">Note: JSON columns should be escaped strings.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SectionSetsView = ({ exam, sectionId, onBack, onSelectSet }: any) => {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSetName, setNewSetName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    console.log("SectionSetsView mounted with props:", { examId: exam?.id, sectionId });
    fetchSets();
  }, [exam.id, sectionId]);

  const fetchSets = async () => {
    setLoading(true);
    try {
      // 1. Get sets with names
      const { data: namedSets } = await supabase
        .from('exam_set_names')
        .select('*')
        .eq('exam_id', exam.id)
        .eq('section_type', sectionId)
        .order('set_number');

      // 2. Get question counts per set from exam_questions mapping
      const { data: mappings } = await supabase
        .from('exam_questions')
        .select('set_number')
        .eq('exam_id', exam.id);

      const counts: Record<number, number> = {};
      if (mappings) {
        mappings.forEach((m: any) => {
          counts[m.set_number] = (counts[m.set_number] || 0) + 1;
        });
      }

      const setsWithCounts = (namedSets || []).map((s: any) => ({
        ...s,
        qCount: counts[s.set_number] || 0
      }));

      console.log("Fetched sets with real question counts:", setsWithCounts);
      setSets(setsWithCounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = async () => {
    toast({ title: "Processing", description: `Creating box: ${newSetName}...` });
    console.log("Button clicked! Attempting to add set:", { newSetName, examId: exam?.id, sectionId });
    console.log("Current sets in state:", sets);
    
    if (!newSetName) {
      toast({ title: "Error", description: "Please enter a name for the box", variant: "destructive" });
      return;
    }

    if (!exam?.id) {
      toast({ title: "Error", description: "No exam selected. Please go back and re-select the exam.", variant: "destructive" });
      return;
    }
    
    try {
      // Calculate next set number cleanly using isolated DB ranges
      let nextDisplayNumber = 1;
      if (sets && sets.length > 0) {
        const numbers = sets.map(s => getDisplaySetNumber(s.set_number)).filter(n => !isNaN(n));
        nextDisplayNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      }
      
      const dbSetNumber = getDBSetNumber(sectionId, nextDisplayNumber);

      console.log("Inserting set with isolated database number:", dbSetNumber);

      const { data, error } = await supabase
        .from('exam_set_names')
        .insert([{
          exam_id: exam.id,
          section_type: sectionId,
          set_number: dbSetNumber,
          display_name: newSetName
        }])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      console.log("Successfully created set:", data);
      toast({ title: "Success", description: `Added new box: ${newSetName}` });
      setNewSetName("");
      setIsAdding(false);
      fetchSets();
    } catch (err: any) {
      console.error("Detailed error creating box:", err);
      toast({ title: "Error", description: err.message || "Failed to create box. Check console for details.", variant: "destructive" });
    }
  };  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingSetName, setEditingSetName] = useState("");
  const [uploadingSetId, setUploadingSetId] = useState<string | null>(null);

  const handleUploadSetPdf = async (e: React.ChangeEvent<HTMLInputElement>, setId: string, type: 'q' | 'a') => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSetId(setId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${setId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('question_pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('question_pdfs')
        .getPublicUrl(fileName);

      const field = type === 'q' ? 'question_pdf_url' : 'answer_pdf_url';
      
      const { error: dbError } = await supabase
        .from('exam_set_names')
        .update({ [field]: publicUrl })
        .eq('id', setId);

      if (dbError) throw dbError;
      
      toast({ title: "Success", description: `${type === 'q' ? 'Question' : 'Answer'} PDF uploaded for box!` });
      fetchSets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingSetId(null);
    }
  };

  const handleRemoveSetPdf = async (e: React.MouseEvent, setId: string, type: 'q' | 'a') => {
    e.stopPropagation();
    try {
      const field = type === 'q' ? 'question_pdf_url' : 'answer_pdf_url';
      const { error } = await supabase
        .from('exam_set_names')
        .update({ [field]: null })
        .eq('id', setId);

      if (error) throw error;
      toast({ title: "Success", description: "PDF removed successfully!" });
      fetchSets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRenameSet = async (setId: string) => {
    if (!editingSetName) return;
    try {
      const { error } = await supabase
        .from('exam_set_names')
        .update({ display_name: editingSetName })
        .eq('id', setId);
      
      if (error) throw error;
      toast({ title: "Success", description: "Box renamed successfully" });
      setEditingSetId(null);
      fetchSets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-slate-400 hover:text-white gap-2"
        >
          <ArrowLeft size={16} /> Back to Sections
        </Button>

        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-amber-500 text-black hover:bg-amber-400 font-bold gap-2"
        >
          <Plus size={18} /> Add New Box
        </Button>
      </div>

      <div className="flex items-end gap-6 pb-8 border-b border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          {sectionId === 'pyqs' ? <FileText className="text-blue-400" /> : <Target className="text-purple-400" />}
        </div>
        <div>
          <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">{sectionId} Management</h2>
          <p className="text-slate-500 font-medium mt-1">{exam.name} — Select a box to manage questions.</p>
        </div>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-4 items-end"
        >
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">New Box Name</label>
            <Input 
              placeholder="e.g. GATE 2024 Official Paper" 
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              className="bg-black/40 border-white/10"
            />
          </div>
          <Button onClick={handleAddSet} className="bg-amber-500 text-black hover:bg-amber-400 font-bold">Create Box</Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-slate-500 uppercase text-[10px] font-black tracking-widest">
            Loading your content engine...
          </div>
        ) : sets.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No boxes found. Click "Add New Box" to start.</p>
          </div>
        ) : (
          sets.map((set) => (
            <motion.div
              key={set.id}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-4 rounded-2xl bg-[#0A0E17] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group flex flex-col justify-between h-auto min-h-[220px]"
            >
              <div className="flex justify-between items-start">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5">
                  {String(getDisplaySetNumber(set.set_number)).padStart(2, '0')}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-slate-600 hover:text-amber-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSetId(set.id);
                    setEditingSetName(set.display_name);
                  }}
                >
                  <Pencil size={14} />
                </Button>
              </div>
              
              <div className="mt-4" onClick={() => onSelectSet(set.set_number)}>
                {editingSetId === set.id ? (
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <Input 
                      value={editingSetName}
                      onChange={e => setEditingSetName(e.target.value)}
                      className="h-8 text-xs bg-black/40 border-amber-500/30"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-6 px-2 text-[8px] bg-emerald-600" onClick={() => handleRenameSet(set.id)}>Save</Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[8px]" onClick={() => setEditingSetId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">
                    {set.display_name}
                  </h4>
                )}
                
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500">Question PDF</span>
                    {set.question_pdf_url ? (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="text-[9px] font-black text-emerald-500">Uploaded</span>
                        <X size={10} className="text-emerald-500 hover:text-red-500 cursor-pointer transition-colors" onClick={(e) => handleRemoveSetPdf(e, set.id, 'q')} />
                      </div>
                    ) : (
                      <label className="text-[9px] font-bold text-amber-500 hover:text-amber-400 cursor-pointer">
                        Upload
                        <input type="file" accept=".pdf" className="hidden" onChange={e => handleUploadSetPdf(e, set.id, 'q')} disabled={uploadingSetId === set.id} />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500">Answer PDF</span>
                    {set.answer_pdf_url ? (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="text-[9px] font-black text-emerald-500">Uploaded</span>
                        <X size={10} className="text-emerald-500 hover:text-red-500 cursor-pointer transition-colors" onClick={(e) => handleRemoveSetPdf(e, set.id, 'a')} />
                      </div>
                    ) : (
                      <label className="text-[9px] font-bold text-amber-500 hover:text-amber-400 cursor-pointer">
                        Upload
                        <input type="file" accept=".pdf" className="hidden" onChange={e => handleUploadSetPdf(e, set.id, 'a')} disabled={uploadingSetId === set.id} />
                      </label>
                    )}
                  </div>
                  {uploadingSetId === set.id && (
                    <div className="text-[9px] text-amber-500 animate-pulse text-center mt-2">Uploading...</div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    {set.qCount > 0 ? `${set.qCount} Qs` : 'Empty Box'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black text-amber-500 uppercase group-hover:text-amber-400">Manage</span>
                    <ArrowRight size={10} className="text-slate-600 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;
