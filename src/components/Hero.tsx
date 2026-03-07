import { motion } from 'framer-motion';
import { Mic, Wrench, FileCheck, ChevronDown } from 'lucide-react';

const phases = [
  {
    icon: Wrench,
    label: 'PREPARE',
    description: 'Pull specs, diagrams & TSBs',
    color: 'text-electric-400',
    bgColor: 'bg-electric-500/10',
    borderColor: 'border-electric-500/30',
  },
  {
    icon: Mic,
    label: 'PERFORM',
    description: 'Voice-guided diagnostics',
    color: 'text-safety-400',
    bgColor: 'bg-safety-500/10',
    borderColor: 'border-safety-500/30',
  },
  {
    icon: FileCheck,
    label: 'WRAP-UP',
    description: 'Auto-generate RO reports',
    color: 'text-electric-400',
    bgColor: 'bg-electric-500/10',
    borderColor: 'border-electric-500/30',
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
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-800/80 border border-carbon-600/50 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
          <span className="text-sm text-carbon-200">Powered by Gemini AI</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Your Voice.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
            Your Shop.
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
            Zero Paperwork.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-carbon-300 mb-12 max-w-3xl mx-auto"
        >
          OnRamp is the voice-first AI assistant that keeps technicians at the vehicle—
          not the service terminal. Speak your repairs into existence.
        </motion.p>

        {/* Phase Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {phases.map((phase, index) => (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative p-6 rounded-2xl ${phase.bgColor} border ${phase.borderColor} backdrop-blur-sm`}
            >
              <div className={`inline-flex p-3 rounded-xl ${phase.bgColor} mb-4`}>
                <phase.icon className={`w-6 h-6 ${phase.color}`} />
              </div>
              <h3 className={`text-lg font-bold ${phase.color} mb-2 tracking-wider`}>
                {phase.label}
              </h3>
              <p className="text-carbon-300 text-sm">{phase.description}</p>

              {/* Connection Line */}
              {index < phases.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-carbon-600 to-carbon-700" />
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
