import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, Brain, FileText, Volume2, ArrowRight, Car, Clipboard,
  CheckCircle2, Wrench, FileCheck, Radio, Smartphone, CircleDot, Search,
  Play, Pause, AlertCircle, ListChecks,
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
    title: 'Pinpoint the Problem — AI FAST!',
    description: 'Describe the symptoms and OnRamp helps you work through a structured diagnostic process. The AI cross-references TSBs, known failures, and common causes for your specific vehicle — narrowing the problem before you start tearing anything apart.',
    details: [
      'Symptom-driven diagnostic flow guided by AI',
      "References TSBs ('95 - Today) & known failures",
      'Builds thorough diagnostic notes as technician tests',
      'Gets to the root cause in record time!',
    ],
    audio: '/audio/diagnose-audio-sample.wav',
  },
  {
    name: 'PREPARE',
    icon: ListChecks,
    color: 'amber',
    title: 'Prepare to Perform.',
    description: "OnRamp's AI organizes all the complex details of the job and briefs tech's so they can kill the clock. Never again get caught off guard by speciality tools, or replacement parts mid-job.",
    details: [
      'Ingests OEM procedure documents for complex jobs',
      'OR... generates procedure in many simpler cases',
      'Extracts and summarizes project warnings and technical notes',
      'Isolates tools and replacement parts lists',
      'Technician reviews all pertinent info with AI before steps',
    ],
    audio: '/audio/prepare-audio-sample.wav',
  },
  {
    name: 'REPAIR',
    icon: Wrench,
    color: 'green',
    title: 'Voice-Guided Repairs',
    description: 'Work with your hands while OnRamp coaches you through each step. Ask questions, report findings, and document your work—all by voice. The AI tracks your progress and adjusts guidance in real-time.',
    details: [
      "Step details, torque specs and 'heads-up' guidance in your ears when you need it!",
      'Hands-free voice — Start/Stop with smart button',
      'OnRamp tracks progress and keeps perfect notes',
      'AI can open PDFs to the exact page/diagram you need',
      'No more time-wasting trips to the terminal!',
    ],
    audio: '/audio/perform-audio-sample.wav',
  },
  {
    name: 'CLOSE OUT',
    icon: FileCheck,
    color: 'orange',
    title: 'AI-Generated RO Reports — Instantly.',
    description: 'When the job is done, OnRamp compiles everything you said and did into a perfect, professional, warranty-worthy RO report. Complaint, Cause, Correction and Validation — structured automatically from your natural speech.',
    details: [
      'Complete 3C+V reports — written perfectly, instantly',
      'Pre-submission validation catches missing fields',
      'Ready for DMS upload or print',
      'No wasted time at the terminal!',
    ],
    audio: '/audio/Close-Out-Audio-SAmple.wav',
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

// Shared audio ref so only one sample plays at a time
let currentAudio: HTMLAudioElement | null = null;
// Listeners that get called when currentAudio changes (so other instances can reset)
const audioChangeListeners = new Set<() => void>();

function useAudioPlayer(src: string) {
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  // Listen for other instances taking over playback
  useEffect(() => {
    const onAudioChange = () => {
      if (currentAudio !== audioRef.current && state === 'playing') {
        setState('idle');
        setProgress(0);
        stopTracking();
      }
    };
    audioChangeListeners.add(onAudioChange);
    return () => { audioChangeListeners.delete(onAudioChange); };
  }, [state, stopTracking]);

  const toggle = useCallback(() => {
    if (state === 'error') return;

    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause();
      setState('idle');
      stopTracking();
      currentAudio = null;
      return;
    }

    // Stop any other playing audio
    if (currentAudio && currentAudio !== audioRef.current) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      // Notify other instances
      audioChangeListeners.forEach(fn => fn());
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.addEventListener('ended', () => {
          setState('idle');
          setProgress(0);
          stopTracking();
          currentAudio = null;
        });
        audioRef.current.addEventListener('error', () => {
          setState('error');
          stopTracking();
        });
      }

      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.then(() => {
          setState('playing');
          currentAudio = audioRef.current;
          audioChangeListeners.forEach(fn => fn());
          rafRef.current = requestAnimationFrame(updateProgress);
        }).catch(() => {
          setState('error');
        });
      }
    } catch {
      setState('error');
    }
  }, [state, src, updateProgress, stopTracking]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (currentAudio === audioRef.current) currentAudio = null;
      }
      stopTracking();
    };
  }, [stopTracking]);

  return { state, progress, toggle };
}

