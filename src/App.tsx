import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
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
  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100">
      <Navigation />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
