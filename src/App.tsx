import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Mic } from 'lucide-react';
import { trackPageView } from './lib/analytics';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './components/Hero';
import WorkflowVisualization from './components/WorkflowVisualization';
import ValueProps from './components/ValueProps';
import ROICalculator from './components/ROICalculator';
import Pricing from './components/Pricing';
import StickyCTA from './components/StickyCTA';
import TechniciansPage from './pages/TechniciansPage';
import ManagersPage from './pages/ManagersPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';

// Set to false to disable the coming soon redirect and show the full site
const COMING_SOON = false;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);
  return null;
}

function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-carbon-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-electric-500/20 to-safety-500/20 border border-electric-500/30 mb-8">
          <Mic className="w-10 h-10 text-electric-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          OnRamp
        </h1>
        <p className="text-xl md:text-2xl text-carbon-300 mb-2">
          Coming Soon
        </p>
        <p className="text-carbon-500 text-lg">
          AI for auto technicians
        </p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <WorkflowVisualization />
      <ValueProps />
      <ROICalculator />
      <Pricing />
      <StickyCTA />
    </>
  );
}

function App() {
  if (COMING_SOON) {
    return (
      <div className="min-h-screen bg-carbon-950 text-carbon-100">
        <ScrollToTop />
        <Routes>
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="*" element={<Navigate to="/coming-soon" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100">
      <Navigation />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
