import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, MapPin, GraduationCap, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categories = [
  {
    icon: Landmark,
    title: "Central Exams",
    description: "UPSC, SSC, Banking, Railways & more",
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "hover:border-amber-500/50",
    route: "/exams/central",
    free: true,
  },
  {
    icon: MapPin,
    title: "State Exams",
    description: "29 States & 8 Union Territories",
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "hover:border-emerald-500/50",
    route: "/exams/state",
    free: true,
  },
  {
    icon: GraduationCap,
    title: "School Level",
    description: "CBSE, ICSE & State Boards",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "hover:border-blue-500/50",
    route: "/exams/school",
    free: false,
  },
  {
    icon: Globe,
    title: "Foreign Exams",
    description: "GRE, TOEFL, IELTS, SAT & more",
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "hover:border-purple-500/50",
    route: "/exams/foreign",
    free: false,
  },
];

interface ExamCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExamCategoryDialog = ({ open, onOpenChange }: ExamCategoryDialogProps) => {
  const navigate = useNavigate();

  const handleSelect = (route: string | null) => {
    if (route) {
      onOpenChange(false);
      navigate(route);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">Choose Exam Category</DialogTitle>
          <DialogDescription className="text-center">
            Select a category to explore available exams
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(cat.route)}
              className={`relative rounded-xl p-5 bg-gradient-to-br ${cat.color} border border-border/50 ${cat.borderColor} ${cat.route ? "cursor-pointer" : "cursor-not-allowed opacity-60"} transition-all group`}
            >
              <cat.icon className="h-7 w-7 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-bold text-foreground mb-1">{cat.title}</h3>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
              <div className="mt-3 flex gap-2">
                {cat.free && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    FREE TIER
                  </span>
                )}
                {!cat.route && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                    COMING SOON
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamCategoryDialog;
