import { motion } from "framer-motion";
import { Check, Crown, Zap, Landmark, MapPin, GraduationCap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  {
    id: "central",
    label: "Central Exams",
    icon: Landmark,
    description: "GATE, UPSC, SSC, Banking & more",
    free: true,
    plans: [
      {
        name: "1-Year Access",
        price: "₹1,799",
        period: "/year",
        features: [
          "Unlimited test attempts",
          "Full PYQ & question bank",
          "Video solutions library",
          "AI-powered analytics",
          "Percentile ranking",
          "Priority support",
        ],
      },
      {
        name: "Lifetime (3-Year)",
        price: "₹3,999",
        period: "one-time",
        features: [
          "Everything in 1-Year plan",
          "3-year full access",
          "Early access to new content",
          "1-on-1 doubt clearing",
          "Exclusive study groups",
          "Certificate of completion",
        ],
      },
    ],
  },
  {
    id: "state",
    label: "State Exams",
    icon: MapPin,
    description: "29 States & 8 Union Territories",
    free: true,
    plans: [
      {
        name: "1-Year Access",
        price: "₹1,299",
        period: "/year",
        features: [
          "All state-level exams",
          "State PCS coverage",
          "Regional language support",
          "Full PYQ access",
          "Performance analytics",
          "Community support",
        ],
      },
      {
        name: "Lifetime (3-Year)",
        price: "₹2,999",
        period: "one-time",
        features: [
          "Everything in 1-Year plan",
          "3-year full access",
          "Multi-state access",
          "1-on-1 doubt clearing",
          "Exclusive study groups",
          "Certificate of completion",
        ],
      },
    ],
  },
  {
    id: "school",
    label: "School Level",
    icon: GraduationCap,
    description: "CBSE, ICSE & State Boards (X–XII)",
    free: false,
    plans: [
      {
        name: "1-Year Access",
        price: "₹900",
        period: "/year",
        features: [
          "All board exams covered",
          "Chapter-wise tests",
          "NCERT solutions",
          "Video explanations",
          "Performance tracking",
          "Doubt support",
        ],
      },
      {
        name: "Lifetime (3-Year)",
        price: "₹1,999",
        period: "one-time",
        features: [
          "Everything in 1-Year plan",
          "3-year full access",
          "JEE/NEET foundation prep",
          "Advanced problem sets",
          "Study planner",
          "Certificate of completion",
        ],
      },
    ],
  },
  {
    id: "foreign",
    label: "Foreign Exams",
    icon: Globe,
    description: "GRE, TOEFL, IELTS, SAT & more",
    free: false,
    plans: [
      {
        name: "1-Year Access",
        price: "₹1,999",
        period: "/year",
        features: [
          "Full GRE/TOEFL coverage",
          "Adaptive practice tests",
          "Vocabulary builder",
          "Writing evaluation",
          "Score predictor",
          "Priority support",
        ],
      },
      {
        name: "Lifetime (3-Year)",
        price: "₹4,999",
        period: "one-time",
        features: [
          "Everything in 1-Year plan",
          "3-year full access",
          "University shortlisting",
          "SOP/Essay review",
          "1-on-1 mentoring",
          "Certificate of completion",
        ],
      },
    ],
  },
];

const PricingSection = () => {
  const [activeCategory, setActiveCategory] = useState("central");
  const active = categories.find((c) => c.id === activeCategory)!;

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-display font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Invest in Your Future
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your exam category. Central & State exams have a free tier — School & Foreign are premium only.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold border transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Description + Free badge */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground text-sm">{active.description}</p>
          {active.free && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Free tier available — limited access
            </span>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          key={`cards-${active.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {active.plans.map((plan, i) => {
            const isLifetime = i === 1;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 border transition-all ${
                  isLifetime
                    ? "border-primary/50 bg-card shadow-glow"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                {isLifetime && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-hero text-xs font-bold font-display text-primary-foreground whitespace-nowrap">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  {isLifetime ? (
                    <Crown className="h-6 w-6 mb-3 text-primary" />
                  ) : (
                    <Zap className="h-6 w-6 mb-3 text-muted-foreground" />
                  )}
                  <h3 className="font-display font-bold text-xl text-foreground">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-secondary-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-display font-semibold ${
                    isLifetime ? "shadow-glow" : ""
                  }`}
                  variant={isLifetime ? "default" : "outline"}
                >
                  {isLifetime ? "Get Lifetime" : "Subscribe Now"}
                </Button>
              </div>
            );
          })}
        </motion.div>

        {/* Comparison hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 overflow-x-auto"
        >
          <table className="w-full max-w-4xl mx-auto text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left font-display font-semibold text-foreground py-3 pr-4">Plan</th>
                <th className="font-display font-semibold text-foreground py-3 px-4">Central</th>
                <th className="font-display font-semibold text-foreground py-3 px-4">State</th>
                <th className="font-display font-semibold text-foreground py-3 px-4">School</th>
                <th className="font-display font-semibold text-foreground py-3 px-4">Foreign</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30">
                <td className="py-3 pr-4 font-medium text-foreground">1-Year Access</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹1,799</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹1,299</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹900</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹1,999</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-foreground">Lifetime (3-Year)</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹3,999</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹2,999</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹1,999</td>
                <td className="py-3 px-4 text-center text-muted-foreground">₹4,999</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
