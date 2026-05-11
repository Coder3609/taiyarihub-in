import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Clock, Loader2, Send, Trophy } from "lucide-react";

interface Question {
  question_text?: string;
  text?: string;
  option_a?: string; option_b?: string; option_c?: string; option_d?: string;
  options?: string[];
  correct_answer?: string;
  correct?: string;
}

interface LiveTest {
  id: string;
  title: string;
  exam_name: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  questions: Question[];
}

const normalize = (q: Question) => {
  const text = q.question_text ?? q.text ?? "";
  const opts = q.options ?? [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean) as string[];
  const correct = (q.correct_answer ?? q.correct ?? "").toString().trim().toUpperCase();
  return { text, opts, correct };
};

const LiveTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState<LiveTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from("live_tests").select("*").eq("id", id).maybeSingle();
      setTest(data as any);
      if (user && data) {
        const { data: existing } = await supabase
          .from("live_test_attempts")
          .select("id")
          .eq("live_test_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (existing) setAlreadyAttempted(true);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const isLive = test ? Date.now() >= new Date(test.start_at).getTime() && Date.now() <= new Date(test.end_at).getTime() : false;
  const timeLeft = test ? new Date(test.end_at).getTime() - now : 0;

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const submit = async () => {
    if (!test || !user) return;
    setSubmitting(true);
    let correct = 0, incorrect = 0, unanswered = 0;
    test.questions.forEach((q, i) => {
      const { correct: ans } = normalize(q);
      const a = answers[i];
      if (!a) unanswered++;
      else if (a.toString().trim().toUpperCase() === ans) correct++;
      else incorrect++;
    });
    const score = correct;
    const total = test.questions.length;
    const time_taken_seconds = Math.floor((Date.now() - startedAt) / 1000);

    const { error } = await supabase.from("live_test_attempts").insert({
      live_test_id: test.id,
      user_id: user.id,
      score, total, correct_count: correct, incorrect_count: incorrect,
      unanswered_count: unanswered, time_taken_seconds, answers,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You have already submitted this test" : error.message);
      return;
    }
    toast.success("Submitted! Redirecting to leaderboard…");
    navigate(`/live-test/${test.id}/leaderboard`);
  };

  // Auto-submit when time runs out
  useEffect(() => {
    if (test && isLive && timeLeft <= 0 && !submitting) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, test, isLive]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!test) return <div className="min-h-screen flex items-center justify-center text-foreground">Test not found</div>;

  if (alreadyAttempted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 container mx-auto px-4 max-w-2xl">
          <Card className="bg-gradient-card">
            <CardContent className="py-10 text-center space-y-4">
              <Trophy className="h-12 w-12 mx-auto text-primary" />
              <h1 className="font-display text-xl font-bold text-foreground">Already Submitted</h1>
              <p className="text-muted-foreground text-sm">You can attempt each live test only once.</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => navigate(`/live-test/${test.id}/leaderboard`)}>
                  <Trophy className="h-4 w-4 mr-1.5" /> View Leaderboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Back</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 container mx-auto px-4 max-w-2xl">
          <Card className="bg-gradient-card">
            <CardContent className="py-10 text-center space-y-3">
              <h1 className="font-display text-xl font-bold text-foreground">
                {Date.now() < new Date(test.start_at).getTime() ? "Test hasn't started yet" : "Test has ended"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date(test.start_at).toLocaleString()} → {new Date(test.end_at).toLocaleString()}
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => navigate(`/live-test/${test.id}/leaderboard`)}>
                  <Trophy className="h-4 w-4 mr-1.5" /> Leaderboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Back</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4 sticky top-16 z-30 bg-background/90 backdrop-blur py-3 -mx-4 px-4 border-b border-border/50">
          <div>
            <Badge className="mb-1" variant="outline">LIVE • {test.exam_name}</Badge>
            <h1 className="font-display text-lg font-bold text-foreground">{test.title}</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/30">
            <Clock className="h-4 w-4 text-destructive" />
            <span className="font-mono font-bold text-destructive">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {test.questions.map((q, i) => {
            const { text, opts } = normalize(q);
            const letters = ["A", "B", "C", "D", "E"];
            return (
              <Card key={i} className="bg-card border-border/60">
                <CardContent className="pt-5 space-y-3">
                  <p className="font-semibold text-foreground">
                    Q{i + 1}. {text}
                  </p>
                  <div className="grid gap-2">
                    {opts.map((o, j) => {
                      const letter = letters[j];
                      const selected = answers[i] === letter;
                      return (
                        <button
                          key={j}
                          onClick={() => setAnswers((a) => ({ ...a, [i]: letter }))}
                          className={`text-left px-3 py-2 rounded-md border transition-colors text-sm ${
                            selected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/60 bg-muted/30 text-foreground hover:border-primary/40"
                          }`}
                        >
                          <span className="font-bold mr-2">{letter}.</span>{o}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/60 p-3">
          <div className="container mx-auto max-w-3xl flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {Object.keys(answers).length} / {test.questions.length} answered
            </span>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Submit Test
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveTest;
