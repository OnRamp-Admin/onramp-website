import Hero from './components/Hero';
import WorkflowVisualization from './components/WorkflowVisualization';
import ROICalculator from './components/ROICalculator';
import ValueProps from './components/ValueProps';
import Pricing from './components/Pricing';
import StickyCTA from './components/StickyCTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100">
      <Hero />
      <WorkflowVisualization />
      <ValueProps />
      <ROICalculator />
      <Pricing />
      <Footer />
      <StickyCTA />
    </div>
  );
}

export default App;
