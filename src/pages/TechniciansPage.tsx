import { motion, useInView, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Zap, Wrench, DollarSign, TrendingUp,
  ArrowRight, Calculator, Search, ListChecks, FileCheck,
  CircleDot, Timer, Camera, Volume2, Brain,
  Smartphone, Radio, Rocket, UserCog,
} from 'lucide-react';
import { trackCalculatorValues } from '../lib/analytics';

// Technician ROI constants
const FLAT_RATE_DEFAULT = 35;
const WEEKS_PER_MONTH = 4.33;
const MINUTES_PER_TERMINAL_VISIT = 4;

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const phases = [
  {
    icon: Search,
    name: 'DIAGNOSE',
    color: 'electric',
    tagline: 'Find it faster',
    description:
      'Describe the symptoms and ONRAMP cross-references TSBs, known failures, and common causes for your specific vehicle. No more guessing — get to root cause in record time.',
    details: [
      'Cross-references TSBs and recalls from \'95 to today',
      'Symptom-driven diagnostic flow guided by AI',
      'Leverages deep understanding of complex vehicle systems',
      'Prioritizes most likely causes — get to root cause fast',
      'Documents your diagnostic notes as you test',
      'Works for any make, model, and year',
    ],
  },
  {
    icon: ListChecks,
    name: 'PREPARE',
    color: 'amber',
    tagline: 'Know before you go',
    description:
      'ONRAMP organizes every step, warns you about specialty tools, and builds your parts list before you touch a bolt. No mid-job surprises.',
    details: [
      'Upload OEM procedures or let AI generate them',
      'AI organizes steps into clear, logical groups',
      'Extracts and summarizes warnings and technical notes',
      'Generates a tools list before you start',
      'Builds a replacement parts list',
      'Voice briefing covers everything you need to know',
    ],
  },
  {
    icon: Wrench,
    name: 'REPAIR',
    color: 'green',
    tagline: 'AI in your ear',
    description:
      'Step-by-step voice guidance while you work. Ask for torque specs, clarify a step, or report findings — all hands-free. ONRAMP tracks your progress in real time.',
    details: [
      'Step-by-step voice guidance while you work',
      'Ask for torque specs, fluid capacities, wiring info',
      'Start and stop voice sessions with the Brain Button',
      'AI tracks your progress and keeps perfect notes',
      'Capture photos and videos during the procedure',
      'Open PDFs to the exact page using voice commands',
    ],
  },
  {
    icon: FileCheck,
    name: 'CLOSE OUT',
    color: 'orange',
    tagline: 'Reports write themselves',
    description:
      'When the job is done, ONRAMP compiles everything into a warranty-ready RO report. Complaint, Cause, Correction — structured automatically from your voice.',
    details: [
      'Complete 3C+V reports — written perfectly, instantly',
      'Complaint, Cause, Correction, Validation — all captured during your hands-free workflow',
      'Pre-submission validation catches missing information',
      'Ready for DMS upload, print, or email',
      'Capture final photos and videos',
      'No wasted time at the keyboard',
    ],
  },
];

const phaseColors: Record<string, { text: string; bg: string; border: string; bgHover: string }> = {
  electric: { text: 'text-electric-400', bg: 'bg-electric-500/10', border: 'border-electric-500/30', bgHover: 'bg-electric-500/5' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bgHover: 'bg-amber-500/5' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', bgHover: 'bg-green-500/5' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', bgHover: 'bg-orange-500/5' },
};

const capabilities = [
  {
    icon: Brain,
    title: 'AI Diagnosis',
    description:
      'Describe symptoms and ONRAMP narrows the problem — referencing TSBs, recalls, and known failures for your exact make, model, and year.',
  },
  {
    icon: Volume2,
    title: 'Real-Time Specs & Answers',
    description:
      'Torque specs, fluid capacities, wiring info — delivered by voice while you\'re under the hood. No terminal trips.',
  },
  {
    icon: CircleDot,
    title: 'Brain Button',
    description:
      'A physical Bluetooth button that clips to your shirt. Tap to talk, tap to pause. Glove-friendly, instant response, months of battery life.',
  },
  {
    icon: FileCheck,
    title: 'Instant RO Reports',
    description:
      'ONRAMP writes your repair orders from your voice notes — complete 3C documentation, labor codes, and cause-and-correction narratives.',
  },
  {
    icon: Timer,
    title: 'Built-In Time Tracking',
    description:
      'Clock in when you start, clock out when you\'re done. Track time per job automatically — no separate app or paper log needed.',
  },
  {
    icon: Camera,
    title: 'Photo & Video Capture',
    description:
      'Snap photos or record video during the repair. Documentation is attached to the job and included in the RO report.',
  },
];

