import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building, GraduationCap, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const boards = ["CBSE", "ICSE"];

const entranceExams = ["JEE Mains", "JEE Advanced", "NEET PG", "CUET"];

const statesWithExams: { name: string; exams: string[] }[] = [
  { name: "Andhra Pradesh", exams: ["APPSC Group 1", "APPSC Group 2", "APPSC Group 3", "APPSC Group 4", "AP Police SI/Constable"] },
  { name: "Arunachal Pradesh", exams: ["APPSC Combined Competitive Exam", "Arunachal Police Recruitment"] },
  { name: "Assam", exams: ["APSC Combined Competitive Exam", "Assam Police SI/Constable", "Assam TET"] },
  { name: "Bihar", exams: ["BPSC CCE", "BPSC Teacher", "Bihar Police SI/Constable", "Bihar SSC"] },
  { name: "Chhattisgarh", exams: ["CGPSC SSE", "CG Police", "CG TET", "CG Vyapam Exams"] },
  { name: "Goa", exams: ["Goa PSC Recruitment", "Goa Police Recruitment"] },
  { name: "Gujarat", exams: ["GPSC Class 1 & 2", "Gujarat Police", "GSSSB Exams", "Gujarat TET"] },
  { name: "Haryana", exams: ["HPSC HCS", "HSSC Exams", "Haryana Police", "HTET"] },
  { name: "Himachal Pradesh", exams: ["HPPSC HAS", "HP Police", "HP TET", "HPSSC Exams"] },
  { name: "Jharkhand", exams: ["JPSC CCE", "Jharkhand Police", "JTET", "JSSC Exams"] },
  { name: "Karnataka", exams: ["KPSC KAS", "Karnataka Police", "KSET", "Karnataka TET"] },
  { name: "Kerala", exams: ["Kerala PSC Exams", "Kerala Police", "KTET"] },
  { name: "Madhya Pradesh", exams: ["MPPSC SSE", "MP Police", "MP TET", "MP Vyapam"] },
  { name: "Maharashtra", exams: ["MPSC Rajyaseva", "MPSC Combined", "Maharashtra Police", "MAHA TET"] },
  { name: "Manipur", exams: ["Manipur PSC CCE", "Manipur Police"] },
  { name: "Meghalaya", exams: ["MPSC Meghalaya CCE", "Meghalaya Police"] },
  { name: "Mizoram", exams: ["Mizoram PSC Exams", "Mizoram Police"] },
  { name: "Nagaland", exams: ["Nagaland PSC CCE", "Nagaland Police"] },
  { name: "Odisha", exams: ["OPSC OCS", "OSSC Exams", "Odisha Police", "OTET"] },
  { name: "Punjab", exams: ["PPSC PCS", "Punjab Police", "PSTET", "PSSSB Exams"] },
  { name: "Rajasthan", exams: ["RPSC RAS", "Rajasthan Police", "REET", "RSMSSB Exams"] },
  { name: "Sikkim", exams: ["Sikkim PSC Combined Exams", "Sikkim Police"] },
  { name: "Tamil Nadu", exams: ["TNPSC Group 1, 2, 4", "TNUSRB Police", "TNTET"] },
  { name: "Telangana", exams: ["TSPSC Group 1, 2", "TS Police", "TSTET"] },
  { name: "Tripura", exams: ["TPSC TCS", "Tripura Police", "Tripura TET"] },
  { name: "Uttar Pradesh", exams: ["UPPSC PCS", "UP Police", "UPSSSC PET", "UPTET"] },
  { name: "Uttarakhand", exams: ["UKPSC PCS", "UK Police", "UTET", "UKSSSC"] },
  { name: "West Bengal", exams: ["WBPSC WBCS", "WB Police", "WBSSC", "WB TET"] },
];

const unionTerritoriesWithExams: { name: string; exams: string[] }[] = [
  { name: "Andaman and Nicobar Islands", exams: ["A&N Administration Recruitment"] },
  { name: "Chandigarh", exams: ["Chandigarh Administration Exams", "Chandigarh Police"] },
  { name: "Dadra and Nagar Haveli and Daman and Diu", exams: ["UT Administration Recruitment"] },
  { name: "Delhi (National Capital Territory of Delhi)", exams: ["DSSSB Exams", "Delhi Police", "Delhi Judicial Services"] },
  { name: "Jammu and Kashmir", exams: ["JKPSC KAS", "JK Police", "JKSSB Exams"] },
  { name: "Ladakh", exams: ["Ladakh Administration Recruitment"] },
  { name: "Lakshadweep", exams: ["Lakshadweep Administration Recruitment"] },
  { name: "Puducherry", exams: ["Puducherry PSC Exams", "Puducherry Police"] },
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              School & State Exams
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              Exams Directory
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore board exams, entrance exams, and state-level competitive exams.
            </p>
          </motion.div>

          {/* Boards */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Board Exams
                </h2>
                <p className="text-sm text-muted-foreground">National education boards</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3"
            >
              {boards.map((board) => (
                <motion.div
                  key={board}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{board}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Entrance Exams */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Entrance Exams
                </h2>
                <p className="text-sm text-muted-foreground">National level entrance tests</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {entranceExams.map((exam) => (
                <motion.div
                  key={exam}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 cursor-not-allowed opacity-70 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{exam}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                    COMING SOON
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

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
                <p className="text-sm text-muted-foreground">{statesWithExams.length} States</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {statesWithExams.map((state) => (
                <motion.div
                  key={state.name}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 cursor-not-allowed opacity-70 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{state.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                      COMING SOON
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {state.exams.map((exam) => (
                      <span key={exam} className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {exam}
                      </span>
                    ))}
                  </div>
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
                <p className="text-sm text-muted-foreground">{unionTerritoriesWithExams.length} Union Territories</p>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {unionTerritoriesWithExams.map((ut) => (
                <motion.div
                  key={ut.name}
                  variants={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="rounded-xl p-4 bg-gradient-to-br from-sky-500/20 to-sky-600/5 border border-sky-500/30 cursor-not-allowed opacity-70 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{ut.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                      COMING SOON
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ut.exams.map((exam) => (
                      <span key={exam} className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {exam}
                      </span>
                    ))}
                  </div>
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
