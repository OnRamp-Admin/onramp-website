import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, FileCheck, ArrowRight, Search, List, CheckCircle2 } from 'lucide-react';

const phases = [
  {
    icon: Search,
    label: 'DIAGNOSE',
    description: 'Pinpoint the problem with AI',
    color: 'text-electric-400',
    bgColor: 'bg-electric-500/10',
    borderColor: 'border-electric-500/30',
    borderActive: 'border-electric-500/60',
    glowColor: 'rgba(26,160,255,0.35)',
    checkColor: 'text-electric-400',
    detailDescription: 'DIAGNOSE_DESC',
    details: [
      'Cross-references TSBs and recalls from \'95 to today',
      'Symptom-driven diagnostic flow guided by AI',
      'Leverages deep understanding of complex vehicle systems',
      'Prioritizes most likely causes — get to root cause fast',
      'Documents diagnostic notes in real time',
      'Works for any make, model, and year',
    ],
  },
  {
    icon: List,
    label: 'PREPARE',
    description: 'AI Procedural Briefing',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    borderActive: 'border-amber-500/60',
    glowColor: 'rgba(245,158,11,0.35)',
    checkColor: 'text-amber-400',
    detailDescription: 'PREPARE_DESC',
    details: [
      'Upload OEM procedures or let AI generate them',
      'AI organizes steps into clear, logical groups',
      'Extracts and summarizes warnings and technical notes',
      'Generates a complete tools list',
      'Builds a replacement parts list',
      'Voice briefing covers everything needed before starting',
    ],
  },
  {
    icon: Wrench,
    label: 'REPAIR',
    description: 'AI Voice-Guided Repairs',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    borderActive: 'border-green-500/60',
    glowColor: 'rgba(74,222,128,0.35)',
    checkColor: 'text-green-400',
    detailDescription: 'REPAIR_DESC',
    details: [
      'Step-by-step voice guidance while working',
      'Ask for torque specs, fluid capacities, wiring info',
      'Start and stop voice sessions with the Brain Button',
      'AI tracks progress and keeps perfect notes',
      'Capture photos and videos during the procedure',
      'Open PDFs to the exact page using voice commands',
    ],
  },
  {
    icon: FileCheck,
    label: 'CLOSE OUT',
    description: 'AI-Generated RO Reports',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    borderActive: 'border-orange-500/60',
    glowColor: 'rgba(249,115,22,0.35)',
    checkColor: 'text-orange-400',
    detailDescription: 'CLOSE_OUT_DESC',
    details: [
      'Complete 3C+V reports — written perfectly, instantly',
      'Condition, Cause, Correction, Validation — all captured',
      'Pre-submission validation catches missing information',
      'Ready for DMS upload, print, or email',
      'Capture final photos and videos for documentation',
      'No wasted time at the keyboard',
    ],
  },
];

const richDescriptions: Record<string, React.ReactNode> = {
  DIAGNOSE_DESC: (
    <span>Describe the symptoms and ONRAMP cross-references TSBs, known failures, and common causes for the specific vehicle. No more guessing — get to <strong className="text-white">root cause in record time</strong>.</span>
  ),
  PREPARE_DESC: (
    <span>ONRAMP organizes every step, warns about specialty tools, and builds the parts list before a single bolt is touched. <strong className="text-white">No mid-job surprises.</strong></span>
  ),
  REPAIR_DESC: (
    <span>Step-by-step voice guidance throughout the repair. Ask for torque specs, clarify a step, or report findings — all hands-free. ONRAMP tracks progress in real time. Technicians work with greater <strong className="text-white">speed and accuracy</strong> on every job.</span>
  ),
  CLOSE_OUT_DESC: (
    <span>When the job is done, ONRAMP compiles everything into a warranty-ready RO report. Condition, Cause, Correction — structured automatically from the voice conversation. Complete, consistent documentation drives <strong className="text-white">higher warranty approval rates</strong> the first time.</span>
  ),
};

export default function Hero() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20 overflow-hidden"
    >
      {/* Fixed background image — doesn't resize when content expands */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(/Busy-Shop-aisle.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '70% 50%',
        }}
      />
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/15 rounded-full blur-[128px]" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full mx-auto text-center">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-12 md:mt-16 mb-6 leading-tight"
        >
          Voice-AI for<br className="md:hidden" />{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-500">
            Auto Technicians
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-carbon-200 mb-12 max-w-3xl mx-auto"
        >
          ONRAMP is the hands-free, <span className="text-white font-bold">AI voice agent</span> helping technicians flag more hours.
          Our AI helps techs diagnose faster, execute complex procedures flawlessly,
          and generate perfect RO reports instantly.
        </motion.p>

        {/* Phase Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-6"
          onMouseLeave={() => {
            if (window.matchMedia('(hover: hover)').matches) setActivePhase(null);
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {phases.map((phase, index) => {
              const isActive = activePhase === index;
              return (
                <motion.div
                  key={phase.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => {
                    // Only use hover on devices with a mouse (not touch)
                    if (window.matchMedia('(hover: hover)').matches) setActivePhase(index);
                  }}
                  onClick={() => setActivePhase(isActive ? null : index)}
                  className={`relative p-4 md:p-5 rounded-2xl ${phase.bgColor} border-2 backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                    isActive ? `${phase.borderActive}` : phase.borderColor
                  }`}
                  style={isActive ? { boxShadow: `0 0 20px ${phase.glowColor}` } : {}}
                >
                  <div className={`inline-flex p-2.5 rounded-xl ${phase.bgColor} mb-3`}>
                    <phase.icon className={`w-5 h-5 ${phase.color}`} />
                  </div>
                  <h3 className={`text-sm md:text-base font-bold ${phase.color} mb-1.5 tracking-wider`}>
                    {phase.label}
                  </h3>
                  <p className="text-carbon-200 text-xs md:text-sm">{phase.description}</p>

                  {/* Connection Line */}
                  {index < phases.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-carbon-600 to-carbon-700" />
                  )}

                  {/* Active indicator arrow — desktop only */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 z-20"
                      style={{
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: `8px solid ${phase.glowColor.replace('0.35', '0.8')}`,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Expanded Detail Panel */}
          <AnimatePresence>
            {activePhase !== null && (
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-4 p-5 md:p-6 rounded-2xl bg-carbon-900/90 border-2 ${phases[activePhase].borderActive} backdrop-blur-sm text-left`}
                  style={{ boxShadow: `0 0 20px ${phases[activePhase].glowColor}` }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`p-2 rounded-lg ${phases[activePhase].bgColor}`}>
                      {(() => { const Icon = phases[activePhase].icon; return <Icon className={`w-4 h-4 ${phases[activePhase].color}`} />; })()}
                    </div>
                    <h4 className={`font-bold text-lg tracking-wider ${phases[activePhase].color}`}>{phases[activePhase].label}</h4>
                  </div>
                  <p className="text-carbon-200 text-sm md:text-base mb-4">
                    {richDescriptions[phases[activePhase].detailDescription] || phases[activePhase].detailDescription}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {phases[activePhase].details.map((detail) => (
                      <div key={detail} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${phases[activePhase].checkColor}`} />
                        <span className="text-carbon-200 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile hint — only visible when no phase is active */}
        {activePhase === null && (
          <p className="md:hidden text-carbon-200 text-xs mt-2 mb-4">Tap each phase to learn more</p>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6"
        >
          <Link
            to="/how-it-works"
            className="px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric flex items-center gap-2"
          >
            See How It Works
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-carbon-300 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-electric-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
