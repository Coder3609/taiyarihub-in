import { motion } from "framer-motion";
import { Trophy, Timer, Users, TrendingUp, Sparkles, Medal } from "lucide-react";

const LiveTestsPromoSection = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const leaderboardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, type: "spring" } },
  };

  return (
    <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        {/* Cybernetic Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black tracking-widest"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE FEATURE
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white leading-[1.1] tracking-tight">
              <span className="text-shimmer font-black">
                ALL INDIA MOCK TEST
              </span>
              <br />
              <span className="text-2xl md:text-3xl text-slate-400 font-extrabold tracking-widest mt-3 inline-block uppercase">
                [ GATE, JEE & NEET ]
              </span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Compete with thousands of aspirants nationwide. Our flagship All India Mock Tests open exactly <strong className="text-white font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">3 months before your exam</strong> to give you the ultimate real-exam experience.
            </motion.p>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center lg:items-start p-5 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-amber-500/20 transition-all hover:bg-slate-900/60 group">
                <div className="p-3 bg-amber-500/10 rounded-xl mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Trophy className="h-6 w-6 text-amber-500 animate-float" />
                </div>
                <h4 className="font-bold text-white text-lg mb-2">Live Leaderboard</h4>
                <p className="text-xs text-slate-400 leading-relaxed text-center lg:text-left">See your rank instantly as you compete in real-time with peers across India.</p>
              </div>
              
              <div className="flex flex-col items-center lg:items-start p-5 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-primary/20 transition-all hover:bg-slate-900/60 group">
                <div className="p-3 bg-primary/10 rounded-xl mb-4 group-hover:bg-primary/20 transition-colors">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold text-white text-lg mb-2">Exam Simulation</h4>
                <p className="text-xs text-slate-400 leading-relaxed text-center lg:text-left">Exact exam interface, strict timing, and negative marking to build endurance.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Animation / Visuals */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative mt-8 lg:mt-0">
            {/* Visual glow ring behind card */}
            <div className="absolute inset-0 -m-8 bg-amber-500/5 rounded-3xl blur-2xl z-0" />

            <motion.div 
              variants={leaderboardVariants}
              className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-10 gradient-border"
            >
              {/* Decorative header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-amber-500 animate-bounce" />
                  <h3 className="font-display font-extrabold text-base tracking-wide text-white uppercase">Live Rank Board</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded animate-pulse">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  00:45:12
                </div>
              </div>

              {/* Animated Leaderboard Rows */}
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Rahul S.", score: "92.5", color: "text-amber-400 border-amber-400/20 bg-amber-400/10", delay: 0 },
                  { rank: 2, name: "Priya M.", score: "89.0", color: "text-slate-300 border-slate-300/20 bg-slate-300/10", delay: 0.1 },
                  { rank: 3, name: "Aditya K.", score: "88.3", color: "text-orange-400 border-orange-400/20 bg-orange-400/10", delay: 0.2 },
                  { rank: 4, name: "You", score: "85.6", color: "text-amber-500 border-amber-500/20 bg-amber-500/10", delay: 0.3, isYou: true },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + row.delay, type: "spring" }}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                      row.isYou 
                        ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-primary/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]' 
                        : 'border-white/5 bg-slate-950/50 hover:bg-slate-900/60 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${row.color}`}>
                        #{row.rank}
                      </div>
                      <div className={`font-bold text-sm ${row.isYou ? 'text-amber-400' : 'text-slate-300'}`}>
                        {row.name} {row.isYou && <span className="ml-2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded">YOU</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-sm text-white">{row.score}</span>
                      <TrendingUp className={`h-4 w-4 ${row.isYou ? 'text-emerald-400 animate-bounce' : 'text-emerald-500/50'}`} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating Element 1 - Top Right */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-slate-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Competing Now</p>
                  <p className="font-display font-black text-base text-white leading-none mt-0.5">12,450+</p>
                </div>
              </motion.div>

              {/* Floating Element 2 - Bottom Left */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-5 -left-5 bg-slate-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3"
              >
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg animate-pulse">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Top Percentile</p>
                  <p className="font-display font-black text-base text-white leading-none mt-0.5">99.8%</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveTestsPromoSection;
