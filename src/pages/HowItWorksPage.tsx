import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Mic, Brain, FileText, Volume2, ArrowRight, Car, Clipboard,
  CheckCircle2, Wrench, FileCheck, Radio, Smartphone, CircleDot, Search,
} from 'lucide-react';
import QuickStartDemo from '../components/QuickStartDemo';

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
    label: 'AI Processing',
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

const phases = [
  {
    name: 'DIAGNOSE',
    icon: Search,
    color: 'electric',
    title: 'Pinpoint the Problem',
    description: 'Describe the symptoms and OnRamp helps you work through a structured diagnostic process. The AI cross-references TSBs, known failures, and common causes for your specific vehicle — narrowing the problem before you start tearing anything apart.',
    details: [
      'Symptom-driven diagnostic flow guided by AI',
      'Cross-references TSBs and known failures for your vehicle',
      'Builds a diagnostic scratchpad as you test and observe',
      'Confirms root cause before moving to repair',
    ],
  },
  {
    name: 'PREPARE',
    icon: Wrench,
    color: 'amber',
    title: 'Pull Specs & Plan the Job',
    description: 'OnRamp reads the repair order, identifies the vehicle, and pre-loads relevant TSBs, wiring diagrams, torque specs, and fluid capacities. The AI briefs you on the job before you touch a tool.',
    details: [
      'Automatic VIN decode and vehicle identification',
      'Pre-loaded TSBs and known issues for your vehicle',
      'Torque specs, fluid capacities, and part numbers ready',
      'Step-by-step procedure from OEM service manuals',
    ],
  },
  {
    name: 'REPAIR',
    icon: Mic,
    color: 'green',
    title: 'Voice-Guided Repairs',
    description: 'Work with your hands while OnRamp coaches you through each step. Ask questions, report findings, and document your work—all by voice. The AI tracks your progress and adjusts guidance in real-time.',
    details: [
      'Hands-free voice interaction via Flic button',
      'Real-time spec lookups mid-repair',
      'Step-by-step progress tracking',
      'Automatic note-taking from your narration',
    ],
  },
  {
    name: 'CLOSE OUT',
    icon: FileCheck,
    color: 'orange',
    title: 'Auto-Generate Documentation',
    description: 'When the job is done, OnRamp compiles everything you said into a professional, warranty-ready RO report. Cause, Correction, Concern—structured automatically from your natural speech.',
    details: [
      'Complete 3C documentation from voice notes',
      'OEM-matched labor codes and operations',
      'Pre-submission validation catches missing fields',
      'Ready for DMS upload or print',
    ],
  },
];

const hardware = [
  {
    icon: CircleDot,
    name: 'Flic Button',
    description: 'A wireless Bluetooth button that clips to your shirt or mounts on the bay wall. Single press to talk, double press to advance steps. No phone needed once the session is running.',
  },
  {
    icon: Smartphone,
    name: 'iPhone App',
    description: 'The OnRamp iOS app runs on any iPhone. It connects to the Flic button, streams audio to the AI, and plays back voice responses through your phone speaker or Bluetooth earpiece.',
  },
  {
    icon: Radio,
    name: 'Any Bluetooth Audio',
    description: 'Use your existing Bluetooth earbuds, headset, or shop speaker. OnRamp works with whatever audio setup you already have—no proprietary hardware required.',
  },
];

