import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, X, Mic } from 'lucide-react';
import { trackCTAClick } from '../lib/analytics';

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approx 100vh)
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      if (scrollY > heroHeight * 0.8 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollY <= heroHeight * 0.5) {
        setIsVisible(false);
        setIsDismissed(false); // Reset dismiss when back at top
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-carbon-800/95 backdrop-blur-lg border border-carbon-700/50 shadow-2xl shadow-black/50">
              {/* Close Button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 rounded-lg text-carbon-500 hover:text-white hover:bg-carbon-700/50 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Content */}
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="hidden sm:flex p-3 rounded-xl bg-gradient-to-br from-electric-500/20 to-safety-500/20 border border-electric-500/30">
                  <Mic className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    Ready to stop the paperwork tax?
                  </p>
                  <p className="text-carbon-400 text-sm">
                    Get OnRamp running in your shop today.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="#contact"
                onClick={() => trackCTAClick({ cta_location: 'sticky_bar', cta_text: 'Get OnRamp for My Shop', destination: '/contact' })}
                className="group flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-electric-500/30"
              >
                Get OnRamp for My Shop
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
