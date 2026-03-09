import { motion } from "framer-motion";
import { ArrowLeft, Mail, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactChannels = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    value: "support@taiyarihub.in",
    href: "mailto:support@taiyarihub.in",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: Twitter,
    title: "Twitter / X",
    description: "Follow us for updates and tips",
    value: "@TaiyariHub",
    href: "https://twitter.com/TaiyariHub",
    color: "from-sky-500/20 to-sky-600/5",
    iconColor: "text-sky-400",
  },
  {
    icon: Linkedin,
    title: "LinkedIn",
    description: "Connect with us professionally",
    value: "Taiyari Hub",
    href: "https://linkedin.com/company/taiyarihub",
    color: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-400",
  },
];

const Contact = () => {
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">Contact</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Have questions, feedback, or suggestions? Reach out to us through any of the channels below.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            {contactChannels.map((ch) => (
              <a
                key={ch.title}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-2xl p-6 bg-gradient-to-br ${ch.color} border border-border/50 hover:border-primary/30 transition-all group`}
              >
                <ch.icon className={`h-7 w-7 ${ch.iconColor} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-display font-bold text-foreground mb-1">{ch.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{ch.description}</p>
                <span className="text-sm font-medium text-primary">{ch.value}</span>
              </a>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 to-muted/0 p-8 text-center">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-display font-bold text-foreground mb-2">Business Inquiries</h3>
            <p className="text-sm text-muted-foreground mb-1">For partnerships, collaborations, or business-related queries:</p>
            <a href="mailto:business@edumask.in" className="text-sm font-medium text-primary hover:underline">business@edumask.in</a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
