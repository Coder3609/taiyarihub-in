import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ScrollText, ClipboardList, Building2, BookOpen, Cpu, Radio, Zap, Cog, FlaskConical, Atom, Ruler, Hammer, Droplets, Leaf, LayoutGrid } from "lucide-react";
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
};

const sections = [
  {
    id: "pyqs",
    title: "Previous Year Questions (PYQs)",
    description: "Practice with actual questions from past exams. Understand patterns, difficulty levels, and frequently tested topics.",
    icon: ScrollText,
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-400",
    stats: ["Year-wise sorted", "Topic-wise tagged", "With solutions"],
  },
  {
    id: "mocks",
    title: "Mock Tests",
    description: "Full-length and sectional mock tests simulating the real exam environment with timer and scoring.",
    icon: ClipboardList,
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/30",
    badgeColor: "bg-purple-500/10 text-purple-400",
    stats: ["Timed tests", "Instant results", "Performance analytics"],
  },
  {
    id: "institute",
    title: "Institute Questions",
    description: "Curated questions from top coaching institutes and academies across the country.",
    icon: Building2,
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-400",
    stats: ["Top institutes", "Expert curated", "Difficulty graded"],
  },
  {
    id: "books",
    title: "Popular Books Questions",
    description: "Important questions from the most recommended and popular books for this exam.",
    icon: BookOpen,
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    stats: ["Best sellers", "Chapter-wise", "Detailed solutions"],
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
              onClick={() => navigate(-1)}
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
                Select your stream / branch to continue.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            >
              {streams.map((stream) => (
                <motion.div
                  key={stream.id}
                  variants={item}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/exam/${examSlug}/stream/${stream.id}`)}
                  className={`relative rounded-xl p-5 bg-gradient-to-br ${stream.color} border border-border/50 ${stream.borderColor} cursor-pointer transition-all group`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <stream.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {stream.shortName}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm">
                    {stream.title}
                  </h3>
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
            onClick={() => navigate(-1)}
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
          >
            {sections.map((section) => (
              <motion.div
                key={section.id}
                variants={item}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => navigate(`${basePath}/${section.id}`)}
                className={`rounded-2xl p-5 md:p-6 bg-gradient-to-br ${section.color} border ${section.borderColor} cursor-pointer transition-all hover:shadow-lg group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.badgeColor} shrink-0`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-1.5">
                      {section.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {section.stats.map((stat) => (
                        <span
                          key={stat}
                          className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground border border-border/40"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExamDetail;
