import { motion } from 'framer-motion';
import { Mic, Brain, FileText, ArrowRight, Volume2, Car, Clipboard, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const workflowSteps = [
  {
    id: 'input',
    icon: Mic,
    label: 'Voice Input',
    description: 'Speak conversationally with the AI while you work — your AI wingman helps you get the job done.',
  },
  {
    id: 'process',
    icon: Brain,
    label: 'Purpose-Built AI Processing',
    description: 'Hyper-focused, automotive-trained, real-time understanding and context awareness. Rapidly processes diagnosis and procedural information.',
  },
  {
    id: 'output',
    icon: Volume2,
    label: 'AI Voice Response',
    description: 'The AI generates natural, conversational dialogue back directly into the technician\'s headphones so they can continue to work hands-free.',
  },
  {
    id: 'document',
    icon: FileText,
    label: 'Auto Documentation',
    description: 'The AI collects notes from the diagnosis and repair phases to document everything relevant, then automatically generates pertinent reports.',
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
            ONRAMP listens, understands context, and writes your repair orders while you work.
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
                    className={`p-6 rounded-2xl border transition-all duration-300 h-full ${
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
                          : 'bg-carbon-700/50 text-carbon-300 group-hover:text-electric-400'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-white font-semibold mb-2">{step.label}</h3>
                    <p className="text-carbon-300 text-sm">{step.description}</p>
                  </div>

                  {/* Arrow */}
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight
                      className={`absolute top-1/2 -right-5 w-4 h-4 transition-colors duration-300 ${
                        activeStep === index ? 'text-electric-400' : 'text-carbon-300'
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
                      : 'bg-carbon-700 text-carbon-300'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.label}</h3>
                  <p className="text-carbon-300 text-sm">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
