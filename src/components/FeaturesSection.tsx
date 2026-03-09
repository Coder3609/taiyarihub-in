import { motion } from "framer-motion";
import {
  Brain,
  Timer,
  BarChart3,
  Video,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Smart recommendations adapt to your strengths and weaknesses in real time.",
  },
  {
    icon: Timer,
    title: "Real Exam Simulation",
    description: "Timed tests that mirror the exact pattern, marking scheme, and interface.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Topic-wise breakdown, percentile ranking, and trend analysis of your performance.",
  },
  {
    icon: Video,
    title: "Video Solutions",
    description: "Expert-crafted video explanations for complex problems and concepts.",
  },
  {
    icon: ShieldCheck,
    title: "Verified PYQs",
    description: "Curated previous year questions with accuracy-checked solutions.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Difficulty",
    description: "Questions that level up with you — always in your zone of growth.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-gradient-surface">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-display font-semibold text-sm uppercase tracking-wider">
            Why Taiyari Hub
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Built for Serious Aspirants
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every feature designed to maximize your score and minimize wasted effort.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-card"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
