import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Shield,
  MonitorOff,
  Timer,
  Navigation,
  Bookmark,
} from "lucide-react";

interface ExamInstructionsPageProps {
  onStart: () => void;
  onCancel: () => void;
  examName: string;
  totalQuestions: number;
  durationMinutes: number;
}

const ExamInstructionsPage = ({
  onStart,
  onCancel,
  examName,
  totalQuestions,
  durationMinutes,
}: ExamInstructionsPageProps) => {
  const [accepted, setAccepted] = useState(false);

  const mcqCount = Math.max(totalQuestions - 15, 0);
  const integerCount = Math.min(15, totalQuestions);

  const instructions = [
    {
      icon: FileText,
      text: (
        <>
          The examination contains <strong className="text-foreground">2 sections</strong> — MCQ/MSQ and Numerical Answer Type (NAT). Total{" "}
          <strong className="text-foreground">{totalQuestions} questions</strong>.
        </>
      ),
    },
    {
      icon: TrendingUp,
      text: (
        <>
          Each MCQ/MSQ carries <strong className="text-foreground">+2 marks</strong> for a correct answer and{" "}
          <strong className="text-destructive">-0.67 mark</strong> for every incorrect answer (negative marking).
        </>
      ),
    },
    {
      icon: Timer,
      text: (
        <>
          Total duration of the examination is{" "}
          <strong className="text-foreground">{durationMinutes} minutes</strong>. The exam will auto-submit when the time
          expires.
        </>
      ),
    },
    {
      icon: Navigation,
      text: (
        <>
          You can navigate between questions using the <strong className="text-foreground">Previous</strong> and{" "}
          <strong className="text-foreground">Save & Next</strong> buttons, or by clicking question numbers in the
          palette.
        </>
      ),
    },
    {
      icon: Bookmark,
      text: (
        <>
          You can <strong className="text-foreground">Mark for Review</strong> any question to revisit it later. The
          question palette uses color coding to show the status of each question.
        </>
      ),
    },
  ];

  const legendItems = [
    { label: "Not Visited", color: "bg-muted text-muted-foreground" },
    { label: "Not Answered", color: "bg-destructive text-destructive-foreground" },
    { label: "Answered", color: "bg-emerald-500 text-white" },
    { label: "Marked for Review", color: "bg-purple-500 text-white" },
    { label: "Answered & Marked", color: "bg-emerald-500 text-white ring-2 ring-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary/90 to-primary p-6 md:p-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{examName}</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">GATE Examination</p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-card border border-border/50 divide-x divide-border/50">
            {[
              { icon: Clock, label: "Duration", value: `${durationMinutes} mins` },
              { icon: FileText, label: "Questions", value: String(totalQuestions) },
              { label: "Per Correct", value: "+2 marks", accent: "text-emerald-400" },
              { label: "Per Wrong", value: "-0.67 mark", accent: "text-destructive" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-4 px-2 gap-1">
                {item.icon ? (
                  <item.icon className="h-5 w-5 text-primary mb-1" />
                ) : (
                  <span className={`text-lg font-bold ${item.accent}`}>
                    {item.value.startsWith("+") ? "+2" : "-1"}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* General Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">General Instructions</h2>
          </div>

          <div className="space-y-4">
            {instructions.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Question Palette Legend */}
          <div className="rounded-xl bg-secondary/40 border border-border/30 p-4 mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Question Palette Legend:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {legendItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${item.color}`}
                  >
                    1
                  </span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Agreement + Start */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer select-none"
            >
              I have read and understood the instructions. I agree to abide by the rules of this examination. I
              understand that any unfair means will lead to disqualification.
            </label>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={onStart}
              disabled={!accepted}
              className="font-display font-semibold px-6"
            >
              Begin Exam <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamInstructionsPage;
