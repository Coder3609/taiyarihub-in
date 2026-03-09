import { motion } from "framer-motion";
import { ArrowLeft, Target, Heart, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  { icon: Target, title: "Mission-Driven", description: "Making quality exam preparation accessible to every student across India.", color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
  { icon: Heart, title: "Student First", description: "Every feature we build starts with what students actually need.", color: "from-rose-500/20 to-rose-600/5", iconColor: "text-rose-400" },
  { icon: Users, title: "Community", description: "Building a supportive community of learners who grow together.", color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
  { icon: Sparkles, title: "Innovation", description: "Using AI and technology to create smarter learning experiences.", color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">About Us</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Empowering Students to <span className="text-primary">Ace Every Exam</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              EDUMask is India's comprehensive exam preparation platform. We provide AI-powered practice, real exam simulations, and expert solutions for GATE, JEE, UPSC, SSC, Banking, Board exams and more — all in one place.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We started EDUMask with a simple belief — every student deserves access to high-quality exam preparation, regardless of their background or location.</p>
              <p>Today, we serve thousands of students preparing for competitive exams across India, providing them with previous year questions, mock tests, subject-wise practice, and detailed solutions — all powered by modern technology.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className={`rounded-2xl p-6 bg-gradient-to-br ${v.color} border border-border/50`}>
                  <v.icon className={`h-6 w-6 ${v.iconColor} mb-3`} />
                  <h3 className="font-display font-bold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