function AudioSamplePlayer({ accentColor, state, progress, toggle }: {
  accentColor: string;
  state: 'idle' | 'playing' | 'error';
  progress: number;
  toggle: () => void;
}) {
  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 mt-6 p-3 rounded-lg bg-carbon-800/60 border border-carbon-700/50">
        <AlertCircle className="w-4 h-4 text-carbon-400 flex-shrink-0" />
        <span className="text-carbon-400 text-sm">
          Your browser doesn't support audio playback.{' '}
          <a href="/contact" className="underline hover:text-white transition-colors">Request a live demo</a> instead!
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      className="group flex items-center gap-3 mt-6 px-4 py-2.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        backgroundColor: state === 'playing' ? `${accentColor}15` : 'transparent',
        borderColor: state === 'playing' ? `${accentColor}50` : '#3A3A38',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 32,
          height: 32,
          backgroundColor: state === 'playing' ? `${accentColor}25` : `${accentColor}15`,
        }}
      >
        {state === 'playing' ? (
          <Pause size={14} style={{ color: accentColor }} />
        ) : (
          <Play size={14} style={{ color: accentColor, marginLeft: '2px' }} />
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-medium text-carbon-200">
          {state === 'playing' ? 'Playing sample...' : 'Hear an example conversation'}
        </span>
        <div className="w-32 h-1 rounded-full bg-carbon-700/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </button>
  );
}

function PhonePlayButton({ accentColor, state, progress, toggle }: {
  accentColor: string;
  state: 'idle' | 'playing' | 'error';
  progress: number;
  toggle: () => void;
}) {
  if (state === 'error') return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      className="flex flex-col items-center gap-2 group"
    >
      {/* Play/Pause circle — 20% bigger (44→53) */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 53,
          height: 53,
          backgroundColor: state === 'playing' ? `${accentColor}30` : `${accentColor}20`,
          border: `2px solid ${accentColor}`,
        }}
      >
        {state === 'playing' ? (
          <Pause size={22} style={{ color: accentColor }} />
        ) : (
          <Play size={22} style={{ color: accentColor, marginLeft: '2px' }} />
        )}
      </motion.div>
      {/* Label — doubled (9→18px) */}
      <span style={{
        color: state === 'playing' ? accentColor : '#888',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
      }}>
        {state === 'playing' ? 'PLAYING' : 'SAMPLE'}
      </span>
      {/* Progress bar — much wider */}
      <div
        className="overflow-hidden rounded-full"
        style={{
          width: '80%',
          minWidth: 120,
          height: 4,
          backgroundColor: state === 'playing' ? `${accentColor}20` : '#333',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </button>
  );
}

const colorMap: Record<string, { badge: string; check: string; border: string; phoneBg: string; phoneAccent: string }> = {
  electric: { badge: 'bg-electric-500/10 text-electric-400 border-electric-500/30', check: 'text-electric-400', border: 'border-electric-500/30', phoneBg: 'bg-electric-500/20', phoneAccent: '#4A90D9' },
  amber: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', check: 'text-yellow-400', border: 'border-yellow-500/30', phoneBg: 'bg-yellow-500/20', phoneAccent: '#EAB308' },
  green: { badge: 'bg-green-500/10 text-green-400 border-green-500/30', check: 'text-green-400', border: 'border-green-500/30', phoneBg: 'bg-green-500/20', phoneAccent: '#22C55E' },
  orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', check: 'text-orange-400', border: 'border-orange-500/30', phoneBg: 'bg-orange-500/20', phoneAccent: '#F97316' },
};