const timeWasters = [
  {
    pain: 'Walking to the terminal to look up TSBs',
    solution: 'ONRAMP does this automatically during diagnosis, ordered by relevance',
  },
  {
    pain: 'Scrolling through PDFs for the right step',
    solution: 'Voice-guided step-by-step instructions while you work',
  },
  {
    pain: 'Washing hands to type RO notes',
    solution: 'AI writes your RO reports from everything said during diagnosis and repair',
  },
  {
    pain: 'Checking the PDF for torque specs mid-job',
    solution: '"Hey ONRAMP, what\'s the torque on this?"',
  },
  {
    pain: 'Tracking time on paper or a separate app',
    solution: 'Built-in clock in/out per job',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

// ─── Animated Clock SVG ──────────────────────────────────────────────────────
function AnimatedClock({ minutes }: { minutes: number }) {
  // Rotation degrees from 12 o'clock position
  const minuteRotation = (minutes / 60) * 360;
  const hourRotation = (minutes / 60) * 30;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ maxWidth: 220 }}>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" className="text-carbon-700" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1" className="text-carbon-800" />
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const isMajor = i % 3 === 0;
        const outerR = 82;
        const innerR = isMajor ? 70 : 74;
        return (
          <line
            key={i}
            x1={100 + innerR * Math.cos(angle)}
            y1={100 + innerR * Math.sin(angle)}
            x2={100 + outerR * Math.cos(angle)}
            y2={100 + outerR * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth={isMajor ? 3 : 1.5}
            strokeLinecap="round"
            className={isMajor ? 'text-carbon-300' : 'text-carbon-300'}
          />
        );
      })}
      {/* Hour hand */}
      <g style={{ transform: `rotate(${hourRotation}deg)`, transformOrigin: '100px 100px' }}>
        <line x1="100" y1="108" x2="100" y2="60" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* Minute hand */}
      <g style={{ transform: `rotate(${minuteRotation}deg)`, transformOrigin: '100px 100px' }}>
        <line x1="100" y1="112" x2="100" y2="38" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Center dot */}
      <circle cx="100" cy="100" r="5" className="fill-electric-400" />
      <circle cx="100" cy="100" r="2.5" className="fill-carbon-950" />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="clockHandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Terminate Wasted Time Section ───────────────────────────────────────────

interface TimeSaverPhase {
  name: string;
  color: string;
  items: string[];
}

const timeSaverPhases: TimeSaverPhase[] = [
  {
    name: 'Diagnose',
    color: 'text-electric-400',
    items: [
      'Quickly identify the root cause of the issue',
      'Leverage AI to cross-reference TSBs and known failures',
      'Structured symptom-driven diagnostic flow',
      'No more guessing — AI helps you find the gremlin',
    ],
  },
  {
    name: 'Prepare',
    color: 'text-amber-400',
    items: [
      'Complete parts list with part numbers',
      'Tools list — know exactly what you need before you start',
      'Overview of the full procedure ahead',
      'No more walking to the terminal to read the next page',
    ],
  },
  {
    name: 'Repair',
    color: 'text-green-400',
    items: [
      'Step-by-step voice guidance through the procedure',
      'Torque specs called out when you need them',
      'Tells you which tool you need for each step',
      'Wiring diagrams and schematics on command',
      'No washing your hands to use the computer',
      'No entering your password to log back in',
    ],
  },
  {
    name: 'Close Out',
    color: 'text-safety-400',
    items: [
      'AI writes your 3C+V report automatically',
      'No more writing the RO story from memory',
      'Captures every measurement, note, and finding',
      'Warranty-grade documentation — complete and accurate',
    ],
  },
];

