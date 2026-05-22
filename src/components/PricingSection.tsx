import { motion } from "framer-motion";
import { Check, Crown, Zap, Landmark, GraduationCap, Flame, Loader2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OFFER_LIMIT = 500;
const OFFER_HARD_EXPIRY = 550;
const SINGLE_EXAM_OFFER_PRICE = "₹349";
const SINGLE_EXAM_FULL_PRICE = "₹499";

const plans = [
  {
    id: "central",
    icon: Landmark,
    name: "Central Exams Bundle",
    description: "All GATE Branches — in one plan",
    price: "₹999",
    offerPrice: "₹499",
    period: "for 1.3 Years",
    free: true,
    features: [
      "All GATE branches included",
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
    description: "IIT JEE & NEET Prep + School Boards",
    price: "₹999",
    offerPrice: "₹701",
    period: "for 3 Years",
    free: false,
    features: [
      "⭐ IIT JEE & NEET Exam Preparation",
      "⭐ CBSE & ICSE Board Exams (Class 9-12)",
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
      
      // Auto-seed exams if table is empty
      let currentExams = examData ?? [];
      if (currentExams.length === 0) {
        console.log("Seeding exams...");
        const seedExams = [
          { name: 'GATE Computer Science (CS)', slug: 'GATE-CS', category: 'central', duration_minutes: 180, total_questions: 65, description: 'Computer Science and Information Technology' },
          { name: 'GATE Electronics (EC)', slug: 'GATE-EC', category: 'central', duration_minutes: 180, total_questions: 65, description: 'Electronics and Communication Engineering' },
          { name: 'GATE Civil (CE)', slug: 'GATE-CE', category: 'central', duration_minutes: 180, total_questions: 65, description: 'Civil Engineering' },
          { name: 'JEE Mains', slug: 'JEE-Mains', category: 'school', duration_minutes: 180, total_questions: 90, description: 'Joint Entrance Examination - Main' },
          { name: 'JEE Advanced', slug: 'JEE-Advanced', category: 'school', duration_minutes: 180, total_questions: 54, description: 'Joint Entrance Examination - Advanced' },
          { name: 'NEET', slug: 'NEET', category: 'school', duration_minutes: 200, total_questions: 200, description: 'National Eligibility cum Entrance Test' },
        ];
        
        await supabase.from("exams").insert(seedExams);
        const { data: newData } = await supabase.from("exams").select("slug, name").order("name");
        currentExams = newData ?? [];
        console.log("Seeding complete!");
      }

      setSubCount(count ?? 0);
      setExams(currentExams);
      setLoaded(true);
    };
    fetchData();
  }, []);

  // Group exams by prefix (e.g. GATE-CS, GATE-EC → group "GATE")
  const groupedExams = (() => {
    const groups: Record<string, { slug: string; name: string }[]> = {};
    const standalone: { slug: string; name: string }[] = [];

    // Filter out CUET and paper-specific sub-exams
    const filteredExams = exams.filter((e) => {
      const lower = e.slug.toLowerCase();
      return lower !== 'cuet' && lower !== 'jee-advanced-paper-1' && lower !== 'jee-advanced-paper-2';
    });

    const jeeNeetGroup = {
      label: "IIT JEE & NEET PREPARATION",
      items: [
        { slug: "JEE-Mains", name: "JEE Mains (₹399)" },
        { slug: "JEE-Advanced", name: "JEE Advanced (₹449)" },
        { slug: "NEET", name: "NEET (₹399)" },
        { slug: "combo:JM-JA", name: "JEE Mains + JEE Advanced Combo (₹499)" },
        { slug: "combo:JM-NEET", name: "JEE Mains + NEET Combo (₹439)" },
        { slug: "combo:JA-JM-NEET", name: "JEE Mains + JEE Advanced + NEET Combo (₹701)" }
      ]
    };

    filteredExams.forEach((exam) => {
      const slug = exam.slug;
      // Skip exams handled in jeeNeetGroup
      if (slug === 'JEE-Mains' || slug === 'JEE-Advanced' || slug === 'NEET') {
        return;
      }

      const parts = slug.split("-");
      if (parts.length >= 2) {
        // Use first part as group key
        const groupKey = parts[0].toUpperCase();
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(exam);
      } else {
        standalone.push(exam);
      }
    });

    const result: { label: string; items: { slug: string; name: string; isParent?: boolean }[] }[] = [];
    
    // Always put IIT JEE & NEET preparation first
    result.push(jeeNeetGroup);

    Object.entries(groups).forEach(([key, items]) => {
      if (items.length >= 2) {
        result.push({
          label: key,
          items: [
            { slug: key, name: `${key} — All Branches (${items.length})`, isParent: true },
            ...items,
          ],
        });
      } else {
        standalone.push(...items);
      }
    });

    if (standalone.length > 0) {
      result.push({ label: "Other Exams", items: standalone });
    }

    return result;
  })();

  const offerActive = subCount < OFFER_HARD_EXPIRY;
  const spotsLeft = Math.max(0, OFFER_LIMIT - subCount);

  const handleSubscribe = useCallback(
    async (planId: string, opts?: { customPlanType?: string; description?: string; access_type?: string; access_scope?: string; access_value?: string }) => {
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
        const planType = opts?.customPlanType
          ?? (offerActive ? planId : `${planId}_full`);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const { data, error } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: { 
              plan_type: planType,
              access_type: opts?.access_type,
              access_scope: opts?.access_scope,
              access_value: opts?.access_value
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (error || !data?.order_id) {
          toast.error("Failed to create order. Please try again.");
          console.error("Order error:", error, data);
          return;
        }

        const description = opts?.description
          ?? plans.find((p) => p.id === planId)?.name
          ?? "TaiyariHub Subscription";

        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "TaiyariHub",
          description,
          order_id: data.order_id,
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyError } =
                await supabase.functions.invoke("verify-razorpay-payment", {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    plan_type: planType,
                    access_type: opts?.access_type,
                    access_scope: opts?.access_scope,
                    access_value: opts?.access_value
                  },
                  headers: { Authorization: `Bearer ${accessToken}` },
                });

              if (verifyError || !verifyData?.success) {
                toast.error("Payment verification failed. Contact support.");
                console.error("Verify error:", verifyError, verifyData);
              } else {
                toast.success("🎉 Subscription activated! Welcome aboard!");
                navigate("/");
              }
            } catch (e) {
              console.error("Verification error:", e);
              toast.error("Payment verification failed. Contact support.");
            }
          },
          prefill: { email: user.email || "" },
          theme: { color: "#6366f1" },
          modal: { ondismiss: () => setProcessingPlan(null) },
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

  const handleSingleExamSubscribe = () => {
    if (!selectedExam) {
      toast.info("Please select an exam first");
      return;
    }
    
    const exam = exams.find((e) => e.slug === selectedExam);
    const customPlanType = offerActive
      ? `single:${selectedExam}`
      : `single_full:${selectedExam}`;
      
    let accessType: 'bundle' | 'exam' = 'exam';
    let description = `Single Exam Access: ${selectedExam}`;
    
    if (selectedExam.startsWith("combo:")) {
      accessType = 'exam';
      if (selectedExam === "combo:JM-JA") description = "JEE Mains & Advanced Combo Access";
      else if (selectedExam === "combo:JM-NEET") description = "JEE Mains & NEET Combo Access";
      else if (selectedExam === "combo:JA-JM-NEET") description = "JEE Mains, Advanced & NEET Combo Access";
    } else {
      const isParent = !exam; // e.g. GATE parent prefix
      accessType = isParent ? 'bundle' : 'exam';
      description = `Single Exam Access: ${exam?.name ?? selectedExam}`;
    }
    
    handleSubscribe("single", {
      customPlanType,
      description,
      access_type: accessType,
      access_scope: selectedExam
    });
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px] pointer-events-none animate-glow-pulse" style={{ animationDelay: "2s" }} />
        {/* Cybernetic grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <span className="text-amber-500 font-display font-black text-xs uppercase tracking-widest bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black mt-4 mb-4 text-white leading-tight">
            Simple, <span className="text-shimmer font-black">Affordable Plans</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm md:text-base">
            Two bundles. No hidden charges. Central exams include a free tier for the first 2 sets.
          </p>
          
          {/* Magical Coming Soon Display with Infinite Scroll Marquee */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/40 py-3 max-w-3xl mx-auto"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(245,158,11,0.05)_50%,transparent_100%)] animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="flex items-center gap-3 px-4 relative z-10 overflow-hidden">
              <div className="flex items-center gap-1.5 bg-slate-950 backdrop-blur px-2.5 py-1 rounded-lg border border-amber-500/10 shrink-0 z-20 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Alert</span>
              </div>
              
              <div 
                className="relative w-full overflow-hidden whitespace-nowrap"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
                }}
              >
                <motion.div
                  initial={{ x: "0%" }}
                  animate={{ x: "-50%" }}
                  transition={{ ease: "linear", duration: 18, repeat: Infinity }}
                  className="inline-flex gap-16 text-sm font-semibold text-slate-400 pr-16"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-black font-extrabold bg-amber-500 text-xs px-2 py-0.5 rounded">IIT JEE & NEET are now LIVE!</span>
                    <span>• Start preparation for JEE Mains, JEE Advanced, and NEET with premium test series.</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-black font-extrabold bg-amber-500 text-xs px-2 py-0.5 rounded">IIT JEE & NEET are now LIVE!</span>
                    <span>• Start preparation for JEE Mains, JEE Advanced, and NEET with premium test series.</span>
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {loaded && offerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-500/30 bg-amber-500/5 shadow-glow"
            >
              <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-sm font-black text-amber-400">
                🚀 Launch Offer — First {OFFER_LIMIT} users!
              </span>
              <span className="text-xs text-slate-400 font-semibold border-l border-white/10 pl-2">
                {spotsLeft > 0 ? `${spotsLeft} spots left` : "Filling up fast!"}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-16"
        >
          {plans.map((plan) => {
            const isSchool = plan.id === "school";
            const isProcessing = processingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 shadow-2xl ${
                  isSchool
                    ? "bg-slate-900/60 shadow-glow border-none gradient-border"
                    : "border border-white/5 bg-slate-900/30 hover:border-amber-500/20 hover:bg-slate-900/50"
                } group`}
              >
                {isSchool && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-hero text-[10px] font-black uppercase tracking-widest text-black whitespace-nowrap shadow-lg">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  {isSchool ? (
                    <Crown className="h-6 w-6 mb-3 text-amber-500 animate-bounce" />
                  ) : (
                    <Zap className="h-6 w-6 mb-3 text-slate-400" />
                  )}
                  <h3 className="font-display font-extrabold text-xl text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {offerActive ? (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl font-black text-white">
                        {plan.offerPrice}
                      </span>
                      <span className="font-display text-lg text-slate-500 line-through font-bold">
                        {plan.price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-display text-4xl font-black text-white">
                      {plan.price}
                    </span>
                  )}
                  <span className="text-slate-400 text-xs ml-2 font-semibold">
                    {plan.period}
                  </span>
                </div>

                {plan.free && (
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Free tier — first 2 sets free
                    </span>
                  </div>
                )}

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-xs md:text-sm font-medium">
                      <Check className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-display font-black uppercase tracking-wider text-xs py-5 rounded-xl transition-all duration-300 ${
                    isSchool 
                      ? "bg-amber-500 hover:bg-amber-400 text-black shadow-glow border-none hover:scale-[1.02]" 
                      : "border border-white/10 hover:border-amber-500/30 text-white bg-slate-950/40 hover:bg-slate-900/60 hover:scale-[1.02]"
                  }`}
                  disabled={isProcessing}
                  onClick={() => handleSubscribe(plan.id, { 
                    access_type: 'bundle', 
                    access_scope: isSchool ? 'SCHOOL' : 'CENTRAL'
                  })}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-inherit" />
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

        {/* Single Exam — affordable per-exam access */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-12"
        >
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 rounded-3xl p-6 md:p-8 border border-white/5 bg-slate-900/30 backdrop-blur-xl shadow-xl">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-amber-500 animate-float" />
                <h3 className="font-display font-extrabold text-xl text-white">
                  Single Exam Access
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 font-medium">
                Only need one exam? Pick it from the list and pay a fraction of the bundle price.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                {(() => {
                  const getExamPrice = (slug: string) => {
                    if (slug === "GATE") {
                      return offerActive 
                        ? { price: "₹499", fullPrice: "₹999", type: "bundle" } 
                        : { price: "₹999", fullPrice: null, type: "bundle" };
                    }
                    if (slug === "JEE-Mains") {
                      return { price: "₹399", fullPrice: "₹499", type: "exam" };
                    }
                    if (slug === "JEE-Advanced") {
                      return { price: "₹449", fullPrice: "₹599", type: "exam" };
                    }
                    if (slug === "NEET") {
                      return { price: "₹399", fullPrice: "₹499", type: "exam" };
                    }
                    if (slug === "combo:JM-JA") {
                      return { price: "₹499", fullPrice: "₹799", type: "combo" };
                    }
                    if (slug === "combo:JM-NEET") {
                      return { price: "₹439", fullPrice: "₹699", type: "combo" };
                    }
                    if (slug === "combo:JA-JM-NEET") {
                      return { price: "₹701", fullPrice: "₹999", type: "combo" };
                    }
                    
                    // Default fallback
                    return offerActive 
                      ? { price: SINGLE_EXAM_OFFER_PRICE, fullPrice: SINGLE_EXAM_FULL_PRICE, type: "exam" }
                      : { price: SINGLE_EXAM_FULL_PRICE, fullPrice: null, type: "exam" };
                  };

                  const priceInfo = getExamPrice(selectedExam);
                  if (priceInfo.fullPrice) {
                    return (
                      <>
                        <span className="font-display text-3xl font-black text-white">
                          {priceInfo.price}
                        </span>
                        <span className="font-display text-base text-slate-500 line-through font-bold">
                          {priceInfo.fullPrice}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          / {priceInfo.type}
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="font-display text-3xl font-black text-white">
                          {priceInfo.price}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          / {priceInfo.type}
                        </span>
                      </>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:w-72">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="bg-slate-950/80 border-white/10 text-white rounded-xl py-5">
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent className="max-h-80 bg-slate-900 border-white/10 text-white rounded-xl">
                  {exams.length === 0 ? (
                    <SelectItem value="__none" disabled>Loading exams…</SelectItem>
                  ) : groupedExams.length === 0 ? (
                    <SelectItem value="__none" disabled>No exams available</SelectItem>
                  ) : (
                    groupedExams.map((group) => (
                      <div key={group.label}>
                        <div className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-500/70 border-t border-white/5 mt-1 first:mt-0 first:border-t-0 bg-slate-950/50">
                          {group.label}
                        </div>
                        {group.items.map((item) => (
                          <SelectItem
                            key={item.slug}
                            value={item.slug}
                            className={item.isParent ? "font-extrabold text-amber-500" : "pl-6 text-slate-300 focus:bg-slate-800 focus:text-white"}
                          >
                            {item.isParent 
                              ? `⭐ ${item.name}` 
                              : item.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                className="w-full font-display font-black uppercase tracking-wider text-xs py-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
                disabled={processingPlan === "single" || !selectedExam}
                onClick={handleSingleExamSubscribe}
              >
                {processingPlan === "single" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-black" />
                    Processing...
                  </>
                ) : (
                  "Buy this exam"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
