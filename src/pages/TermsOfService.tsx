import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
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
              <FileText className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
            </div>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-display font-bold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing and using Taiyari Hub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">2. Use of Services</h2>
              <p>You agree to use Taiyari Hub only for lawful purposes and in accordance with these terms. You must not misuse the platform, attempt to access restricted areas, or interfere with the proper working of the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">3. Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate information when creating your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">4. Content & Intellectual Property</h2>
              <p>All content on Taiyari Hub, including questions, solutions, and study materials, is the intellectual property of Taiyari Hub or its licensors. You may not reproduce, distribute, or commercially exploit any content without prior written consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">5. Subscriptions & Payments</h2>
              <p>Certain features require a paid subscription. All payments are processed securely. Subscription details, pricing, and refund eligibility are outlined in our Refund Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">6. Limitation of Liability</h2>
              <p>Taiyari Hub is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">7. Contact</h2>
              <p>For questions regarding these terms, please reach out to <a href="mailto:support@taiyarihub.in" className="text-primary hover:underline">support@taiyarihub.in</a>.</p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
