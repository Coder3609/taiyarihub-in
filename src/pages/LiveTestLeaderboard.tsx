import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Loader2, Medal, Trophy } from "lucide-react";

interface Attempt {
  id: string;
  user_id: string;
  score: number;
  total: number;
  time_taken_seconds: number;
  submitted_at: string;
}

const LiveTestLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { username: string | null; full_name: string | null; avatar_url: string | null }>>({});
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from("live_tests").select("id,title,exam_name,start_at,end_at").eq("id", id).maybeSingle(),
        supabase.from("live_test_attempts").select("*").eq("live_test_id", id),
      ]);
      setTest(t);
      const sorted = ((a as Attempt[]) || []).sort((x, y) => {
        if (y.score !== x.score) return y.score - x.score;
        return x.time_taken_seconds - y.time_taken_seconds;
      });
      setAttempts(sorted);
      if (sorted.length) {
        const ids = Array.from(new Set(sorted.map((s) => s.user_id)));
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,username,full_name,avatar_url")
          .in("id", ids);
        const map: any = {};
        (profs || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, [id]);

  const formatT = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Leaderboard</h1>
            {test && <p className="text-sm text-muted-foreground">{test.exam_name} • {test.title}</p>}
          </div>
        </div>

        {attempts.length === 0 ? (
          <Card className="bg-gradient-card">
            <CardContent className="py-10 text-center text-muted-foreground">
              No submissions yet. Be the first!
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border/60">
            <CardContent className="p-0 divide-y divide-border/40">
              {attempts.map((a, i) => {
                const p = profiles[a.user_id];
                const name = p?.full_name || p?.username || "Anonymous";
                const isMe = user?.id === a.user_id;
                const rank = i + 1;
                const rankColor = rank === 1 ? "text-amber-400" : rank === 2 ? "text-zinc-300" : rank === 3 ? "text-orange-500" : "text-muted-foreground";
                return (
                  <div key={a.id} className={`flex items-center gap-3 p-3 ${isMe ? "bg-primary/5" : ""}`}>
                    <div className={`w-8 text-center font-display font-bold ${rankColor}`}>
                      {rank <= 3 ? <Medal className="h-5 w-5 mx-auto" /> : `#${rank}`}
                    </div>
                    {p?.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {name} {isMe && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.score}/{a.total} • {formatT(a.time_taken_seconds)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-primary">{a.score}</p>
                      <p className="text-[10px] text-muted-foreground">/{a.total}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LiveTestLeaderboard;
