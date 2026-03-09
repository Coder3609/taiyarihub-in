import { motion } from "framer-motion";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">Blog</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Taiyari Hub <span className="text-primary">Blog</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Tips, strategies, and updates to help you prepare smarter.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/0 p-8 md:p-12 text-center">
            <PenLine className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">Coming Soon</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're working on some great articles about exam strategies, study tips, and success stories. Stay tuned!
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