export default function HowItWorksPage() {
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
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 font-black tracking-tight">
              ONRAMP
            </span>{' '}
            Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-carbon-300 max-w-3xl mx-auto"
          >
            A voice-first AI assistant that rides along on every repair.
            Here's what happens from the moment you start a job.
          </motion.p>
        </div>
      </section>

      {/* The Voice Loop */}
      <section className="py-20 px-4 bg-carbon-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">The Voice Loop</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Work Hands-Free.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">Document Everything.</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              OnRamp listens, understands context, and writes your repair orders while you work. No typing. No terminal trips.
            </p>
          </motion.div>

          {/* Step Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => { setActiveStep(index); setIsPlaying(false); }}
                className={`relative cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-carbon-800/80 border-electric-500/50 glow-electric'
                    : 'bg-carbon-800/40 border-carbon-700/50 hover:border-carbon-600/50'
                }`}
              >
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                  activeStep === index ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/50' : 'bg-carbon-700 text-carbon-300'
                }`}>
                  {index + 1}
                </div>
                <div className={`inline-flex p-3 rounded-xl mb-4 ${activeStep === index ? 'bg-electric-500/20 text-electric-400' : 'bg-carbon-700/50 text-carbon-400'}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold mb-2">{step.label}</h3>
                <p className="text-carbon-400 text-sm mb-4">{step.description}</p>
                <div className={`p-3 rounded-lg text-xs font-mono ${activeStep === index ? 'bg-carbon-900/80 text-electric-300 border border-electric-500/20' : 'bg-carbon-900/50 text-carbon-500'}`}>
                  {step.example}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Preview */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-carbon-800/80 to-carbon-900/80 border border-carbon-700/50">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 rounded-2xl bg-carbon-950 border border-carbon-700 p-4">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-carbon-700 rounded-full" />
                  <div className="h-full flex flex-col items-center justify-center">
                    <motion.div animate={isPlaying ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }} className="w-16 h-16 rounded-full bg-electric-500/20 flex items-center justify-center mb-3">
                      <Mic className="w-8 h-8 text-electric-400" />
                    </motion.div>
                    <span className="text-electric-400 text-xs font-semibold">LISTENING</span>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.div key={i} animate={isPlaying ? { scaleY: [1, 2, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-1 h-3 bg-electric-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <Clipboard className="w-5 h-5 text-safety-400" />
                  <span className="text-safety-400 font-semibold">Live RO Preview</span>
                  <span className="ml-auto text-carbon-500 text-sm">Auto-generating...</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-carbon-900/50 border border-carbon-700/30">
                    <Car className="w-5 h-5 text-carbon-500" />
                    <span className="text-carbon-300">2019 Honda Accord</span>
                  </div>
                  <div className="p-4 rounded-lg bg-carbon-900/80 border border-electric-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Battery Cable B+ End Replacement</p>
                        <p className="text-carbon-400 text-sm">Corroded terminal causing intermittent no-start</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-carbon-400">Parts: <span className="text-electric-300">$12.50</span></span>
                      <span className="text-carbon-400">Labor: <span className="text-electric-300">0.4 hr</span></span>
                      <span className="text-carbon-400">Code: <span className="text-safety-300">B0001</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2"
            >
              <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">Quick Start</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
                15 Seconds to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">Start a Repair.</span>
              </h2>
              <p className="text-carbon-300 text-lg leading-relaxed">
                Enter the repair order, snap the VIN, and launch the Diagnose Voice Session. You're hands-free from here.
              </p>
            </motion.div>

            {/* Animated Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-electric-500/20 rounded-full blur-[80px] scale-75 opacity-50" />
                <div className="relative">
                  <QuickStartDemo />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three Phases */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Four Phases.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">One Seamless Flow.</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              OnRamp adapts its behavior as you move through each phase of the repair—from diagnosis to close out.
            </p>
          </motion.div>

          <div className="space-y-8">
            {phases.map((phase, index) => {
              const colorMap: Record<string, { badge: string; icon: string; check: string; border: string }> = {
                electric: { badge: 'bg-electric-500/10 text-electric-400 border-electric-500/30', icon: 'bg-electric-500/10 text-electric-400', check: 'text-electric-400', border: 'border-electric-500/30' },
                amber: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: 'bg-amber-500/10 text-amber-400', check: 'text-amber-400', border: 'border-amber-500/30' },
                green: { badge: 'bg-green-500/10 text-green-400 border-green-500/30', icon: 'bg-green-500/10 text-green-400', check: 'text-green-400', border: 'border-green-500/30' },
                orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: 'bg-orange-500/10 text-orange-400', check: 'text-orange-400', border: 'border-orange-500/30' },
              };
              const colors = colorMap[phase.color];

              return (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-8 md:p-10 rounded-2xl bg-carbon-800/50 border ${colors.border}`}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold tracking-wider mb-4 ${colors.badge}`}>
                        <phase.icon className="w-4 h-4" />
                        {phase.name}
                      </div>
                      <h3 className="text-white font-bold text-2xl mb-4">{phase.title}</h3>
                      <p className="text-carbon-300 text-lg">{phase.description}</p>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        {phase.details.map((detail) => (
                          <div key={detail} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.check}`} />
                            <span className="text-carbon-200">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              What You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">Need</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              OnRamp runs on hardware you probably already own. The Flic button is the only new piece—and it comes free in the Starter Pack.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {hardware.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50"
              >
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{item.name}</h3>
                <p className="text-carbon-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to try it?</h2>
            <p className="text-carbon-300 text-lg mb-8">
              The Starter Pack gets you everything you need—Flic button and 3 months of Pro access—for $99.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/technicians" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric">
                I'm a Technician
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/managers" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety">
                I'm a Service Manager
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
