import { motion } from 'framer-motion';
import { Mic, Brain, FileText, ArrowRight, Volume2, Car, Clipboard, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const workflowSteps = [
  {
    id: 'input',
    icon: Mic,
    label: 'Voice Input',
    description: 'Speak naturally while working under the hood',
    example: '"Found corroded battery terminal, replacing cable end..."',
  },
  {
    id: 'process',
    icon: Brain,
    label: 'Gemini AI Processing',
    description: 'Real-time understanding & context awareness',
    example: 'Parsing repair data, pulling specs, matching labor codes...',
  },
  {
    id: 'output',
    icon: Volume2,
    label: 'Voice Response',
    description: 'Instant answers without leaving the bay',
    example: '"Battery cable torque spec is 8 ft-lbs. Labor time: 0.4 hours."',
  },
  {
    id: 'document',
    icon: FileText,
    label: 'Auto Documentation',
    description: 'RO lines generated in real-time',
    example: 'B+ Cable End Replacement - Parts: $12.50, Labor: 0.4hr',
  },
];

export default function WorkflowVisualization() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section id="workflow" className="relative py-24 px-4 bg-carbon-900/50">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
            The Voice Loop
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
            Work Hands-Free.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              Document Everything.
            </span>
          </h2>
          <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
            OnRamp listens, understands context, and writes your repair orders while you work.
            No typing. No terminal trips. Just turn wrenches and talk.
          </p>
        </motion.div>
      </div>

      {/* Interactive Workflow Diagram */}
      <div className="max-w-5xl mx-auto">
        {/* Desktop Flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1aa0ff" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#ff971a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#1aa0ff" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <line
                x1="12.5%"
                y1="80"
                x2="87.5%"
                y2="80"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
            </svg>

            {/* Step Cards */}
            <div className="relative grid grid-cols-4 gap-6">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => {
                    setActiveStep(index);
                    setIsPlaying(false);
                  }}
                  className={`relative cursor-pointer group`}
                >
                  {/* Step Number */}
                  <div
                    className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${
                      activeStep === index
                        ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/50'
                        : 'bg-carbon-700 text-carbon-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Card */}
                  <div
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      activeStep === index
                        ? 'bg-carbon-800/80 border-electric-500/50 glow-electric'
                        : 'bg-carbon-800/40 border-carbon-700/50 hover:border-carbon-600/50'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`inline-flex p-3 rounded-xl mb-4 transition-colors duration-300 ${
                        activeStep === index
                          ? 'bg-electric-500/20 text-electric-400'
                          : 'bg-carbon-700/50 text-carbon-400 group-hover:text-electric-400'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-white font-semibold mb-2">{step.label}</h3>
                    <p className="text-carbon-400 text-sm mb-4">{step.description}</p>

                    {/* Example */}
                    <div
                      className={`p-3 rounded-lg text-xs font-mono transition-all duration-300 ${
                        activeStep === index
                          ? 'bg-carbon-900/80 text-electric-300 border border-electric-500/20'
                          : 'bg-carbon-900/50 text-carbon-500'
                      }`}
                    >
                      {step.example}
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight
                      className={`absolute top-1/2 -right-5 w-4 h-4 transition-colors duration-300 ${
                        activeStep === index ? 'text-electric-400' : 'text-carbon-600'
                      }`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="lg:hidden space-y-4">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => {
                setActiveStep(index);
                setIsPlaying(false);
              }}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                activeStep === index
                  ? 'bg-carbon-800/80 border-electric-500/50'
                  : 'bg-carbon-800/40 border-carbon-700/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep === index
                      ? 'bg-electric-500 text-white'
                      : 'bg-carbon-700 text-carbon-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.label}</h3>
                  <p className="text-carbon-400 text-sm mb-3">{step.description}</p>
                  <div className="p-2 rounded bg-carbon-900/50 text-xs font-mono text-carbon-500">
                    {step.example}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-carbon-800/80 to-carbon-900/80 border border-carbon-700/50"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            {/* Mock Device */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-2xl bg-carbon-950 border border-carbon-700 p-4">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-carbon-700 rounded-full" />
                <div className="h-full flex flex-col items-center justify-center">
                  <motion.div
                    animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-electric-500/20 flex items-center justify-center mb-3"
                  >
                    <Mic className="w-8 h-8 text-electric-400" />
                  </motion.div>
                  <span className="text-electric-400 text-xs font-semibold">LISTENING</span>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? { scaleY: [1, 2, 1] } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="w-1 h-3 bg-electric-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live RO Preview */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-4">
                <Clipboard className="w-5 h-5 text-safety-400" />
                <span className="text-safety-400 font-semibold">Live RO Preview</span>
                <span className="ml-auto text-carbon-500 text-sm">Auto-generating...</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-carbon-900/50 border border-carbon-700/30">
                  <Car className="w-5 h-5 text-carbon-500" />
                  <span className="text-carbon-300">2019 Honda Accord • VIN: ...7842</span>
                </div>
                <div className="p-4 rounded-lg bg-carbon-900/80 border border-electric-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Battery Cable B+ End Replacement</p>
                      <p className="text-carbon-400 text-sm">
                        Corroded terminal causing intermittent no-start condition
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-carbon-400">
                      Parts: <span className="text-electric-300">$12.50</span>
                    </span>
                    <span className="text-carbon-400">
                      Labor: <span className="text-electric-300">0.4 hr</span>
                    </span>
                    <span className="text-carbon-400">
                      Code: <span className="text-safety-300">B0001</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
