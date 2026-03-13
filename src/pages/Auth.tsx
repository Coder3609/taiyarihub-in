import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, User, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const checkProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .single();
      
      if (data?.profile_completed) {
        navigate("/", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }
    };
    checkProfile();
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password.length > 128) {
      toast({ title: "Password is too long", variant: "destructive" });
      return;
    }
    if (!isLogin && (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100)) {
      toast({ title: "Name must be 2–100 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: trimmedName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: !isLogin ? false : true,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "OTP Sent! 📩", description: `Check your inbox at ${trimmedEmail}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast({ title: "Enter the 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      toast({ title: "Verified! ✅" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCode("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Taiyari Hub</span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {otpSent ? "Enter OTP" : isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {otpSent
              ? `We sent a 6-digit code to ${email.trim()}`
              : isLogin
                ? "Sign in to continue your exam prep"
                : "Start your exam preparation journey"}
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
          {/* OTP Verify Screen */}
          <AnimatePresence mode="wait">
            {otpSent ? (
              <motion.div
                key="otp-verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button type="submit" className="w-full font-display font-semibold" disabled={loading || otpCode.length !== 6}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Sign In
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <button type="button" onClick={resetOtp} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <ArrowLeft className="h-3 w-3" /> Change email
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { resetOtp(); handleSendOtp(e as any); }}
                      className="text-primary hover:underline"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="auth-main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Google */}
                <Button variant="outline" className="w-full gap-2" onClick={handleGoogle} disabled={loading}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Auth Mode Tabs */}
                <div className="flex rounded-lg bg-secondary p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("password")}
                    className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                      authMode === "password"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("otp")}
                    className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                      authMode === "otp"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <KeyRound className="inline h-3 w-3 mr-1 -mt-0.5" />
                    Email OTP
                  </button>
                </div>

                {/* Password Form */}
                {authMode === "password" && (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="name" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" required={!isLogin} />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="email-pw" className="text-xs text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="email-pw" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" minLength={6} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLogin ? "Sign In" : "Sign Up"}
                    </Button>
                  </form>
                )}

                {/* OTP Form */}
                {authMode === "otp" && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email-otp" className="text-xs text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="email-otp" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <KeyRound className="mr-2 h-4 w-4" />
                      Send OTP
                    </Button>
                  </form>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
