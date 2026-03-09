import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
            </div>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-display font-bold text-foreground">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as your name, email address, and exam preferences when you create an account. We also collect usage data such as exam scores, practice history, and platform interactions to improve your experience.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, personalize your learning experience, communicate updates and exam-related notifications, and ensure the security of your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">3. Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest. We regularly review our security practices to ensure your information remains safe.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">4. Data Sharing</h2>
              <p>We do not sell your personal information to third parties. We may share anonymized, aggregated data for analytical purposes. We may share data with service providers who assist us in operating our platform, subject to strict confidentiality obligations.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data. You may request a copy of your data or ask us to remove your account at any time by contacting us at <a href="mailto:support@edumask.in" className="text-primary hover:underline">support@edumask.in</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:support@edumask.in" className="text-primary hover:underline">support@edumask.in</a>.</p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
