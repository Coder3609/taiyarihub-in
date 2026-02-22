import { motion } from "framer-motion";
import {
  Cpu,
  Landmark,
  FlaskConical,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  Calculator,
} from "lucide-react";

const exams = [
  { icon: Cpu, name: "GATE", subjects: "CSE, ECE, ME, EE & more", color: "from-blue-500/30 to-blue-600/10", accent: "text-blue-500" },
  { icon: Landmark, name: "UPSC", subjects: "Prelims, Mains & Interview", color: "from-emerald-500/30 to-emerald-600/10", accent: "text-emerald-500" },
  { icon: FlaskConical, name: "JEE", subjects: "Mains & Advanced", color: "from-orange-500/30 to-orange-600/10", accent: "text-orange-500" },
  { icon: FileText, name: "SSC", subjects: "CGL, CHSL & MTS", color: "from-purple-500/30 to-purple-600/10", accent: "text-purple-500" },
  { icon: Briefcase, name: "Banking", subjects: "SBI PO, IBPS & RBI", color: "from-cyan-500/30 to-cyan-600/10", accent: "text-cyan-500" },
  { icon: GraduationCap, name: "CBSE/Boards", subjects: "Class X, XI & XII", color: "from-pink-500/30 to-pink-600/10", accent: "text-pink-500" },
  { icon: Globe, name: "GRE/TOEFL", subjects: "Verbal, Quant & AWA", color: "from-yellow-500/30 to-yellow-600/10", accent: "text-yellow-500" },
  { icon: Calculator, name: "CA/CS", subjects: "Foundation to Final", color: "from-red-500/30 to-red-600/10", accent: "text-red-500" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ExamsSection = () => {
  return (
    <section id="exams" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-display font-semibold text-sm uppercase tracking-wider">
            Explore Exams
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            One Platform, Every Exam
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From engineering to civil services — we cover the most competitive exams in India and abroad.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {exams.map((exam) => (
            <motion.div
              key={exam.name}
              variants={item}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative rounded-xl p-4 bg-gradient-to-br ${exam.color} border border-border/50 cursor-pointer group transition-shadow hover:shadow-card`}
            >
              <exam.icon className={`h-6 w-6 ${exam.accent} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="font-display font-bold text-sm text-foreground mb-0.5">
                {exam.name}
              </h3>
              <p className="text-[11px] text-muted-foreground">{exam.subjects}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ExamsSection;
