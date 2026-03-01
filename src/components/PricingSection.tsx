import { motion } from "framer-motion";
import { Check, Crown, Zap, Landmark, GraduationCap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const OFFER_LIMIT = 500;
const OFFER_HARD_EXPIRY = 550;

const plans = [
  {
    id: "central",
    icon: Landmark,
    name: "Central Exams Bundle",
    description: "GATE, BARC, ISRO, CAT, CA, SSC — all in one plan",
    price: "₹599",
    offerPrice: "₹299",
    period: "for 1.3 Years",
    free: true,
    features: [
      "GATE, BARC, ISRO, CAT, CA & all SSC exams",
      "Unlimited test attempts",
      "Full PYQ & question bank",
      "Mock tests with timer & scoring",
      "AI-powered analytics",
      "Priority support",
    ],
  },
  {
    id: "school",
    icon: GraduationCap,
    name: "School & Entrance Bundle",
    description: "JEE Mains/Advanced, NEET, CUET & Board exams",
    price: "₹999",
    offerPrice: "₹599",
    period: "for 3 Years",
    free: false,
    features: [
      "JEE Mains, JEE Advanced, NEET & CUET",
      "CBSE & ICSE board exams",
      "Chapter-wise & full-length mock tests",
      "Detailed solutions with explanations",
      "Performance tracking & analytics",
      "3-year extended access",
    ],
  },
];

const PricingSection = () => {
  const [subCount, setSubCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      setSubCount(count ?? 0);
      setLoaded(true);
    };
    fetchCount();
  }, []);

  const offerActive = subCount < OFFER_HARD_EXPIRY;
  const spotsLeft = Math.max(0, OFFER_LIMIT - subCount);

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
            Simple, Affordable Plans
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Two bundles. No hidden charges. Central exams include a free tier for the first 2 sets.
          </p>
          {loaded && offerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5"
            >
              <Flame className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                🚀 Launch Offer — First {OFFER_LIMIT} users!
              </span>
              <span className="text-xs text-muted-foreground">
                {spotsLeft > 0 ? `${spotsLeft} spots left` : "Filling up fast!"}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {plans.map((plan, i) => {
            const isSchool = plan.id === "school";
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-8 border transition-all ${
                  isSchool
                    ? "border-primary/50 bg-card shadow-glow"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                {isSchool && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-hero text-xs font-bold font-display text-primary-foreground whitespace-nowrap">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  {isSchool ? (
                    <Crown className="h-6 w-6 mb-3 text-primary" />
                  ) : (
                    <Zap className="h-6 w-6 mb-3 text-muted-foreground" />
                  )}
                  <h3 className="font-display font-bold text-xl text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {offerActive ? (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl font-bold text-foreground">
                        {plan.offerPrice}
                      </span>
                      <span className="font-display text-lg text-muted-foreground line-through">
                        {plan.price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-display text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                  )}
                  <span className="text-muted-foreground text-sm ml-2">
                    {plan.period}
                  </span>
                </div>

                {plan.free && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Free tier — first 2 sets free
                    </span>
                  </div>
                )}

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
                    isSchool ? "shadow-glow" : ""
                  }`}
                  variant={isSchool ? "default" : "outline"}
                >
                  {isSchool ? "Get Started" : "Subscribe Now"}
                </Button>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
