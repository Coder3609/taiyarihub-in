import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Config: map examSlug → books/authors per exam
const examSources: Record<string, {
  books: { id: string; name: string; description: string }[];
}> = {
  "GATE-Graduate-Aptitude-Test-in-Engineering": {
    books: [
      { id: "cormen", name: "Cormen (CLRS)", description: "Introduction to Algorithms" },
      { id: "galvin", name: "Galvin", description: "Operating System Concepts" },
      { id: "tanenbaum-cn", name: "Tanenbaum", description: "Computer Networks" },
      { id: "navathe", name: "Navathe", description: "Fundamentals of Database Systems" },
      { id: "morris-mano", name: "Morris Mano", description: "Digital Logic & Computer Design" },
      { id: "william-stallings", name: "William Stallings", description: "Computer Organization & Architecture" },
      { id: "kenneth-rosen", name: "Kenneth Rosen", description: "Discrete Mathematics & Applications" },
      { id: "ullman", name: "Ullman (Hopcroft)", description: "Introduction to Automata Theory" },
    ],
  },
};

const sectionConfig = {
  books: {
    title: "Select Author / Book",
    subtitle: "Choose a book to practice chapter-wise questions.",
    icon: BookOpen,
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "hover:border-emerald-500/50",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SourceListPage = () => {
  const navigate = useNavigate();
  const { examSlug, sectionId, streamId } = useParams();

  const type = sectionId as "books";
  const config = sectionConfig[type] || sectionConfig.books;
  const Icon = config.icon;
  const examName = (examSlug || "").replace(/-/g, " ");

  const basePath = streamId
    ? `/exam/${examSlug}/stream/${streamId}`
    : `/exam/${examSlug}`;

  const sources = examSources[examSlug || ""]?.books || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate(basePath)}
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
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-xl ${config.badgeColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl md:text-3xl font-bold text-foreground">
                  {config.title}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground capitalize">
                  {examName}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{config.subtitle}</p>
          </motion.div>

          {sources.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Icon className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm mt-1">
                No books available for this exam yet.
              </p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {sources.map((source) => (
                <motion.div
                  key={source.id}
                  variants={item}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(`${basePath}/${sectionId}/${source.id}`)
                  }
                  className={`rounded-xl p-4 bg-gradient-to-br ${config.color} border border-border/50 ${config.borderColor} cursor-pointer transition-all flex flex-col group`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${config.badgeColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-3 flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      {source.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {source.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SourceListPage;
