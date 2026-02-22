import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Clock, AlertTriangle, MonitorOff, CheckCircle2 } from "lucide-react";

interface ExamInstructionsDialogProps {
  open: boolean;
  onStart: () => void;
  onCancel: () => void;
  examName: string;
  totalQuestions: number;
  durationMinutes: number;
}

const ExamInstructionsDialog = ({
  open,
  onStart,
  onCancel,
  examName,
  totalQuestions,
  durationMinutes,
}: ExamInstructionsDialogProps) => {
  const [accepted, setAccepted] = useState(false);

  const instructions = [
    {
      icon: Clock,
      text: `You have ${durationMinutes} minutes to complete ${totalQuestions} questions.`,
      color: "text-blue-400",
    },
    {
      icon: Shield,
      text: "The exam will enter fullscreen mode. Do not exit fullscreen.",
      color: "text-emerald-400",
    },
    {
      icon: MonitorOff,
      text: "Tab switches are monitored and recorded.",
      color: "text-amber-400",
    },
    {
      icon: AlertTriangle,
      text: "The exam auto-submits when the timer reaches zero.",
      color: "text-red-400",
    },
    {
      icon: CheckCircle2,
      text: "You can navigate between questions and change answers anytime.",
      color: "text-purple-400",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Exam Instructions</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {examName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {instructions.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <item.icon className={`h-5 w-5 shrink-0 mt-0.5 ${item.color}`} />
              <p className="text-sm text-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
            I have read and agree to the exam rules above. I understand that tab switches will be recorded and the exam will auto-submit when time runs out.
          </label>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={onStart}
            disabled={!accepted}
            className="w-full sm:w-auto font-display font-semibold"
          >
            Start Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamInstructionsDialog;
