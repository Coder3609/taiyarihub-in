import { motion } from "framer-motion";
import { Check, Crown, Zap, Landmark, GraduationCap, Flame, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OFFER_LIMIT = 500;
const OFFER_HARD_EXPIRY = 550;
const SINGLE_EXAM_OFFER_PRICE = "₹149";
const SINGLE_EXAM_FULL_PRICE = "₹199";

const plans = [
  {
    id: "central",
    icon: Landmark,
    name: "Central Exams Bundle",
    description: "GATE, BARC, ISRO, CAT, CA, SSC — all in one plan",
    price: "₹999",
    offerPrice: "₹699",
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PricingSection = () => {
  const [subCount, setSubCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [exams, setExams] = useState<{ slug: string; name: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [{ count }, { data: examData }] = await Promise.all([
        supabase
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase.from("exams").select("slug, name").order("name"),
      ]);
      setSubCount(count ?? 0);
      setExams(examData ?? []);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const offerActive = subCount < OFFER_HARD_EXPIRY;
  const spotsLeft = Math.max(0, OFFER_LIMIT - subCount);

  const handleSubscribe = useCallback(
    async (planId: string) => {
      if (!user) {
        toast.info("Please sign in to subscribe");
        navigate("/auth");
        return;
      }

      setProcessingPlan(planId);

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway. Please try again.");
          return;
        }

        // Determine plan_type key (offer vs full price)
        const planType = offerActive ? planId : `${planId}_full`;

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const { data, error } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: { plan_type: planType },
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (error || !data?.order_id) {
          toast.error("Failed to create order. Please try again.");
          console.error("Order error:", error, data);
          return;
        }

        const plan = plans.find((p) => p.id === planId)!;

        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "TaiyariHub",
          description: plan.name,
          order_id: data.order_id,
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyError } =
                await supabase.functions.invoke("verify-razorpay-payment", {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    plan_type: planId,
                  },
                  headers: { Authorization: `Bearer ${accessToken}` },
                });

              if (verifyError || !verifyData?.success) {
                toast.error("Payment verification failed. Contact support.");
                console.error("Verify error:", verifyError, verifyData);
              } else {
                toast.success("🎉 Subscription activated! Welcome aboard!");
                navigate("/dashboard");
              }
            } catch (e) {
              console.error("Verification error:", e);
              toast.error("Payment verification failed. Contact support.");
            }
          },
          prefill: {
            email: user.email || "",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: () => {
              setProcessingPlan(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          console.error("Payment failed:", response.error);
          toast.error(`Payment failed: ${response.error.description}`);
          setProcessingPlan(null);
        });
        rzp.open();
      } catch (e) {
        console.error("Checkout error:", e);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setProcessingPlan(null);
      }
    },
    [user, navigate, offerActive]
  );

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
          {plans.map((plan) => {
            const isSchool = plan.id === "school";
            const isProcessing = processingPlan === plan.id;
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
                  disabled={isProcessing}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isSchool ? (
                    "Get Started"
                  ) : (
                    "Subscribe Now"
                  )}
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
