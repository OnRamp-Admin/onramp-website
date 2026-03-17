import { motion } from 'framer-motion';
import { Wrench, FileCheck, ChevronDown, Search, List } from 'lucide-react';

const phases = [
  {
    icon: Search,
    label: 'DIAGNOSE',
    description: 'Pinpoint the problem with AI',
    color: 'text-electric-400',
    bgColor: 'bg-electric-500/10',
    borderColor: 'border-electric-500/30',
  },
  {
    icon: List,
    label: 'PREPARE',
    description: 'AI Procedural Briefing',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    icon: Wrench,
    label: 'REPAIR',
    description: 'AI Voice-Guided Repairs',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    icon: FileCheck,
    label: 'CLOSE OUT',
    description: 'AI-Generated RO Reports',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20 carbon-fiber-bg overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/15 rounded-full blur-[128px]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-12 md:mt-16 mb-6 leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
            Wasted Time at the Terminal...
          </span>
          <br />
          <span className="text-4xl md:text-6xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
            Terminated.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-carbon-300 mb-12 max-w-3xl mx-auto"
        >
          OnRamp is the first hands-free, <span className="text-white font-bold">AI voice assistant</span> helping technicians flag more hours.
          Our AI helps you diagnose faster, execute complex procedures flawlessly,
          and generate perfect RO reports instantly.
        </motion.p>

        {/* Phase Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12"
        >
          {phases.map((phase, index) => (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative p-4 md:p-5 rounded-2xl ${phase.bgColor} border ${phase.borderColor} backdrop-blur-sm`}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${phase.bgColor} mb-3`}>
                <phase.icon className={`w-5 h-5 ${phase.color}`} />
              </div>
              <h3 className={`text-sm md:text-base font-bold ${phase.color} mb-1.5 tracking-wider`}>
                {phase.label}
              </h3>
              <p className="text-carbon-300 text-xs md:text-sm">{phase.description}</p>

              {/* Connection Line */}
              {index < phases.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-carbon-600 to-carbon-700" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#roi-calculator"
            className="group px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric flex items-center gap-2"
          >
            Calculate Your Shop's ROI
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </a>
          <a
            href="#workflow"
            className="px-8 py-4 bg-carbon-800/50 hover:bg-carbon-700/50 text-carbon-100 font-semibold rounded-xl border border-carbon-600/50 hover:border-carbon-500/50 transition-all duration-300"
          >
            See How It Works
          </a>
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
          className="w-6 h-10 rounded-full border-2 border-carbon-500 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-electric-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
