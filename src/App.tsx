import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { trackPageView } from './lib/analytics';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AtAGlance from './components/AtAGlance';
import WorkflowVisualization from './components/WorkflowVisualization';
import AudienceSplit from './components/AudienceSplit';

import TechniciansPage from './pages/TechniciansPage';
import ManagersPage from './pages/ManagersPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import MobileAppPage from './pages/MobileAppPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';

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
        <img src="/Onramp-Logo-Pink Brain-White Text-MED.png" alt="ONRAMP" className="h-20 mb-8" />
        <h1 className="sr-only">ONRAMP</h1>
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
      <AtAGlance />
      <WorkflowVisualization />
      <AudienceSplit />

    </>
  );
}

function App() {
  if (COMING_SOON) {
    return (
      <div className="min-h-screen bg-carbon-950 text-carbon-100 overflow-x-hidden">
        <ScrollToTop />
        <Routes>
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="*" element={<Navigate to="/coming-soon" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100 overflow-x-hidden">
      <Navigation />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/mobileapp" element={<MobileAppPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
