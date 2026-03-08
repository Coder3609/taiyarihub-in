import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ScrollText, ClipboardList, BookOpen, ChevronRight, Cpu, Radio, Zap, Cog, FlaskConical, Atom, Ruler, Hammer, Droplets, Leaf, LayoutGrid, Globe, Rocket, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Streams config for exams that have multiple branches/streams
const examStreams: Record<string, { id: string; title: string; shortName: string; icon: React.ElementType; color: string; borderColor: string }[]> = {
  "GATE-Graduate-Aptitude-Test-in-Engineering": [
    { id: "cs", title: "Computer Science & IT", shortName: "CS", icon: Cpu, color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/50" },
    { id: "ec", title: "Electronics & Communication", shortName: "EC", icon: Radio, color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/50" },
    { id: "ee", title: "Electrical Engineering", shortName: "EE", icon: Zap, color: "from-amber-500/20 to-amber-600/5", borderColor: "hover:border-amber-500/50" },
    { id: "me", title: "Mechanical Engineering", shortName: "ME", icon: Cog, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "hover:border-emerald-500/50" },
    { id: "ce", title: "Civil Engineering", shortName: "CE", icon: Ruler, color: "from-orange-500/20 to-orange-600/5", borderColor: "hover:border-orange-500/50" },
    { id: "ch", title: "Chemical Engineering", shortName: "CH", icon: FlaskConical, color: "from-pink-500/20 to-pink-600/5", borderColor: "hover:border-pink-500/50" },
    { id: "in", title: "Instrumentation Engineering", shortName: "IN", icon: LayoutGrid, color: "from-cyan-500/20 to-cyan-600/5", borderColor: "hover:border-cyan-500/50" },
    { id: "bt", title: "Biotechnology", shortName: "BT", icon: Leaf, color: "from-lime-500/20 to-lime-600/5", borderColor: "hover:border-lime-500/50" },
    { id: "mt", title: "Metallurgical Engineering", shortName: "MT", icon: Hammer, color: "from-stone-500/20 to-stone-600/5", borderColor: "hover:border-stone-500/50" },
    { id: "pe", title: "Petroleum Engineering", shortName: "PE", icon: Droplets, color: "from-yellow-500/20 to-yellow-600/5", borderColor: "hover:border-yellow-500/50" },
    { id: "ph", title: "Physics", shortName: "PH", icon: Atom, color: "from-indigo-500/20 to-indigo-600/5", borderColor: "hover:border-indigo-500/50" },
  ],
  "ISRO-Indian-Space-Research-Organisation": [
    { id: "me", title: "Mechanical Engineering", shortName: "ME", icon: Cog, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "hover:border-emerald-500/50" },
    { id: "ce", title: "Civil Engineering", shortName: "CE", icon: Ruler, color: "from-orange-500/20 to-orange-600/5", borderColor: "hover:border-orange-500/50" },
    { id: "ee", title: "Electrical Engineering", shortName: "EE", icon: Zap, color: "from-amber-500/20 to-amber-600/5", borderColor: "hover:border-amber-500/50" },
    { id: "ec", title: "Electronics & Communication", shortName: "EC", icon: Radio, color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/50" },
    { id: "cs", title: "Computer Science", shortName: "CS", icon: Cpu, color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/50" },
    { id: "ae", title: "Aerospace Engineering", shortName: "AE", icon: Rocket, color: "from-cyan-500/20 to-cyan-600/5", borderColor: "hover:border-cyan-500/50" },
  ],
  "CBSE": [
    { id: "class-9", title: "Class 9", shortName: "9", icon: BookOpen, color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/50" },
    { id: "class-10", title: "Class 10", shortName: "10", icon: BookOpen, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "hover:border-emerald-500/50" },
    { id: "class-11", title: "Class 11", shortName: "11", icon: BookOpen, color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/50" },
    { id: "class-12", title: "Class 12", shortName: "12", icon: BookOpen, color: "from-amber-500/20 to-amber-600/5", borderColor: "hover:border-amber-500/50" },
  ],
  "ICSE": [
    { id: "class-9", title: "Class 9", shortName: "9", icon: BookOpen, color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/50" },
    { id: "class-10", title: "Class 10", shortName: "10", icon: BookOpen, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "hover:border-emerald-500/50" },
    { id: "class-11", title: "Class 11", shortName: "11", icon: BookOpen, color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/50" },
    { id: "class-12", title: "Class 12", shortName: "12", icon: BookOpen, color: "from-amber-500/20 to-amber-600/5", borderColor: "hover:border-amber-500/50" },
  ],
};

const sectionQuotes: Record<string, string> = {
  pyqs: "Learn from the past, ace the future.",
  mocks: "Practice under pressure, perform with ease.",
  
  books: "Master the classics, conquer the exam.",
};

const sections = [
  {
    id: "pyqs",
    title: "Previous Year Questions",
    shortTitle: "PYQs",
    icon: ScrollText,
    color: "from-blue-500/20 via-blue-600/10 to-indigo-700/5",
    borderColor: "border-blue-500/20 hover:border-blue-400/60",
    badgeColor: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    accentDot: "bg-blue-400",
    stats: ["Year-wise sorted", "With solutions"],
  },
  {
    id: "mocks",
    title: "Mock Tests",
    shortTitle: "Mocks",
    icon: ClipboardList,
    color: "from-purple-500/20 via-purple-600/10 to-violet-700/5",
    borderColor: "border-purple-500/20 hover:border-purple-400/60",
    badgeColor: "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]",
    accentDot: "bg-purple-400",
    stats: ["Timed tests", "Instant results"],
  },
  {
    id: "books",
    title: "Popular Books",
    shortTitle: "Books",
    icon: BookOpen,
    color: "from-emerald-500/20 via-emerald-600/10 to-teal-700/5",
    borderColor: "border-emerald-500/20 hover:border-emerald-400/60",
    badgeColor: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    accentDot: "bg-emerald-400",
    stats: ["Best sellers", "Chapter-wise"],
  },
  {
    id: "master",
    title: "Subject-wise Master Questions",
    shortTitle: "Master",
    icon: GraduationCap,
    color: "from-rose-500/20 via-rose-600/10 to-pink-700/5",
    borderColor: "border-rose-500/20 hover:border-rose-400/60",
    badgeColor: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]",
    accentDot: "bg-rose-400",
    stats: ["Subject-wise", "Expert level"],
  },
];
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const ExamDetail = () => {
  const navigate = useNavigate();
  const { examSlug, streamId } = useParams();

  const examName = (examSlug || "").replace(/-/g, " ");
  const streams = examStreams[examSlug || ""];
  const hasStreams = !!streams && streams.length > 0;

  // If exam has streams and no stream selected yet, show stream selection
  if (hasStreams && !streamId) {
    const selectedStream = streams.find((s) => s.id === streamId);
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 capitalize">
                {examName}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {examSlug === "CBSE" || examSlug === "ICSE" ? "Select your class to continue." : "Select your stream / branch to continue."}
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5"
            >
              {streams.map((stream) => (
                <motion.div
                  key={stream.id}
                  variants={item}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/exam/${examSlug}/stream/${stream.id}`)}
                  className={`relative rounded-xl p-3 aspect-square bg-gradient-to-br ${stream.color} border border-border/50 ${stream.borderColor} cursor-pointer transition-all flex flex-col justify-between group`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {stream.shortName}
                    </span>
                    <stream.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-display font-bold text-foreground text-xs leading-tight line-clamp-2">
                      {stream.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show sections (PYQs, Mocks, etc.)
  const selectedStream = streams?.find((s) => s.id === streamId);
  const basePath = streamId ? `/exam/${examSlug}/stream/${streamId}` : `/exam/${examSlug}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => streamId ? navigate(`/exam/${examSlug}`) : navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 capitalize">
              {selectedStream ? `${examName} — ${selectedStream.title}` : examName}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Choose a section below to start practicing.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5"
          >
            {sections.map((section) => {
              const sectionPath = (section.id === "books")
                ? `${basePath}/sources/${section.id}`
                : `${basePath}/${section.id}`;
              return (
              <motion.div
                key={section.id}
                variants={item}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(sectionPath)}
                className={`relative rounded-2xl p-5 md:p-6 bg-gradient-to-br ${section.color} border ${section.borderColor} cursor-pointer transition-all duration-300 ${section.glowColor} flex flex-col group overflow-hidden min-h-[200px]`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-tl from-white/[0.02] to-transparent pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className={`p-2.5 rounded-xl ${section.badgeColor} backdrop-blur-sm`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-muted-foreground font-medium">Explore</span>
                    <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                <div className="mt-4 flex-1 relative z-10">
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground tracking-tight">
                    {section.shortTitle}
                  </h3>
                  <p className="text-xs italic text-muted-foreground/80 mt-2 leading-relaxed">
                    "{sectionQuotes[section.id]}"
                  </p>
                </div>

                <div className="mt-auto pt-4 relative z-10">
                  <div className="flex flex-wrap gap-2">
                    {section.stats.map((stat) => (
                      <span
                        key={stat}
                        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-background/40 backdrop-blur-sm text-muted-foreground border border-border/30 font-medium"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${section.accentDot}`} />
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExamDetail;
