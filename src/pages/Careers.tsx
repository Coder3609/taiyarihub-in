import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Careers = () => {
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">Careers</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Join the <span className="text-primary">Taiyari Hub</span> Team
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Help us build the future of exam preparation in India. We're looking for passionate people who care about education.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/0 p-8 md:p-12 text-center">
            <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">No Open Positions Right Now</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              We don't have any open roles at the moment, but we're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <a href="mailto:careers@taiyarihub.in">
              <Button className="font-semibold">Send Your Resume</Button>
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
