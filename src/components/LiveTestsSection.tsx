import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Clock, Trophy, CalendarClock, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface ExamRow { id: string; slug: string; name: string; category: string; }
interface LiveTest {
  id: string;
  exam_slug: string;
  exam_name: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  questions: any[];
}

type Status = "upcoming" | "live" | "ended";

const getStatus = (start: string, end: string, now: Date): Status => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const n = now.getTime();
  if (n < s) return "upcoming";
  if (n > e) return "ended";
  return "live";
};

const formatCountdown = (target: string, now: Date) => {
  const diff = new Date(target).getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const getExamScheduleMessage = (slug: string, name: string) => {
  const lower = slug.toLowerCase();
  if (lower.includes("gate")) {
    return `Live tests for ${name} will start in November (exactly 3 months before the GATE exam in February).`;
  }
  if (lower.includes("neet")) {
    return `Live tests for ${name} will start in February (exactly 3 months before the NEET exam in May).`;
  }
  if (lower.includes("jee")) {
    return `Live tests for ${name} will start in October (exactly 3 months before the JEE Mains exam in January).`;
  }
  return `Live tests for ${name} will start exactly 3 months before the official exam date.`;
};

const LiveTestsSection = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("__all");

  const selectedExamName = useMemo(() => {
    if (selectedSlug === "__all") return "";
    return exams.find(e => e.slug === selectedSlug)?.name ?? selectedSlug;
  }, [selectedSlug, exams]);
  const [tests, setTests] = useState<LiveTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("exams").select("id,slug,name,category").order("name");
      setExams((data as ExamRow[]) || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase
        .from("live_tests")
        .select("*")
        .eq("is_published", true)
        .order("start_at", { ascending: false });
      if (selectedSlug !== "__all") q = q.eq("exam_slug", selectedSlug);
      const { data } = await q;
      setTests((data as any) || []);
      setLoading(false);
    })();
  }, [selectedSlug]);

  const sorted = useMemo(() => {
    const withStatus = tests.map((t) => ({ ...t, _status: getStatus(t.start_at, t.end_at, now) }));
    const order: Record<Status, number> = { live: 0, upcoming: 1, ended: 2 };
    return withStatus.sort((a, b) => order[a._status] - order[b._status]);
  }, [tests, now]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Radio className="h-5 w-5 text-destructive" />
            </motion.div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Live Tests
            </h2>
            <Badge variant="outline" className="border-destructive/40 text-destructive">
              NEW
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduled mock tests with live leaderboards
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedSlug} onValueChange={setSelectedSlug}>
            <SelectTrigger className="bg-card border-border/60">
              <SelectValue placeholder="Filter by exam" />
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-popover">
              <SelectItem value="__all">All Exams</SelectItem>
              {exams.map((e) => (
                <SelectItem key={e.id} value={e.slug}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <Card className="bg-gradient-card border-dashed border-border/60">
          <CardContent className="py-10 text-center">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No live tests scheduled {selectedSlug !== "__all" ? "for this exam" : "yet"}. Check back soon!
            </p>
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-2">
              <span>💡</span>
              <p>
                 {selectedSlug === "__all" 
                  ? "Live mock tests will start exactly 3 months before each exam. (e.g., GATE tests commence in November, JEE in October, NEET in February)."
                  : getExamScheduleMessage(selectedSlug, selectedExamName)}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {sorted.map((t, i) => {
            const status = (t as any)._status as Status;
            const total = Array.isArray(t.questions) ? t.questions.length : 0;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`bg-gradient-card border-border/60 transition-all relative overflow-hidden h-full
                  ${status === "live" ? "border-destructive/50 shadow-[0_0_30px_-10px_hsl(var(--destructive)/0.6)]" : ""}
                  ${status === "upcoming" ? "border-primary/30" : ""}
                `}>
                  {status === "live" && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/15 border border-destructive/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      <span className="text-[10px] font-bold text-destructive tracking-wider">LIVE</span>
                    </div>
                  )}
                  {status === "upcoming" && (
                    <Badge className="absolute top-3 right-3" variant="outline">UPCOMING</Badge>
                  )}
                  {status === "ended" && (
                    <Badge className="absolute top-3 right-3" variant="secondary">ENDED</Badge>
                  )}

                  <CardContent className="pt-6 pb-5 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider text-primary uppercase mb-1">
                        {t.exam_name}
                      </p>
                      <h3 className="font-display font-bold text-foreground leading-tight pr-16">
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{t.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes} min</span>
                      <span>•</span>
                      <span>{total} Qs</span>
                    </div>

                    {status === "upcoming" && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Starts in</p>
                        <p className="font-mono font-bold text-primary text-lg">
                          {formatCountdown(t.start_at, now)}
                        </p>
                      </div>
                    )}
                    {status === "live" && (
                      <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Ends in</p>
                        <p className="font-mono font-bold text-destructive text-lg">
                          {formatCountdown(t.end_at, now)}
                        </p>
                      </div>
                    )}
                    {status === "ended" && (
                      <p className="text-xs text-muted-foreground">
                        Ended {new Date(t.end_at).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      {status === "live" && (
                        <Button size="sm" className="flex-1" onClick={() => navigate(`/live-test/${t.id}`)}>
                          Join Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                      {status === "upcoming" && (
                        <Button size="sm" variant="outline" className="flex-1" disabled>
                          <CalendarClock className="h-3.5 w-3.5 mr-1" /> Scheduled
                        </Button>
                      )}
                      {status === "ended" && (
                        <Button size="sm" className="flex-1" onClick={() => navigate(`/live-test/${t.id}/leaderboard`)}>
                          <Trophy className="h-3.5 w-3.5 mr-1" /> Leaderboard
                        </Button>
                      )}
                      {status !== "ended" && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/live-test/${t.id}/leaderboard`)}>
                          <Trophy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default LiveTestsSection;
