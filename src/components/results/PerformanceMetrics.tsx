import { motion } from "framer-motion";
import { Clock, Eye, BarChart3, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetricsProps {
  timeTakenSeconds: number;
  tabSwitches: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  total: number;
  durationMinutes?: number;
}

const PerformanceMetrics = ({
  timeTakenSeconds,
  tabSwitches,
  correctCount,
  incorrectCount,
  unansweredCount,
  total,
  durationMinutes = 60,
}: PerformanceMetricsProps) => {
  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;
  const totalDuration = durationMinutes * 60;
  const timeUsed = Math.min(Math.round((timeTakenSeconds / totalDuration) * 100), 100);
  const attempted = correctCount + incorrectCount;
  const avgTimePerQ = attempted > 0 ? Math.round(timeTakenSeconds / attempted) : 0;
  const attemptRate = total > 0 ? Math.round((attempted / total) * 100) : 0;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  const getSpeedRating = () => {
    if (avgTimePerQ < 60) return { label: "Fast", color: "text-emerald-400" };
    if (avgTimePerQ < 120) return { label: "Moderate", color: "text-primary" };
    return { label: "Slow", color: "text-amber-400" };
  };

  const speedRating = getSpeedRating();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card p-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" /> Performance Metrics
      </h3>

      <div className="space-y-5">
        {/* Time Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Time Used
            </span>
            <span className="font-display font-bold text-foreground">{minutes}m {seconds}s</span>
          </div>
          <Progress value={timeUsed} className="h-2" />
          <p className="text-[10px] text-muted-foreground">{timeUsed}% of allotted {durationMinutes} minutes</p>
        </div>

        {/* Attempt Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" /> Attempt Rate
            </span>
            <span className="font-display font-bold text-foreground">{attempted}/{total}</span>
          </div>
          <Progress value={attemptRate} className="h-2" />
          <p className="text-[10px] text-muted-foreground">{attemptRate}% questions attempted</p>
        </div>

        {/* Accuracy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-display font-bold text-foreground">{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
          <p className="text-[10px] text-muted-foreground">{correctCount} correct out of {attempted} attempted</p>
        </div>

        {/* Speed & Integrity */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Avg. Time/Question</p>
            <p className="font-display font-bold text-foreground">{avgTimePerQ}s</p>
            <p className={`text-[10px] font-semibold ${speedRating.color}`}>{speedRating.label}</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" /> Tab Switches
            </p>
            <p className={`font-display font-bold ${tabSwitches > 0 ? "text-destructive" : "text-emerald-400"}`}>{tabSwitches}</p>
            <p className="text-[10px] text-muted-foreground">{tabSwitches === 0 ? "Clean" : "Flagged"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetrics;
