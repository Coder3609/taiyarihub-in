import { motion } from "framer-motion";
import { ArrowLeft, ScrollText, ClipboardList, Building2, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sectionMeta: Record<string, { title: string; icon: React.ElementType; color: string; borderColor: string; badgeColor: string }> = {
  pyqs: { title: "Previous Year Questions (PYQs)", icon: ScrollText, color: "from-blue-500/20 to-blue-600/5", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-400" },
  mocks: { title: "Mock Tests", icon: ClipboardList, color: "from-purple-500/20 to-purple-600/5", borderColor: "border-purple-500/30", badgeColor: "bg-purple-500/10 text-purple-400" },
  institute: { title: "Institute Questions", icon: Building2, color: "from-amber-500/20 to-amber-600/5", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-400" },
  books: { title: "Popular Books Questions", icon: BookOpen, color: "from-emerald-500/20 to-emerald-600/5", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-400" },
};

const TOTAL_SETS = 45;

const SectionSets = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId } = useParams();
  const meta = sectionMeta[sectionId || ""] || sectionMeta.pyqs;
  const Icon = meta.icon;
  const examName = decodeURIComponent(examSlug || "").replace(/-/g, " ");

  const sets = Array.from({ length: TOTAL_SETS }, (_, i) => i + 1);

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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-xl ${meta.badgeColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl md:text-3xl font-bold text-foreground">
                  {meta.title}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground capitalize">{examName}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {sets.map((num) => (
              <motion.div
                key={num}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -2, scale: 1.01 }}
                onClick={() => navigate(`/exam/${examSlug}/${sectionId}/${num}`)}
                className={`rounded-xl p-3.5 bg-gradient-to-br ${meta.color} border ${meta.borderColor} cursor-pointer transition-all hover:shadow-md flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${meta.badgeColor}`}>
                    {String(num).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {meta.title.split(" ")[0]} Set {num}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SectionSets;
