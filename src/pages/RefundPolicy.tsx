import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
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
              <RotateCcw className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Refund Policy</h1>
            </div>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-display font-bold text-foreground">1. Refund Eligibility</h2>
              <p>We offer a full refund within 7 days of purchase if you are not satisfied with our premium subscription. After 7 days, refunds will be considered on a case-by-case basis.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">2. How to Request a Refund</h2>
              <p>To request a refund, please email us at <a href="mailto:support@taiyarihub.in" className="text-primary hover:underline">support@taiyarihub.in</a> with your registered email, order details, and reason for the refund request.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">3. Processing Time</h2>
              <p>Approved refunds will be processed within 5–10 business days and credited to the original payment method.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">4. Non-Refundable Cases</h2>
              <p>Refunds will not be issued if significant usage of the platform has occurred (e.g., multiple mock tests attempted), if the account has been suspended for violation of terms, or if the request is made after 30 days of purchase.</p>
            </section>

            <section>
              <h2 className="text-lg font-display font-bold text-foreground">5. Contact</h2>
              <p>For refund-related queries, reach out to <a href="mailto:support@taiyarihub.in" className="text-primary hover:underline">support@taiyarihub.in</a>.</p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
