import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { trackPageView } from './lib/analytics';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AtAGlance from './components/AtAGlance';
import WorkflowVisualization from './components/WorkflowVisualization';
import AudienceSplit from './components/AudienceSplit';
import { useSEO } from './hooks/useSEO';

// Lazy-loaded page components (code splitting)
const TechniciansPage = lazy(() => import('./pages/TechniciansPage'));
const ManagersPage = lazy(() => import('./pages/ManagersPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const MobileAppPage = lazy(() => import('./pages/MobileAppPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Set to false to disable the coming soon redirect and show the full site
const COMING_SOON = false;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Immediate scroll to prevent flash of wrong position
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    // Also scroll after a brief delay to catch any post-render layout shifts
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, 50);
    trackPageView(pathname);
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
}

function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-carbon-950 flex items-center justify-center px-4">
      <div className="text-center">
        <img src="/Onramp-Logo-Pink Brain-White Text-MED.png" alt="ONRAMP" className="h-20 mb-8" />
        <h1 className="sr-only">ONRAMP</h1>
        <p className="text-xl md:text-2xl text-carbon-200 mb-2">
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
  useSEO({
    title: 'OnRamp | Voice-First AI for Automotive Technicians',
    description: 'OnRamp is the AI voice assistant for auto technicians. Hands-free repair guidance, instant diagnostics, and automated RO documentation.',
  });

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
      <main>
        <Suspense fallback={<div className="min-h-screen bg-carbon-950" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/managers" element={<ManagersPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mobileapp" element={<MobileAppPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
