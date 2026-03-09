import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import CentralExams from "./pages/CentralExams";
import StateExams from "./pages/StateExams";
import SchoolExams from "./pages/SchoolExams";
import ForeignExams from "./pages/ForeignExams";
import ExamDetail from "./pages/ExamDetail";
import StateExamDetail from "./pages/StateExamDetail";
import SectionSets from "./pages/SectionSets";
import SourceListPage from "./pages/SourceListPage";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import DetailedAnswers from "./pages/DetailedAnswers";
import ScoreHistory from "./pages/ScoreHistory";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/exams/central" element={<CentralExams />} />
            <Route path="/exams/school" element={<SchoolExams />} />
            <Route path="/exams/foreign" element={<ForeignExams />} />
            <Route path="/exams/state" element={<StateExams />} />
            <Route path="/exams/state/:stateSlug" element={<StateExamDetail />} />
            <Route path="/exam/:examSlug" element={<ExamDetail />} />

            {/* Protected routes — require authentication */}
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ScoreHistory /></ProtectedRoute>} />
            <Route path="/results/:resultId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/results/:resultId/answers" element={<ProtectedRoute><DetailedAnswers /></ProtectedRoute>} />
            <Route path="/exam/:examSlug/sources/:sectionId" element={<ProtectedRoute><SourceListPage /></ProtectedRoute>} />
            <Route path="/exam/:examSlug/:sectionId/:sourceId/:setNumber" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/exam/:examSlug/:sectionId/:setNumber" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/exam/:examSlug/:sectionId" element={<ProtectedRoute><SectionSets /></ProtectedRoute>} />

            {/* Admin-only route — requires admin role */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
