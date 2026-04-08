import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const questions = [
  '"What\'s the torque spec on the cylinder head bolts?"',
  '"Give me an overview of the next five steps of this procedure."',
  '"This Bronco grinds turning hard right but the brakes check out — what else should I look at?"',
  '"I need to see the diagram for this step. Open the PDF to the exact page for me."',
  '"Save a note that the rotor has 0.003\u2033 of lateral runout on the passenger side."',
  '"I\'ve got three DTCs: P0766, P2703, and P0731. Walk me through them."',
  '"Are there any TSBs on the BMW X5 45e high-voltage battery coolant loss issue?"',
];

export default function BrainButtonPrompts() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % questions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[500px] mx-auto mt-14 h-[110px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="relative">
            {/* Chat bubble */}
            <div className="bg-carbon-800/80 border border-carbon-600/40 rounded-2xl rounded-bl-sm px-6 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-electric-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-electric-400 text-xs font-semibold uppercase tracking-wider">Tap the Brain Button</span>
                  <p className="text-carbon-200 text-base italic leading-snug mt-1">
                    {questions[index]}
                  </p>
                </div>
              </div>
            </div>
            {/* Bubble tail */}
            <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-carbon-800/80 border-b border-l border-carbon-600/40 rotate-[-35deg] rounded-sm" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