const TOTAL_ANIMATION_MS = 30000; // 30 seconds for all bullets
const RESTART_DELAY_MS = 5000;
// Total items across all phases — time per bullet is TOTAL / count
const ALL_ITEMS_COUNT = timeSaverPhases.reduce((s, p) => s + p.items.length, 0);
const MS_PER_ITEM = TOTAL_ANIMATION_MS / ALL_ITEMS_COUNT;

function TerminateWastedTimeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activePhase, setActivePhase] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [clockMinutes, setClockMinutes] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Reset
    setActivePhase(0);
    setVisibleCount(0);
    setClockMinutes(0);

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    // Each bullet gets equal time. First bullet of each phase appears with the header.
    let globalIdx = 0;
    let elapsed = 0;

    for (let p = 0; p < timeSaverPhases.length; p++) {
      const items = timeSaverPhases[p].items;
      for (let i = 0; i < items.length; i++) {
        const showAt = elapsed;
        const currentGlobal = globalIdx;
        timeouts.push(setTimeout(() => {
          setActivePhase(p);
          setVisibleCount(i + 1);
          setClockMinutes(Math.round(((currentGlobal + 1) / ALL_ITEMS_COUNT) * 60));
        }, showAt));
        globalIdx++;
        elapsed += MS_PER_ITEM;
      }
    }

    // Final: set clock to 60
    timeouts.push(setTimeout(() => {
      setClockMinutes(60);
    }, elapsed));

    // Restart after delay
    timeouts.push(setTimeout(() => {
      setCycle((c) => c + 1);
    }, elapsed + RESTART_DELAY_MS));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isInView, cycle]);

  const currentPhase = timeSaverPhases[activePhase];

  return (
    <section className="py-20 px-4 bg-carbon-900/30" ref={sectionRef}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={mobileViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              Terminate Wasted Time
            </span>
            <span className="block md:inline">{' '}at the Terminal!</span>
          </h2>
          <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
            Every trip away from the bay costs a few minutes! Minutes turn into hours, and hours turn into a bigger paycheck. ONRAMP keeps you <span className="text-white font-bold">ON TASK</span>.
          </p>
        </motion.div>

        <div className="flex flex-col md:grid md:grid-cols-2 items-start gap-10 md:gap-14 max-w-5xl mx-auto">
          {/* Left column: Clock — centered on mobile, pushed toward center on desktop */}
          <div className="flex flex-col items-center gap-4 w-full md:w-auto md:justify-self-end md:pr-4">
            <div className="w-48 h-48 md:w-56 md:h-56 text-carbon-300">
              <AnimatedClock minutes={clockMinutes} />
            </div>
            <div className="text-center">
              <motion.span
                key={`${cycle}-${clockMinutes}`}
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 inline-block"
              >
                {clockMinutes} min
              </motion.span>
              <p className="text-carbon-300 text-sm mt-1">saved per day</p>
            </div>
          </div>

          {/* Right column: One phase at a time, left edge at page center */}
          <div className="w-full min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${cycle}-phase-${activePhase}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className={`text-xl font-bold mb-4 ${currentPhase.color}`}>
                  {currentPhase.name}
                </h3>
                <div className="space-y-2.5">
                  {currentPhase.items.map((item, i) => {
                    const isLit = i < visibleCount;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-carbon-950/60 border rounded-xl px-5 py-3.5 transition-all duration-700 ease-out"
                        style={{
                          borderColor: isLit ? 'rgba(50,50,48,0.5)' : 'rgba(40,40,38,0.3)',
                        }}
                      >
                        <span className={`text-2xl mt-0 flex-shrink-0 leading-none transition-colors duration-700 ${isLit ? currentPhase.color : 'text-carbon-300/30'}`}>{isLit ? '✓' : '○'}</span>
                        <span className={`transition-colors duration-700 ${isLit ? 'text-carbon-200' : 'text-carbon-300'}`} style={{ fontSize: '16px' }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TechniciansPage() {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [terminalVisits, setTerminalVisits] = useState(15);
  const [docMinutes, setDocMinutes] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(FLAT_RATE_DEFAULT);

  // [PostHog] Track calculator values 2s after last slider change (debounced)
  const trackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasInteractedRef = useRef(false);

  const dailyMinutesSaved = (terminalVisits * MINUTES_PER_TERMINAL_VISIT) + docMinutes;
  const weeklyHoursSaved = (dailyMinutesSaved * 5) / 60;
  const additionalBillableHoursWeekly = weeklyHoursSaved * 0.8;
  const monthlyIncomeBoost = additionalBillableHoursWeekly * hourlyRate * WEEKS_PER_MONTH;
  const yearlyIncomeBoost = monthlyIncomeBoost * 12;

  // [PostHog] Debounced tracking
  useEffect(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      return;
    }
    clearTimeout(trackTimerRef.current);
    trackTimerRef.current = setTimeout(() => {
      trackCalculatorValues({
        tab: 'technician',
        values: { terminalVisits, docMinutes, hourlyRate },
        result: Math.round(monthlyIncomeBoost),
      });
    }, 2000);
    return () => clearTimeout(trackTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalVisits, docMinutes, hourlyRate]);

  return (
    <div className="pt-16">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-electric-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-500/10 border border-electric-500/30 mb-8"
          >
            <Wrench className="w-4 h-4 text-electric-400" />
            <span className="text-sm font-semibold text-electric-400 tracking-wider uppercase">
              For Technicians
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Your AI Wingman.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              Hands-Free.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-carbon-300 mb-10 max-w-3xl mx-auto"
          >
            ONRAMP is a hands-free AI voice assistant that stays with you through every job —
            from diagnosis to close-out. Diagnose faster, work smarter, and never write another RO report from scratch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => {
                const el = document.getElementById('roi-calculator');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }}
              className="group px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric flex items-center gap-2 cursor-pointer"
            >
              See What You Could Earn
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/how-it-works"
              className="px-8 py-4 bg-carbon-800/50 hover:bg-carbon-700/50 text-carbon-100 font-semibold rounded-xl border border-carbon-600/50 hover:border-carbon-500/50 transition-all duration-300"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Terminate Wasted Time ─────────────────────────────────────── */}
      <TerminateWastedTimeSection />

      {/* ── Phase Cards (expand on hover) ────────────────────────────── */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
              Four Phases. One Voice.
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              ONRAMP Guides You Through Every Job
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              From first symptom to final report — ONRAMP is with you at every step.
              <span className="hidden md:inline"> Hover any phase to see the details.</span>
            </p>
          </motion.div>

          {/* Phase stack — full width, expand on hover */}
          <div className="space-y-3 max-w-4xl mx-auto" onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setHoveredPhase(null); }}>
            {phases.map((phase, i) => {
              const c = phaseColors[phase.color];
              const isHovered = hoveredPhase === i;

              return (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={mobileViewport}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setHoveredPhase(i); }}
                  onClick={() => setHoveredPhase(isHovered ? null : i)}
                  className={`rounded-2xl border cursor-default transition-all duration-400 overflow-hidden ${
                    isHovered
                      ? `${c.border} bg-carbon-800/80`
                      : `${c.border} bg-carbon-800/50 hover:bg-carbon-800/60`
                  }`}
                >
                  <div className="p-4 md:p-6">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2.5 rounded-xl ${c.bg}`}>
                        <phase.icon className={`w-5 h-5 ${c.text}`} />
                      </div>
                      <div>
                        <span className={`text-sm font-bold tracking-widest uppercase ${c.text}`}>{phase.name}</span>
                        {/* Desktop: dash + tagline inline. Mobile: tagline as subtext */}
                        <span className="hidden md:inline text-carbon-300 text-sm ml-2">— {phase.tagline}</span>
                        <span className={`block md:hidden text-xs ${c.text} mt-0.5`}>{phase.tagline}</span>
                      </div>
                    </div>

                    <p className="text-carbon-300 text-sm leading-relaxed">{phase.description}</p>

                    {/* Desktop: expand on hover. Mobile: always expanded */}
                    {/* Mobile: always visible */}
                    <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: 'inherit' }}>
                      <div className="grid grid-cols-1 gap-3">
                        {phase.details.map((detail) => (
                          <div key={detail} className="flex items-start gap-2.5">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full ${c.bg} flex items-center justify-center mt-0.5`}>
                              <Zap className={`w-3 h-3 ${c.text}`} />
                            </div>
                            <span className="text-carbon-200 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Desktop: expandable on hover */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isHovered ? 'auto' : 0,
                        opacity: isHovered ? 1 : 0,
                      }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="overflow-hidden hidden md:block"
                    >
                      <div className={`mt-5 pt-5 border-t ${c.border}`}>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {phase.details.map((detail) => (
                            <div key={detail} className="flex items-start gap-2.5">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${c.bg} flex items-center justify-center mt-0.5`}>
                                <Zap className={`w-3 h-3 ${c.text}`} />
                              </div>
                              <span className="text-carbon-200 text-sm">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mt-10"
          >
            <Link
              to="/how-it-works"
              className="group inline-flex items-center gap-2 text-electric-400 font-semibold hover:text-electric-300 transition-colors"
            >
              See the full walkthrough with audio samples
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Time Wasters → ONRAMP (hover-reveal) ───────────────────── */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Changes When You Have{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                ONRAMP
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              It's like having a master technician riding shotgun on every job — helping you diagnose faster, prepare better, work more efficiently, and writing your reports so you can keep turning wrenches.
            </p>
          </motion.div>

          <div className="space-y-3">
            {timeWasters.map((item, i) => (
              <motion.div
                key={item.pain}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: i * 0.07 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-xl border border-carbon-700/50 md:group-hover:border-electric-500/40 transition-all duration-500 cursor-default">
                  <div className="relative z-10 p-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-carbon-800/60 md:group-hover:bg-carbon-800/20 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 md:group-hover:bg-red-500/0 flex items-center justify-center transition-all duration-500">
                        <Clock className="w-4 h-4 text-red-400/70 md:group-hover:text-red-400/30 transition-all duration-500" />
                      </div>
                      <span className="text-carbon-300 md:group-hover:line-through md:group-hover:decoration-red-500/50 transition-all duration-500">
                        {item.pain}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-3 transition-all duration-500">
                      <div className="flex-shrink-0 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center">
                        <img src="/Onramp-Brain Bug-Pink.png" alt="" className="h-5 w-auto md:hidden" />
                        <ArrowRight className="w-4 h-4 hidden md:block text-carbon-300 md:group-hover:text-electric-400 transition-colors duration-500" />
                      </div>
                      <span className="text-electric-300 md:text-carbon-300 md:group-hover:text-electric-300 font-medium transition-colors duration-500">{item.solution}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-500/5 to-electric-500/10 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-carbon-300 text-sm text-center mt-6 hidden md:block">
            Hover over each item to see the ONRAMP difference
          </p>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
              Built for the Bay
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Everything You Need.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                Nothing You Don't.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-electric-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4 group-hover:bg-electric-500/20 transition-colors">
                  <cap.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{cap.title}</h3>
                <p className="text-carbon-300 text-sm leading-relaxed">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Need ────────────────────────────────────────────── */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              What You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">Need</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              ONRAMP runs on hardware you probably already own. The Brain Button is the only new piece.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CircleDot,
                name: 'Brain Button',
                description: "ONRAMP's Brain Button is a wireless Bluetooth button that clips to your shirt or belt. Tap-to-talk activates your AI voice wingman. Tap-to-pause. All hands-free and voice controlled. No greasy phone screens!",
                image: '/BrainButton.png',
              },
              {
                icon: Smartphone,
                name: 'Mobile App',
                description: 'The ONRAMP app runs on iOS and Android. It connects to the Brain Button and streams AI voice conversationally through your headphones.',
              },
              {
                icon: Radio,
                name: 'Your Headphones',
                description: 'Use your existing Bluetooth or wired headphones! ONRAMP works with any headphones as long as they have an integrated microphone.',
                image: '/airpods.png',
              },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`absolute right-4 object-contain ${item.image.includes('airpods') ? 'w-[86px] h-[86px]' : 'w-18 h-18'}`}
                    style={{ top: 48, transform: 'translateY(-50%)', filter: 'drop-shadow(0 0 8px rgba(74,144,217,0.2))' }}
                  />
                ) : item.name === 'Mobile App' && (
                  <div className="absolute right-4 flex items-center gap-2" style={{ top: 48, transform: 'translateY(-50%)' }}>
                    <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, backgroundColor: 'rgba(249, 115, 22, 0.7)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: 46, height: 46 }} fill="white">
                        <path d="M17.523 15.341a.96.96 0 0 0 .96-.96V8.075a.96.96 0 1 0-1.92 0v6.306a.96.96 0 0 0 .96.96zM6.477 15.341a.96.96 0 0 0 .96-.96V8.075a.96.96 0 0 0-1.92 0v6.306a.96.96 0 0 0 .96.96zM8.59 17.921v2.64a1.08 1.08 0 0 0 2.16 0v-2.64h2.5v2.64a1.08 1.08 0 0 0 2.16 0v-2.64h.27a1.2 1.2 0 0 0 1.2-1.2V7.681H7.12v9.04a1.2 1.2 0 0 0 1.2 1.2h.27zM15.61 3.561l1.22-1.78a.3.3 0 0 0-.09-.42.3.3 0 0 0-.42.09l-1.27 1.85a6.47 6.47 0 0 0-6.1 0L7.68 1.451a.3.3 0 0 0-.42-.09.3.3 0 0 0-.09.42l1.22 1.78A5.28 5.28 0 0 0 5.2 7.281h13.6a5.28 5.28 0 0 0-3.19-3.72zM9.8 5.881a.6.6 0 1 1 .6-.6.6.6 0 0 1-.6.6zm4.4 0a.6.6 0 1 1 .6-.6.6.6 0 0 1-.6.6z"/>
                      </svg>
                    </div>
                    <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, backgroundColor: 'rgba(74, 144, 217, 0.7)' }}>
                      <svg viewBox="0 0 384 512" style={{ width: 38, height: 38 }} fill="white">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                      </svg>
                    </div>
                  </div>
                )}
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{item.name}</h3>
                <p className="text-carbon-300 pr-14">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator (PRESERVED — DO NOT MODIFY) ───────────────── */}
      <section id="roi-calculator" className="py-20 px-4 carbon-fiber-bg relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-safety-500/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-electric-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Calculator className="w-4 h-4" />
              Reclaim what's yours
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Calculate Your<br className="md:hidden" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
                Wasted Income
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              See how much more you could be earning with the time ONRAMP saves you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              transition={{ delay: 0.2 }}
              className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-electric-500/20">
                  <Clock className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Time Savings Calculator</h3>
                  <p className="text-carbon-300 text-sm">See your potential take-home boost</p>
                </div>
              </div>

              {/* Terminal Visits Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    How many times a day do you go to your terminal for diagnosis, TSB's, parts, procedures and torques?
                    <span className="block text-carbon-300 text-sm font-normal">
                      (We assume ~4 min per visit)
                    </span>
                  </label>
                  <span className="text-electric-400 font-bold text-2xl shrink-0">{terminalVisits}x</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={terminalVisits}
                  onChange={(e) => setTerminalVisits(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-carbon-300 text-xs mt-1">
                  <span>5x</span>
                  <span>30x</span>
                </div>
              </div>

              {/* Doc Time Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    How much time do you spend on average writing reports and documentation?
                  </label>
                  <span className="text-electric-400 font-bold text-2xl shrink-0">{docMinutes}m/day</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={docMinutes}
                  onChange={(e) => setDocMinutes(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-carbon-300 text-xs mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {/* Hourly Rate Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    Your hourly rate
                  </label>
                  <span className="text-electric-400 font-bold text-2xl shrink-0">${hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-carbon-300 text-xs mt-1">
                  <span>$20/hr</span>
                  <span>$60/hr</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                <div className="flex flex-col">
                  <p className="text-carbon-300 text-sm flex-1">Daily time saved</p>
                  <p className="text-white font-bold text-xl mt-1">
                    {Math.round(dailyMinutesSaved)} min
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-carbon-300 text-sm flex-1">Weekly hours saved</p>
                  <p className="text-white font-bold text-xl mt-1">{weeklyHoursSaved.toFixed(1)} hrs</p>
                </div>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              transition={{ delay: 0.3 }}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-electric-900/40 to-electric-950/40 border border-electric-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-electric-500/20">
                  <DollarSign className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Your Take-Home Boost</h3>
                  <p className="text-carbon-300 text-sm">Based on ${hourlyRate}/hr rate</p>
                </div>
              </div>

              {/* Big Number */}
              <div className="text-center py-8">
                <motion.div
                  key={monthlyIncomeBoost}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-2"
                >
                  <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-300 to-electric-500">
                    ${Math.round(monthlyIncomeBoost).toLocaleString()}
                  </span>
                  <span className="text-electric-400 text-2xl font-semibold">/mo</span>
                </motion.div>
                <p className="text-carbon-300">Potential monthly income boost</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-electric-400" />
                    <span className="text-carbon-200">Additional billable hours/week</span>
                  </div>
                  <span className="text-electric-400 font-bold">
                    +{additionalBillableHoursWeekly.toFixed(1)} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-carbon-200">Yearly income boost</span>
                  </div>
                  <span className="text-green-400 font-bold">
                    +${Math.round(yearlyIncomeBoost).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-carbon-300 text-xs mt-6 text-center">
                * Based on 5 days/week. Actual results vary by shop and workload.
              </p>
            </motion.div>
          </div>

          {/* Bottom Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-carbon-300 text-lg mb-6">
              These aren't hypotheticals. This is your money wasted —{' '}
              <span className="text-white font-bold">reclaim your income</span> with the tool that works alongside you.
            </p>
          </motion.div>
        </div>
      </section>
      {/* ── END ROI Calculator ───────────────────────────────────────── */}

      {/* ── Getting Started ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-electric-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Rocket className="w-4 h-4" />
              Getting Started
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              From Sign-Up to First Job in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-green-400">
                Under 10 Minutes
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              When you sign up, you'll choose a start date. This gives us time to ship your Brain Button. From your start date, you'll be up and running in under 10 minutes.
            </p>
          </motion.div>

          <div className="relative">
            {[
              { icon: Smartphone, step: 1, title: 'Download the App', time: '2 min', description: 'Install ONRAMP on your iPhone or Android' },
              { icon: UserCog, step: 2, title: 'Set Up Your Profile', time: '5 min', description: 'Name your AI, choose your voice, set your preferences' },
              { icon: CircleDot, step: 3, title: 'Connect Brain Button & Permissions', time: '1 min', description: 'Pair via Bluetooth, accept mic and camera permissions' },
              { icon: Zap, step: 4, title: 'Start Your First Job', time: '15 sec', description: 'Enter an RO number and go', last: true },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={mobileViewport}
                transition={{ delay: i * 0.15 }}
                className="relative flex items-center gap-3 md:gap-5 mb-6 last:mb-0"
              >
                {/* Step number circle */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-carbon-950 border-2 ${
                  item.last
                    ? 'text-green-400 border-green-400/40 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                    : 'text-electric-400 border-electric-400/30'
                }`}>
                  {item.step}
                </div>

                {/* Content card */}
                <div className={`flex-1 p-3 md:p-5 rounded-2xl bg-carbon-800/50 border transition-all duration-300 ${
                  item.last
                    ? 'border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.1)]'
                    : 'border-carbon-700/50'
                }`}>
                  <div className="flex items-center justify-between gap-2 md:gap-4 mb-1">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className={`inline-flex p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                        item.last ? 'bg-green-500/10 text-green-400' : 'bg-electric-500/10 text-electric-400'
                      }`}>
                        <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h3 className="text-white font-bold text-base md:text-lg">{item.title}</h3>
                    </div>
                    <span className={`flex-shrink-0 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold ${
                      item.last
                        ? 'bg-green-500/10 text-green-400 ring-1 ring-green-400/30'
                        : 'bg-electric-500/10 text-electric-400 ring-1 ring-electric-400/30'
                    }`}>
                      {item.time}
                    </span>
                  </div>
                  <p className="text-carbon-300 text-sm md:text-base ml-[36px] md:ml-12">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={mobileViewport}
            transition={{ delay: 0.6 }}
            className="text-center text-carbon-400 text-lg mt-12 font-medium"
          >
            Under 10 minutes to your first AI-guided repair.
          </motion.p>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center p-10 md:p-16 rounded-3xl bg-gradient-to-br from-carbon-800/80 to-carbon-800/40 border border-electric-500/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                Plan
              </span>
            </h2>
            <Link
              to="/pricing#individual"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric"
            >
              Choose Your Plan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
