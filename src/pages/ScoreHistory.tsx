import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, Calendar, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface HistoryItem {
  id: string;
  score: number;
  total: number;
  section_type: string;
  set_number: number;
  created_at: string;
  time_taken_seconds: number;
  exam_id: string;
}

const ScoreHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth", { replace: true }); return; }

    supabase
      .from("user_results")
      .select("id, score, total, section_type, set_number, created_at, time_taken_seconds, exam_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResults((data || []) as HistoryItem[]);
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Trophy className="h-7 w-7 text-primary" />
            Score History
          </h1>

          {results.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No exam results yet. Start practicing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r, i) => {
                const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
                const date = new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/results/${r.id}`)}
                    className="rounded-xl border border-border/50 bg-card p-4 cursor-pointer hover:border-primary/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {r.section_type.replace(/_/g, " ")} — Set {r.set_number}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {date}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold text-lg ${
                        pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-destructive"
                      }`}>
                        {pct}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{r.score}/{r.total}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScoreHistory;
