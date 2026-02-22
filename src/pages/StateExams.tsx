import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const unionTerritories = [
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (National Capital Territory of Delhi)",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const StateExams = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              State & UT Exams
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              State Exams Directory
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select your state or union territory to explore available competitive exams.
            </p>
          </motion.div>

          {/* States */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  States of India
                </h2>
                <p className="text-sm text-muted-foreground">{states.length} States</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {states.map((state) => (
                <motion.div
                  key={state}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{state}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Union Territories */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Union Territories of India
                </h2>
                <p className="text-sm text-muted-foreground">{unionTerritories.length} Union Territories</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {unionTerritories.map((ut) => (
                <motion.div
                  key={ut}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-sky-500/20 to-sky-600/5 border border-sky-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{ut}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StateExams;
