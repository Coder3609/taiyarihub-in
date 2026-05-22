import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap,
  Bell, ExternalLink, Calendar, Sparkles, TrendingUp, BookOpen, Clock, AlertCircle
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Mode = "signin" | "signup";
type OtpMethod = "email" | "phone";
type OtpFlowType = "signin" | "signup";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];

interface ExamAlert {
  id: string;
  title: string;
  description: string;
  date: string;
  link?: string;
  tag: string;
  tagColor: string;
}

const examAlerts: ExamAlert[] = [
  {
    id: "1",
    title: "NEET UG 2026 Registration Started",
    description: "Official registration portal is now active. Candidates can apply online and upload documents before the deadline.",
    date: "May 20, 2026",
    link: "https://neet.nta.nic.in",
    tag: "NEET UG",
    tagColor: "bg-red-500/10 text-red-400 border-red-500/20"
  },
  {
    id: "2",
    title: "JEE Main Session 2 Admit Cards Released",
    description: "Download link for Session 2 Admit Card is live on the portal. Please verify exam center details immediately.",
    date: "May 18, 2026",
    link: "https://jeemain.nta.nic.in",
    tag: "JEE Main",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  },
  {
    id: "3",
    title: "GATE 2026 Schedule & Branch Distribution",
    description: "IIT Roorkee has released the session schedule and guidelines. Registration dates will be announced shortly.",
    date: "May 15, 2026",
    link: "https://gate.iitr.ac.in",
    tag: "GATE",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }
];

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [otpMethod, setOtpMethod] = useState<OtpMethod>("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpFlowType, setOtpFlowType] = useState<OtpFlowType>("signin");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Expandable alerts state
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Redirect on user session
  useEffect(() => {
    if (!user) return;
    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      const isSigningUp = localStorage.getItem("is_signing_up") === "true";
      if (isSigningUp) {
        localStorage.removeItem("is_signing_up");
        navigate("/complete-profile", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .maybeSingle();
      navigate(data?.profile_completed ? "/" : "/complete-profile", { replace: true });
    })();
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  function resetFlow() {
    setOtpSent(false);
    setOtpCode("");
    setEmail("");
    setPassword("");
    setFullName("");
  }

  const checkGoogleProvider = async (emailStr: string): Promise<boolean> => {
    try {
      const { data: provider, error } = await supabase.rpc("get_auth_provider_by_email", {
        email_input: emailStr.trim()
      });
      if (error) {
        console.error("Error checking auth provider:", error);
        return false;
      }
      if (provider === "google") {
        toast({
          title: "Account registered with Google",
          description: "This email is registered via Google OAuth. Please click 'Continue with Google' to sign in.",
          variant: "destructive"
        });
        return true;
      }
    } catch (err) {
      console.error("Error in checkGoogleProvider:", err);
    }
    return false;
  };

  // Google OAuth
  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" }
      },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // Sign In with password
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const isGoogle = await checkGoogleProvider(email);
      if (isGoogle) {
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Send Email OTP (for OTP Login)
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const isGoogle = await checkGoogleProvider(email);
      if (isGoogle) {
        setLoading(false);
        return;
      }
      setOtpFlowType("signin");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setOtpSent(true);
      setResendCooldown(30);
      toast({ title: "OTP sent!", description: `Check ${email.trim()} for your 6-digit code.` });
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP (unified verification method)
  const handleVerifyEmailOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Enter the full 6-digit code", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const verifyType = otpFlowType === "signup" ? "signup" : "email";
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: verifyType
      });
      if (error) throw error;
      
      if (otpFlowType === "signup") {
        localStorage.setItem("is_signing_up", "true");
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const isGoogle = await checkGoogleProvider(email);
      if (isGoogle) {
        setLoading(false);
        return;
      }
      if (otpFlowType === "signup") {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
      }
      setResendCooldown(30);
      toast({ title: "OTP resent!", description: `Check ${email.trim()} for your new code.` });
    } catch (err: any) {
      toast({ title: "Failed to resend OTP", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email/Password -> transition to OTP verification screen
  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: "Enter your full name", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const isGoogle = await checkGoogleProvider(email);
      if (isGoogle) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      if (data?.session) {
        // If Supabase immediately logs the user in (email confirmation disabled)
        localStorage.setItem("is_signing_up", "true");
        toast({
          title: "Account created! 🎉",
          description: "Moving to profile completion...",
        });
        navigate("/complete-profile");
      } else {
        // Otherwise, move to the OTP Code entry panel
        setOtpFlowType("signup");
        setOtpSent(true);
        setResendCooldown(30);
        localStorage.setItem("is_signing_up", "true");
        toast({
          title: "Verification code sent! 📩",
          description: `Check ${email.trim()} for your 6-digit verification code.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getStrength(password);

  return (
    <div className="min-h-screen bg-[#030712] text-foreground grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden font-body">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      </div>

      {/* LEFT COLUMN: BRANDING & ALERTS (DESKTOP ONLY) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-black border-r border-white/5 relative z-10 overflow-y-auto">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <GraduationCap size={22} className="text-black font-bold" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Taiyari<span className="text-amber-500">Hub</span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Master Your Prep. <br />
              <span className="text-gradient">Secure Your Future.</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Join thousands of aspirants preparing for GATE, UPSC, JEE, NEET, and school boards with AI-driven learning tools and real exam simulations.
            </p>
          </div>

          {/* Floating Stats Widget */}
          <div className="gradient-border bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4 max-w-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Live Analytics</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">50K+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Learners</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">95%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pass Rate</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">100K+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Questions</p>
              </div>
            </div>
          </div>

          {/* Real-time Alerts / Notifications widget (Custom Request) */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Live Exam Notifications</span>
            </div>

            <div className="space-y-3">
              {examAlerts.map((alert) => {
                const isExpanded = expandedAlert === alert.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                    className="group bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold ${alert.tagColor}`}>
                          {alert.tag}
                        </span>
                        <h4 className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">
                          {alert.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold whitespace-nowrap pt-1">
                        {alert.date}
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-3"
                        >
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {alert.description}
                          </p>
                          {alert.link && (
                            <a
                              href={alert.link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-black hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                            >
                              Go to portal <ExternalLink size={12} />
                            </a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 italic">Click notifications to expand and visit links.</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-6">
          <span>&copy; {new Date().getFullYear()} TaiyariHub</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN / SIGNUP CARD */}
      <div className="flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Logo Header (Visible on Mobile only) */}
          <div className="text-center lg:hidden space-y-2">
            <div className="w-12 h-12 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto">
              <GraduationCap size={24} className="text-black" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Taiyari<span className="text-amber-500">Hub</span>
            </h1>
            <p className="text-slate-400 text-sm">Elevate your preparation</p>
          </div>

          <div className="backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* Conditional Google Sign-in */}
            {!otpSent && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Switcher Tabs */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-1 flex">
                  {(["signin", "signup"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); resetFlow(); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === m
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                        : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {m === "signin" ? "Login" : "Sign Up"}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Input Forms */}
            <AnimatePresence mode="wait">
              {otpSent ? (
                <motion.div
                  key="otp-code-input-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-amber-500">
                      <Mail size={16} />
                    </div>
                    <h3 className="font-bold text-white text-lg">Verify Your Identity</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Enter the 6-digit OTP code sent to <br />
                      <span className="text-amber-400 font-bold">{email}</span>
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-10 h-11 rounded-xl border-white/10 bg-white/5 text-white text-base font-bold focus:border-amber-500/50 focus:ring-amber-500/20"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="text-xs text-slate-400">
                    Didn't receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-amber-500 font-bold">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-amber-500 hover:text-amber-400 font-black underline transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(""); }}
                      className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all bg-white/5"
                    >
                      Change Details
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={loading || otpCode.length !== 6}
                      className="flex-1 py-2.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black transition-all shadow-md shadow-amber-500/25"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin inline" /> : "Verify & Continue"}
                    </button>
                  </div>
                </motion.div>
              ) : mode === "signin" ? (
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handlePasswordSignIn}
                  className="space-y-4"
                >
                  <AuthInput
                    id="si-email" label="Email" type="email"
                    icon={<Mail size={15} />} value={email}
                    onChange={setEmail} placeholder="you@example.com"
                  />
                  <PasswordInput
                    id="si-password" value={password}
                    onChange={setPassword}
                    show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                  />
                  <SubmitBtn loading={loading} label="Login" />
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleEmailPasswordSignUp}
                  className="space-y-4"
                >
                  <AuthInput
                    id="su-name" label="Full Name" type="text"
                    icon={<span className="text-slate-400 font-bold text-xs">A</span>}
                    value={fullName} onChange={setFullName} placeholder="Rahul Sharma"
                  />
                  <AuthInput
                    id="su-email" label="Email" type="email"
                    icon={<Mail size={15} />} value={email}
                    onChange={setEmail} placeholder="you@example.com"
                  />
                  <div>
                    <PasswordInput
                      id="su-password" value={password}
                      onChange={setPassword}
                      show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                      label="Create Password"
                    />
                    {password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? STRENGTH_COLORS[pwStrength] : "bg-white/10"}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500">{STRENGTH_LABELS[pwStrength]} password</p>
                      </div>
                    )}
                  </div>
                  <SubmitBtn loading={loading} label="Create Account" />
                </motion.form>
              )}
            </AnimatePresence>

            {/* OTP Section (Bottom) - Hidden under signup view */}
            {mode === "signin" && !otpSent && (
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex flex-col gap-2 items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center">
                    Or sign in with 6-digit OTP
                  </span>
                  
                  {/* OTP Method Switcher */}
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      type="button"
                      onClick={() => { setOtpMethod("email"); }}
                      className={`flex-1 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        otpMethod === "email"
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                          : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                      }`}
                    >
                      Email OTP
                    </button>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          toast({
                            title: "📱 Mobile OTP — Coming Soon!",
                            description: "We are currently integrating the SMS gateway. Please use Email OTP or Google in the meantime.",
                          });
                        }}
                        className="w-full py-1.5 rounded-full text-xs font-bold border border-white/5 text-slate-600 bg-white/[0.01] cursor-pointer hover:border-white/10 hover:text-slate-500 transition-all"
                      >
                        Mobile OTP
                      </button>
                      <span className="absolute -top-2 right-2 bg-slate-800 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/20">
                        Soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email OTP Request Action */}
                {otpMethod === "email" && (
                  <form onSubmit={handleSendEmailOtp} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : "Send OTP"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────── Sub-components ──────────────────────────

function AuthInput({
  id, label, type, icon, value, onChange, placeholder,
}: {
  id: string; label: string; type: string;
  icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  id, value, onChange, show, onToggle, label = "Password",
}: {
  id: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; label?: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id={id} type={show ? "text" : "password"} value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
        />
        <button
          type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-black bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/25 mt-1"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
      {label}
    </button>
  );
}

export default Auth;

