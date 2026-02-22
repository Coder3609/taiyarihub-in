import { motion } from "framer-motion";
import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with limited access",
    icon: Zap,
    features: [
      "3 test attempts per month",
      "Limited PYQ access",
      "Basic performance stats",
      "Community support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "1-Year Premium",
    price: "₹3,999",
    period: "/year",
    description: "Full access for a year",
    icon: Crown,
    features: [
      "Unlimited test attempts",
      "Full PYQ & question bank",
      "Video solutions library",
      "AI-powered analytics",
      "Percentile ranking",
      "Priority support",
    ],
    cta: "Go Premium",
    highlighted: true,
  },
  {
    name: "Lifetime Access",
    price: "₹3,999",
    period: "one-time",
    description: "Pay once, learn forever",
    icon: Crown,
    features: [
      "Everything in 1-Year plan",
      "Lifetime updates & content",
      "Early access to new exams",
      "1-on-1 doubt clearing",
      "Exclusive study groups",
      "Certificate of completion",
    ],
    cta: "Get Lifetime",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-display font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Invest in Your Future
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Affordable plans designed for every aspirant. Start free, upgrade when ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-8 border transition-all ${
                plan.highlighted
                  ? "border-primary/50 bg-card shadow-glow scale-[1.02]"
                  : "border-border/50 bg-card hover:border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-hero text-xs font-bold font-display text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <plan.icon
                  className={`h-6 w-6 mb-3 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}
                />
                <h3 className="font-display font-bold text-xl text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
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
                  plan.highlighted ? "shadow-glow" : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
