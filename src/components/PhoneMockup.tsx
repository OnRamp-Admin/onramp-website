import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const phoneScreenshots = [
  { sm: '/diagnose-screen-sm.webp', full: '/diagnose-screen.webp' },
  { sm: '/prepare-screen-sm.webp', full: '/prepare-screen.webp' },
  { sm: '/workflow-screen-sm.webp', full: '/workflow-screen.webp' },
  { sm: '/step-screen-1-sm.webp', full: '/step-screen-1.webp' },
  { sm: '/step-screen-2-sm.webp', full: '/step-screen-2.webp' },
];

export default function PhoneMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phoneScreenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-[260px] md:w-[300px]">
      <div
        className="absolute overflow-hidden z-0"
        style={{
          left: '3.5%',
          right: '3.5%',
          top: '1.5%',
          bottom: '1.5%',
          borderRadius: '2rem',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            srcSet={`${phoneScreenshots[currentIndex].sm} 720w, ${phoneScreenshots[currentIndex].full} 1206w`}
            sizes="300px"
            src={phoneScreenshots[currentIndex].sm}
            alt="ONRAMP mobile app"
            className="w-full h-full object-cover object-top absolute inset-0"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-30%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ imageRendering: 'auto', WebkitFontSmoothing: 'antialiased' }}
          />
        </AnimatePresence>
      </div>
      <img
        src="/apple-iphone-17-pro-max-2025-medium.png"
        alt="OnRamp mobile app interface on iPhone"
        className="relative z-10 w-full h-auto drop-shadow-2xl"
      />
    </div>
  );
}
