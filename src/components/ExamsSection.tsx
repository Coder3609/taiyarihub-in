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
  { icon: Cpu, name: "GATE", subjects: "CSE, ECE, ME, EE & more", color: "from-blue-500/20 to-blue-600/5" },
  { icon: Landmark, name: "UPSC", subjects: "Prelims, Mains & Interview", color: "from-emerald-500/20 to-emerald-600/5" },
  { icon: FlaskConical, name: "JEE", subjects: "Mains & Advanced", color: "from-orange-500/20 to-orange-600/5" },
  { icon: FileText, name: "SSC", subjects: "CGL, CHSL & MTS", color: "from-purple-500/20 to-purple-600/5" },
  { icon: Briefcase, name: "Banking", subjects: "SBI PO, IBPS & RBI", color: "from-cyan-500/20 to-cyan-600/5" },
  { icon: GraduationCap, name: "CBSE/Boards", subjects: "Class X, XI & XII", color: "from-pink-500/20 to-pink-600/5" },
  { icon: Globe, name: "GRE/TOEFL", subjects: "Verbal, Quant & AWA", color: "from-yellow-500/20 to-yellow-600/5" },
  { icon: Calculator, name: "CA/CS", subjects: "Foundation to Final", color: "from-red-500/20 to-red-600/5" },
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {exams.map((exam) => (
            <motion.div
              key={exam.name}
              variants={item}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative rounded-xl p-6 bg-gradient-to-br ${exam.color} border border-border/50 cursor-pointer group transition-shadow hover:shadow-card`}
            >
              <exam.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {exam.name}
              </h3>
              <p className="text-xs text-muted-foreground">{exam.subjects}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ExamsSection;
