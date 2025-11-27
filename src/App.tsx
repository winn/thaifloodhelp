import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LiffProvider } from "./contexts/LiffContext";
import Landing from "./pages/Landing";
import Input from "./pages/Input";
import SelectReports from "./pages/SelectReports";
import Review from "./pages/Review";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import ReportDetail from "./pages/ReportDetail";
import Help from "./pages/Help";
import Map from "./pages/Map";
import Api from "./pages/Api";
import Auth from "./pages/Auth";
import Mission from "./pages/Mission";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <LiffProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/extraction" element={<Input />} />
              <Route path="/select" element={<SelectReports />} />
              <Route path="/review" element={<Review />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/report/:id" element={<ReportDetail />} />
              <Route path="/map" element={<Map />} />
              <Route path="/api" element={<Api />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LiffProvider>
);

export default App;
