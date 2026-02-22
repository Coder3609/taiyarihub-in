import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CentralExams from "./pages/CentralExams";
import StateExams from "./pages/StateExams";
import ExamDetail from "./pages/ExamDetail";
import SectionSets from "./pages/SectionSets";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import ScoreHistory from "./pages/ScoreHistory";
import Auth from "./pages/Auth";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/exams/central" element={<CentralExams />} />
            <Route path="/exams/state" element={<StateExams />} />
            <Route path="/exam/:examSlug" element={<ExamDetail />} />
            <Route path="/exam/:examSlug/:sectionId" element={<SectionSets />} />
            <Route path="/exam/:examSlug/:sectionId/:setNumber" element={<Quiz />} />
            <Route path="/results/:resultId" element={<Results />} />
            <Route path="/history" element={<ScoreHistory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
