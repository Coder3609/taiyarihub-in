import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ScoreOverviewProps {
  score: number;
  total: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
}

const ScoreOverview = ({ score, total, correctCount, incorrectCount, unansweredCount, percentage }: ScoreOverviewProps) => {
  const pieData = [
    { name: "Correct", value: correctCount, color: "hsl(142, 71%, 45%)" },
    { name: "Incorrect", value: incorrectCount, color: "hsl(0, 84%, 60%)" },
    { name: "Unanswered", value: unansweredCount, color: "hsl(215, 20%, 55%)" },
  ].filter(d => d.value > 0);

  const accuracy = correctCount + incorrectCount > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", label: "Outstanding", color: "text-emerald-400" };
    if (percentage >= 80) return { grade: "A", label: "Excellent", color: "text-emerald-400" };
    if (percentage >= 70) return { grade: "B+", label: "Very Good", color: "text-primary" };
    if (percentage >= 60) return { grade: "B", label: "Good", color: "text-primary" };
    if (percentage >= 50) return { grade: "C", label: "Average", color: "text-amber-400" };
    if (percentage >= 40) return { grade: "D", label: "Below Average", color: "text-amber-400" };
    return { grade: "F", label: "Needs Improvement", color: "text-destructive" };
  };

  const gradeInfo = getGrade();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        {/* Pie Chart */}
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 9%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-foreground">{percentage}%</span>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
        </div>

        {/* Score details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <Trophy className={`h-6 w-6 ${gradeInfo.color}`} />
              <span className={`font-display text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            </div>
            <p className="text-muted-foreground text-sm">{gradeInfo.label} — {score} out of {total} correct</p>
          </div>

          {/* Pie legend */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}: <span className="text-foreground font-semibold">{d.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/30">
        {[
          { icon: Target, label: "Accuracy", value: `${accuracy}%`, desc: "Of attempted", color: "text-emerald-400" },
          { icon: TrendingUp, label: "Score", value: `${score}/${total}`, desc: "Total marks", color: "text-primary" },
          { icon: Zap, label: "Attempted", value: `${correctCount + incorrectCount}`, desc: `Out of ${total}`, color: "text-amber-400" },
          { icon: Trophy, label: "Percentile", value: percentage >= 90 ? "Top 10%" : percentage >= 70 ? "Top 30%" : percentage >= 50 ? "Top 50%" : "Below 50%", desc: "Estimated", color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-secondary/40 p-3 text-center">
            <stat.icon className={`h-4 w-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className="font-display font-bold text-foreground text-base">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="text-[9px] text-muted-foreground/60">{stat.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ScoreOverview;