function PhaseSection({ phase, index }: { phase: typeof phases[number]; index: number }) {
  const colors = colorMap[phase.color];
  const textOnRight = index % 2 === 1 || index === 3;
  const { state, progress, toggle } = useAudioPlayer(phase.audio);

  return (
    <div
      className={`flex flex-col ${textOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-16`}
    >
      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, x: textOnRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2"
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold tracking-wider mb-4 ${colors.badge}`}>
          <phase.icon className="w-4 h-4" />
          {phase.name}
        </div>
        <h3 className="text-white font-bold text-2xl md:text-3xl mb-4">{phase.title}</h3>
        <p className="text-carbon-300 text-lg mb-6">{phase.description}</p>
        <div className="space-y-3">
          {phase.details.map((detail) => (
            <div key={detail} className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.check}`} />
              <span className="text-carbon-200">{detail}</span>
            </div>
          ))}
        </div>
        <AudioSamplePlayer accentColor={colors.phoneAccent} state={state} progress={progress} toggle={toggle} />
      </motion.div>

      {/* Phone mockup with play button */}
      <motion.div
        initial={{ opacity: 0, x: textOnRight ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full lg:w-1/2 flex justify-center"
      >
        <div className="relative mx-auto w-[220px] md:w-[260px]">
          <div className={`absolute inset-0 ${colors.phoneBg} rounded-full blur-[80px] scale-75 opacity-50`} />
          {/* Screen content inside frame — z-20 so it's clickable above the frame image */}
          <div
            className="absolute overflow-hidden z-20 flex flex-col"
            style={{
              left: '5.5%',
              right: '5.5%',
              top: '3%',
              bottom: '3%',
              borderRadius: '2rem',
              backgroundColor: '#141410',
            }}
          >
            {/* Top third: icon + phase name */}
            <div className="flex flex-col items-center justify-center" style={{ flex: '1 1 0%', paddingTop: '25%' }}>
              <phase.icon className="w-12 h-12 mb-3" style={{ color: colors.phoneAccent }} />
              <span style={{
                color: colors.phoneAccent,
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.08em',
              }}>
                {phase.name}
              </span>
            </div>

            {/* Bottom third: play button + "Listen" */}
            <div className="flex flex-col items-center justify-center" style={{ flex: '1 1 0%', paddingBottom: '15%' }}>
              <PhonePlayButton
                accentColor={colors.phoneAccent}
                state={state}
                progress={progress}
                toggle={toggle}
              />
            </div>
          </div>
          {/* Frame image — pointer-events-none so clicks pass through to screen content */}
          <img
            src="/apple-iphone-17-pro-max-2025-medium.png"
            alt=""
            className="relative z-10 w-full h-auto drop-shadow-2xl pointer-events-none"
          />
        </div>
      </motion.div>
    </div>
  );
}

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
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">Quick Start</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-8 leading-tight">
                15 Seconds to<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">Start a Repair.</span>
              </h2>

              <ol className="space-y-4 text-left max-w-lg mx-auto lg:mx-0 mb-8">
                {[
                  { num: '1', text: 'Enter the RO Number' },
                  { num: '2', text: 'Snap the VIN' },
                  { num: '3', text: 'Launch the Voice Session' },
                ].map((step, i) => (
                  <motion.li
                    key={step.num}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-electric-500/15 border border-electric-500/30 flex items-center justify-center">
                      <span className="text-electric-400 text-sm font-bold">{step.num}</span>
                    </div>
                    <span className="text-carbon-200 text-lg">{step.text}</span>
                  </motion.li>
                ))}
              </ol>

              {/* "Put your headphones on" + accessories row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 max-w-lg mx-auto lg:mx-0"
              >
                <div className="leading-relaxed flex-shrink-0">
                  <span className="text-carbon-300 text-lg">Put on your headphones<br className="hidden lg:block" /> and Smart Button!</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 font-semibold text-xl md:text-2xl">
                    ...you're hands-free from here!
                  </span>
                </div>
                {/* Flic + AirPods centered together */}
                <div className="flex items-center gap-1 lg:translate-x-8">
                  <img
                    src="/flic-button.png"
                    alt="Flic Smart Button"
                    className="w-22 md:w-28 h-auto drop-shadow-xl"
                  />
                  <img
                    src="/airpods.png"
                    alt="AirPods"
                    className="w-32 md:w-40 h-auto drop-shadow-xl"
                  />
                </div>
              </motion.div>
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

      {/* Four Phases */}
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

          <div className="space-y-20 md:space-y-28">
            {phases.map((phase, index) => (
              <PhaseSection key={phase.name} phase={phase} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* The Voice Loop */}
      <section className="py-20 px-4 bg-carbon-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              No More Typing. Just Tap-to-Talk.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 mt-2 inline-block">ONRAMP Documents Everything.</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-3xl mx-auto">
              OnRamp listens, understands context, and writes your repair orders while you work.<br className="hidden md:block" /> No typing. No terminal trips.
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
