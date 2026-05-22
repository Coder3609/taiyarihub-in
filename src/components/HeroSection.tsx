import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, BookOpen, Trophy, Search, Sparkles, CheckCircle2, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExamCategoryDialog from "@/components/ExamCategoryDialog";

const stats = [
  { icon: Users, value: "50K+", label: "Active Learners", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: BookOpen, value: "1L+", label: "Practice Questions", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Trophy, value: "95%", label: "Exam Success Rate", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDialogOpen(true);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20 bg-slate-950">
      {/* Visual Ambiance Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Neon Glow Shapes */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[130px] animate-glow-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[130px] animate-glow-pulse" />
        
        {/* Cybernetic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="particle" style={{ top: "20%", left: "15%", animationDelay: "0s" }} />
          <div className="particle" style={{ top: "60%", left: "80%", animationDelay: "2s" }} />
          <div className="particle" style={{ top: "80%", left: "30%", animationDelay: "4s" }} />
          <div className="particle" style={{ top: "30%", left: "70%", animationDelay: "1s" }} />
          <div className="particle" style={{ top: "45%", left: "50%", animationDelay: "3s" }} />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Main Content */}
          <div className="lg:col-span-7 text-left space-y-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20"
            >
              <Sparkles className="h-3 w-3 text-amber-500 animate-spin-slow" />
              India's Premier Exam Preparation Hub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white"
            >
              Master Every Exam with <br />
              <span className="text-shimmer">Taiyari Hub</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed font-medium"
            >
              GATE • UPSC • IIT JEE • NEET • School Boards. AI-powered customized practice sets, live test simulators, and verified expert explanations.
            </motion.p>

            {/* Glowing Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="relative max-w-xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-primary/20 rounded-2xl blur-lg group-hover:opacity-100 opacity-75 transition-opacity" />
              <div className="relative flex items-center bg-slate-900/90 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-amber-500/50 transition-all shadow-2xl">
                <Search className="h-5 w-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Which exam are you preparing for? (e.g. GATE, IIT JEE)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder:text-slate-500 text-sm pl-3 focus:outline-none focus:ring-0"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shrink-0"
                >
                  Find Exam
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </motion.form>

            {/* Fast Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-4 max-w-lg"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <span className="font-display font-black text-lg md:text-2xl text-white">{stat.value}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Floating Interactive Dashboard Widgets */}
          <div className="lg:col-span-5 relative w-full min-h-[500px] flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
            {/* Card 1: AI Performance Tracker (Background Left) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ 
                opacity: { duration: 0.6, delay: 0.2 },
                x: { duration: 0.6, delay: 0.2 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } 
              }}
              className="absolute left-0 lg:-left-12 top-4 lg:top-8 w-64 glass rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 z-10 hover:z-40 hover:scale-105 group hidden sm:block"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-amber-500 tracking-wider uppercase">AI Prediction v4.0</span>
                <Sparkles size={12} className="text-amber-500/50" />
              </div>
              <div className="mb-4">
                <p className="text-2xl font-black text-white font-display">680 <span className="text-xs text-slate-500 font-bold">/ 1000</span></p>
                <p className="text-[10px] text-emerald-400 font-bold">Est. GATE Score • 94.6% Confidence</p>
              </div>
              {/* Neon Graph SVG */}
              <div className="h-16 w-full relative">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path d="M0 35 Q 20 30, 40 25 T 70 15 T 100 5" fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <circle cx="100" cy="5" r="3" fill="#f59e0b" className="animate-pulse" />
                </svg>
              </div>
            </motion.div>

            {/* Card 2: Syllabus Mastery Meter (Center Front) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
              transition={{ 
                opacity: { duration: 0.6, delay: 0.4 },
                scale: { duration: 0.6, delay: 0.4 },
                y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
              }}
              className="relative w-full max-w-[340px] z-30 gradient-border bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300 mx-auto lg:mr-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-sm text-white">Mastery Index</h3>
                  <p className="text-[10px] text-slate-400">Syllabus Coverage</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-500">12 Day Streak</span>
                </div>
              </div>

              {/* Circular Mastery Rings */}
              <div className="flex justify-center my-6 relative">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Outer Ring (Speed) */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90 animate-spin-slow" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* Middle Ring (Accuracy) */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="238" strokeDashoffset="28" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  </svg>
                  
                  {/* Center Content */}
                  <div className="text-center">
                    <span className="text-3xl font-black text-white font-display">88<span className="text-lg">%</span></span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                   <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
                   <p className="text-sm font-bold text-emerald-400">92%</p>
                 </div>
                 <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                   <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Avg Speed</p>
                   <p className="text-sm font-bold text-blue-400">42s/Q</p>
                 </div>
              </div>
            </motion.div>

            {/* Card 3: Live Simulator & Map (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 30 }}
              animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ 
                opacity: { duration: 0.6, delay: 0.6 },
                x: { duration: 0.6, delay: 0.6 },
                y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 } 
              }}
              className="absolute right-0 lg:-right-6 -bottom-8 lg:-bottom-12 w-72 glass rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 z-20 hover:z-40 hover:scale-105 hidden sm:block"
            >
              {/* Live Indicator */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Live Simulator</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">04h 12m</span>
              </div>
              
              <h4 className="font-bold text-sm text-white mb-4">GATE National Scholarship Test</h4>
              
              {/* Activity Grid */}
              <div className="grid grid-cols-7 gap-1 mb-5 opacity-70">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className={`h-2 rounded-sm ${i === 12 ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : i % 3 === 0 ? 'bg-emerald-500/80' : i % 5 === 0 ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] h-8 rounded-lg border border-white/10 transition-colors"
                >
                  Explore
                </Button>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="flex-[1.5] bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] h-8 rounded-lg shadow-lg transition-transform hover:scale-105"
                >
                  Register Now
                </Button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <ExamCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default HeroSection;
