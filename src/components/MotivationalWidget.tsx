import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles, Flame, Trophy, Target, BookOpen } from "lucide-react";

const MOTIVATIONAL_FACTS = [
  { text: "Consistent practice increases exam success rate by 70%.", icon: Flame, color: "text-orange-500" },
  { text: "UPSC: Consistency and revision are your best weapons.", icon: Target, color: "text-blue-500" },
  { text: "GATE: Focus on core subjects; they carry the maximum weightage.", icon: Lightbulb, color: "text-amber-500" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", icon: Trophy, color: "text-emerald-500" },
  { text: "JEE: Speed and accuracy are the two pillars of cracking it.", icon: Sparkles, color: "text-purple-500" },
  { text: "NEET: NCERT books are your ultimate guide for biology.", icon: BookOpen, color: "text-emerald-400" },
  { text: "Boards: Answer writing presentation can boost your scores significantly.", icon: Target, color: "text-blue-400" },
  { text: "Every mock test you take brings you one step closer to your goal.", icon: Trophy, color: "text-amber-500" }
];

const MotivationalWidget = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOTIVATIONAL_FACTS.length);
    }, 10000); // Changes every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const currentFact = MOTIVATIONAL_FACTS[currentIndex];
  const Icon = currentFact.icon;

  return (
    <div className="flex items-center gap-3 bg-[#131929] border border-border/40 px-4 py-2.5 rounded-xl shrink-0 w-full sm:w-[380px] overflow-hidden">
      <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10">
        <Icon className={`h-5 w-5 ${currentFact.color}`} />
      </div>
      <div className="flex-1 min-w-0 relative flex flex-col justify-center py-1">
        <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1.5">
          Did you know?
        </p>
        <div className="relative h-8 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-semibold text-foreground leading-snug absolute inset-0 line-clamp-2"
            >
              {currentFact.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MotivationalWidget;
