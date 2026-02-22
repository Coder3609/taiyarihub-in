import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={onStart} className="w-full sm:w-auto font-display font-semibold">
            Start Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamInstructionsDialog;
