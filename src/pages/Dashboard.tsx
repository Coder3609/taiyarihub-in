import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  GraduationCap,
  User,
  BookOpen,
  Trophy,
  Bell,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Landmark,
  School,
  Globe,
  MapPin,
  Play,
  Crown,
  Check,
  Sparkles,
  Flame,
  X,
  TicketPlus,
  Zap,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/components/AvatarPicker";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Profile {
  full_name: string | null;
  username: string | null;
  gender: string | null;
  preparing_for: string[] | null;
  avatar_url: string | null;
  email: string | null;
}

interface RecentResult {
  id: string;
  exam_id: string;
  section_type: string;
  set_number: number;
  score: number;
  total: number;
  correct_count: number;
  created_at: string;
  exam_name?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  exam_category: string | null;
  published_at: string;
}

const examCategories = [
  {
    title: "Central Exams",
    description: "GATE, BARC, ISRO & more national level exams",
    icon: Landmark,
    path: "/exams/central",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    glowColor: "hover:shadow-[0_0_30px_-8px_hsl(38_92%_50%/0.25)]",
    comingSoon: false,
  },
  {
    title: "State Exams",
    description: "State-level PSC & government exams",
    icon: MapPin,
    path: "/exams/state",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
    glowColor: "hover:shadow-[0_0_30px_-8px_rgba(59,130,246,0.25)]",
    comingSoon: true,
  },
  {
    title: "School Exams",
    description: "Board exams & school-level assessments",
    icon: School,
    path: "/exams/school",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    glowColor: "hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.25)]",
    comingSoon: false,
  },
  {
    title: "Foreign Exams",
    description: "GRE, TOEFL, IELTS & international exams",
    icon: Globe,
    path: "/exams/foreign",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
    glowColor: "hover:shadow-[0_0_30px_-8px_rgba(168,85,247,0.25)]",
    comingSoon: true,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0, bestScore: 0 });
  const [subCount, setSubCount] = useState(0);
  const [userPlans, setUserPlans] = useState<string[]>([]);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const OFFER_LIMIT = 500;
  const OFFER_HARD_EXPIRY = 550;
  const offerActive = subCount < OFFER_HARD_EXPIRY;
  const spotsLeft = Math.max(0, OFFER_LIMIT - subCount);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const [profileRes, resultsRes, announcementsRes, subCountRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("user_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("announcements")
          .select("*")
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(5),
        supabase
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      setSubCount(subCountRes.count ?? 0);

      const { data: userSubs } = await supabase
        .from("user_subscriptions")
        .select("plan_type")
        .eq("user_id", user.id)
        .eq("is_active", true);
      setUserPlans(userSubs?.map((s: any) => s.plan_type) ?? []);

      if (profileRes.data) setProfile(profileRes.data);

      if (resultsRes.data && resultsRes.data.length > 0) {
        const examIds = [...new Set(resultsRes.data.map((r) => r.exam_id))];
        const { data: exams } = await supabase
          .from("exams")
          .select("id, name")
          .in("id", examIds);

        const examMap = new Map(exams?.map((e) => [e.id, e.name]) ?? []);
        const enriched = resultsRes.data.map((r) => ({
          ...r,
          exam_name: examMap.get(r.exam_id) ?? "Unknown",
        }));
        setRecentResults(enriched);

        const { data: allResults } = await supabase
          .from("user_results")
          .select("score, total")
          .eq("user_id", user.id);

        if (allResults && allResults.length > 0) {
          const totalQuizzes = allResults.length;
          const avgScore = Math.round(
            allResults.reduce((s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) /
              totalQuizzes
          );
          const bestScore = Math.round(
            Math.max(...allResults.map((r) => (r.total > 0 ? (r.score / r.total) * 100 : 0)))
          );
          setStats({ totalQuizzes, avgScore, bestScore });
        }
      }

      if (announcementsRes.data) setAnnouncements(announcementsRes.data);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const fadeUp = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
  };

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const motionVal = useMotionValue(0);
    const rounded = useTransform(motionVal, (v) => Math.round(v));

    useEffect(() => {
      if (isInView) {
        animate(motionVal, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
      }
    }, [isInView, value]);

    useEffect(() => {
      const unsub = rounded.on("change", (v) => {
        if (ref.current) ref.current.textContent = `${v}${suffix}`;
      });
      return unsub;
    }, [rounded, suffix]);

    return <span ref={ref}>0{suffix}</span>;
  };

  const statItems = [
    { icon: BookOpen, value: stats.totalQuizzes, label: "Quizzes Taken", color: "from-primary/20 to-primary/5", iconColor: "text-primary", suffix: "" },
    { icon: Target, value: stats.avgScore, label: "Average Score", color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400", suffix: "%" },
    { icon: Trophy, value: stats.bestScore, label: "Best Score", color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400", suffix: "%" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-[120px] animate-glow-pulse"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/[0.03] rounded-full blur-[100px] animate-glow-pulse"
          style={{ animationDelay: "2s" }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/[0.02] rounded-full blur-[100px]"
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i}s`,
            }}
          />
        ))}
      </div>

      <Navbar />
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 md:px-6 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="animate-pulse-ring rounded-xl p-2 bg-primary/10"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GraduationCap className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Explore <span className="text-shimmer">Taiyari Hub</span>
            </h1>
          </motion.div>

          {/* Row 1: Profile Card + Performance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="bg-gradient-card border-border/50 h-full card-shine gradient-border hover:shadow-card-hover transition-shadow duration-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-primary/30 ring-4 ring-primary/5">
                        {getAvatarSrc(profile?.avatar_url) && (
                          <AvatarImage src={getAvatarSrc(profile?.avatar_url)!} alt="Avatar" />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-display text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-card"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-lg font-semibold text-foreground truncate">
                        {profile?.full_name ?? "Student"}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        @{profile?.username ?? "user"}
                      </p>
                      {profile?.gender && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {profile.gender}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {profile?.preparing_for && profile.preparing_for.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Preparing for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preparing_for.map((exam) => (
                          <Badge
                            key={exam}
                            variant="outline"
                            className="text-xs border-primary/30 text-primary bg-primary/5"
                          >
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-1.5" /> Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <Card className="bg-gradient-card border-border/50 h-full card-shine hover:shadow-card-hover transition-shadow duration-500">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {statItems.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200, damping: 15 }}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className={`text-center p-4 rounded-xl bg-gradient-to-br ${stat.color} border border-border/30 hover:border-border/60 transition-all duration-300 group cursor-default`}
                      >
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <stat.icon className={`h-6 w-6 ${stat.iconColor} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                        </motion.div>
                        <p className="text-2xl font-display font-bold text-foreground">
                          <AnimatedCounter value={typeof stat.value === 'number' ? stat.value : parseInt(String(stat.value)) || 0} suffix={stat.suffix} />
                        </p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  {recentResults.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-3 text-primary p-0 group"
                      onClick={() => navigate("/history")}
                    >
                      View full history <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Row 2: Resume Progress + Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Where You Left Off */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="bg-gradient-card border-border/50 h-full hover:shadow-card-hover transition-shadow duration-500">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" /> Resume Where You Left Off
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentResults.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-float">
                        <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No quizzes attempted yet. Start your first exam below!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentResults.slice(0, 3).map((result, i) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/40 transition-all duration-300 cursor-pointer group"
                          onClick={() => navigate(`/results/${result.id}`)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {result.exam_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Set {result.set_number} • {result.section_type}
                            </p>
                          </div>
                          <div className="text-right ml-3">
                            <p className="text-sm font-display font-semibold text-primary">
                              {result.score}/{result.total}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Announcements / Exam News */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="bg-gradient-card border-border/50 h-full hover:shadow-card-hover transition-shadow duration-500">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Exam News & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-float">
                        <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No announcements yet. Stay tuned for exam updates!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {announcements.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border/40 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-foreground">{a.title}</h4>
                            {a.exam_category && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {a.exam_category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {a.content}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {new Date(a.published_at).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Row 3: Exam Type Selection */}
          <Separator className="my-2" />
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <motion.div
              className="flex items-center gap-2 mb-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Select Your Exam Type
              </h2>
            </motion.div>
            <p className="text-sm text-muted-foreground mb-6">
              Choose a category to browse exams and start practicing
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {examCategories.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  custom={5 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={cat.comingSoon ? {} : { y: -4, scale: 1.02 }}
                  whileTap={cat.comingSoon ? {} : { scale: 0.98 }}
                >
                  <Card
                    className={`bg-gradient-card border-border/50 transition-all duration-500 group ${cat.comingSoon ? "opacity-60 cursor-not-allowed" : `hover:border-primary/30 cursor-pointer ${cat.glowColor}`}`}
                    onClick={() => {
                      if (cat.comingSoon) return;
                      navigate(cat.path);
                    }}
                  >
                    <CardContent className="pt-6 pb-5 relative overflow-hidden">
                      {/* Decorative orb */}
                      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${cat.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                      {cat.comingSoon && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          COMING SOON
                        </span>
                      )}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                      {!cat.comingSoon && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          Browse exams <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Row 4: Subscription Plans — only shown if user has NO active plan */}
          {userPlans.length === 0 && (
            <>
              <Separator className="my-2" />
              <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
                  Subscription Plans
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  First 2 sets of every exam are free. Unlock unlimited access with a plan.
                </p>
                {offerActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6 shadow-glow"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Central Bundle */}
                  <Card className="bg-gradient-card border-primary/30 relative overflow-hidden card-shine hover:shadow-[0_0_40px_-8px_hsl(38_92%_50%/0.2)] transition-shadow duration-500">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-display font-semibold rounded-bl-lg">
                      Popular
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" /> Central Bundle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-4">
                        {offerActive ? (
                          <>
                            <span className="text-3xl font-display font-bold text-gradient">₹699</span>
                            <span className="text-lg font-display text-muted-foreground line-through">₹999</span>
                          </>
                        ) : (
                          <span className="text-3xl font-display font-bold text-foreground">₹999</span>
                        )}
                        <span className="text-sm text-muted-foreground">/ 1.3 years</span>
                      </div>
                      <div className="space-y-2 mb-5">
                        {["GATE", "BARC", "ISRO", "CAT", "CA", "RBI Grade B"].map((exam) => (
                          <div key={exam} className="flex items-center gap-2 text-sm text-foreground">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {exam}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full font-display font-semibold" onClick={() => navigate("/pricing")}>
                        <Sparkles className="h-4 w-4 mr-1.5" /> Get Central Bundle
                      </Button>
                    </CardContent>
                  </Card>

                  {/* School & Entrance */}
                  <Card className="bg-gradient-card border-border/50 relative overflow-hidden hover:border-border/80 hover:shadow-card-hover transition-all duration-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> School & Entrance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-4">
                        {offerActive ? (
                          <>
                            <span className="text-3xl font-display font-bold text-foreground">₹599</span>
                            <span className="text-lg font-display text-muted-foreground line-through">₹999</span>
                          </>
                        ) : (
                          <span className="text-3xl font-display font-bold text-foreground">₹999</span>
                        )}
                        <span className="text-sm text-muted-foreground">/ 3 years</span>
                      </div>
                      <div className="space-y-2 mb-5">
                        {["JEE Mains & Advanced", "NEET", "CUET", "CBSE", "ICSE"].map((exam) => (
                          <div key={exam} className="flex items-center gap-2 text-sm text-foreground">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {exam}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full font-display font-semibold" onClick={() => navigate("/pricing")}>
                        <Sparkles className="h-4 w-4 mr-1.5" /> Get School & Entrance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </>
          )}

          {/* Floating Extend Sub Button */}
          <AnimatePresence>
            {userPlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <Button
                  onClick={() => setShowExtendDialog(true)}
                  className="rounded-full px-5 py-3 shadow-glow font-display font-semibold gap-2 animate-pulse-ring"
                  size="lg"
                >
                  <TicketPlus className="h-5 w-5" />
                  Extend Sub
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extend Subscription Dialog */}
          <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Manage Subscription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Card className={`border ${userPlans.includes("central") ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold text-foreground">Central Bundle</h3>
                      </div>
                      {userPlans.includes("central") && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">GATE, BARC, ISRO, CAT, CA, RBI Grade B</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      {offerActive ? (
                        <>
                          <span className="text-2xl font-display font-bold text-foreground">₹699</span>
                          <span className="text-sm text-muted-foreground line-through">₹999</span>
                        </>
                      ) : (
                        <span className="text-2xl font-display font-bold text-foreground">₹999</span>
                      )}
                      <span className="text-xs text-muted-foreground">/ 1.3 years</span>
                    </div>
                    <Button
                      className="w-full font-display font-semibold"
                      variant={userPlans.includes("central") ? "default" : "outline"}
                      onClick={() => navigate("/pricing")}
                    >
                      {userPlans.includes("central") ? "Extend Central Bundle" : "Get Central Bundle"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className={`border ${userPlans.includes("school") ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold text-foreground">School & Entrance</h3>
                      </div>
                      {userPlans.includes("school") && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">JEE Mains & Advanced, NEET, CUET, CBSE, ICSE</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      {offerActive ? (
                        <>
                          <span className="text-2xl font-display font-bold text-foreground">₹599</span>
                          <span className="text-sm text-muted-foreground line-through">₹999</span>
                        </>
                      ) : (
                        <span className="text-2xl font-display font-bold text-foreground">₹999</span>
                      )}
                      <span className="text-xs text-muted-foreground">/ 3 years</span>
                    </div>
                    <Button
                      className="w-full font-display font-semibold"
                      variant={userPlans.includes("school") ? "default" : "outline"}
                      onClick={() => navigate("/pricing")}
                    >
                      {userPlans.includes("school") ? "Extend School Bundle" : "Get School & Entrance"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
