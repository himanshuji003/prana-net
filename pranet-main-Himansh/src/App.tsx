import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GlassNavbar } from "@/components/shared/GlassNavbar";
import { GradientMeshBackground } from "@/components/shared/GradientMeshBackground";

// Lazy loading pages
const LandingPage = lazy(() => import("@/pages/LandingPage").then(module => ({ default: module.LandingPage })));
const CitizenDashboard = lazy(() => import("@/pages/CitizenDashboard").then(module => ({ default: module.CitizenDashboard })));
const OfficialDashboard = lazy(() => import("@/pages/OfficialDashboard").then(module => ({ default: module.OfficialDashboard })));
const OfficerDashboard = lazy(() => import("@/pages/OfficerDashboard").then(module => ({ default: module.OfficerDashboard })));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/citizen/*" element={<CitizenDashboard />} />
        <Route path="/official/*" element={<OfficialDashboard />} />
        <Route path="/officer/*" element={<OfficerDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App = () => {
  return (
    <Router>
      <GradientMeshBackground />
      <GlassNavbar />
      <Suspense fallback={<div className="min-h-screen bg-forest-primary flex items-center justify-center text-lime font-data animate-pulse">Initializing PRANA-NET...</div>}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
