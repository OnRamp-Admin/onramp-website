import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, TrendingUp, Shield, DollarSign, Users,
  FileCheck, AlertTriangle, Target, ArrowRight, Calculator,
  GraduationCap, Eye, BarChart3, Mail, Upload, UserCheck, Clock,
  Search, List, Wrench, CheckCircle2,
  Zap, Rocket, Smartphone, UserCog, CircleDot,
} from 'lucide-react';
import { trackCalculatorValues } from '../lib/analytics';

// Manager ROI constants
const HOURS_PER_WEEK = 40;
const WEEKS_PER_YEAR = 52;
const AVG_BILLABLE_RATE = 125;
const WARRANTY_WORK_SHARE = 0.25;

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const profitLevers = [
  {
    icon: TrendingUp,
    title: 'More Cars Through the Bay',
    stat: '10-15%',
    statLabel: 'efficiency gain',
    description:
      'When techs stop walking to the terminal 15+ times a day, that time converts directly into billable hours. ONRAMP eliminates terminal trips, automates documentation, and keeps your team turning wrenches.',
    color: 'safety',
  },
  {
    icon: Shield,
    title: 'Warranty Claims That Get Paid',
    stat: '60%',
    statLabel: 'of rejections are documentation issues',
    description:
      'ONRAMP generates complete 3C+V documentation from the tech\'s voice — Complaint, Cause, Correction, and Validation. Proper labor codes, detailed narratives, pre-submission validation. First-pass approvals go up, revenue stops leaking.',
    color: 'green',
  },
  {
    icon: GraduationCap,
    title: 'Every Tech Performs Like Your Best Tech',
    stat: '50%',
    statLabel: 'faster ramp-up for new hires',
    description:
      'ONRAMP gives every technician AI-powered diagnostic support and step-by-step repair guidance. Junior techs take on more complex jobs sooner. New hires ramp up faster. Your training costs drop.',
    color: 'electric',
  },
];

const leverColors: Record<string, { text: string; bg: string; border: string; stat: string }> = {
  safety: { text: 'text-safety-400', bg: 'bg-safety-500/10', border: 'border-safety-500/30', stat: 'text-safety-400' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', stat: 'text-green-400' },
  electric: { text: 'text-electric-400', bg: 'bg-electric-500/10', border: 'border-electric-500/30', stat: 'text-electric-400' },
};

const managerFeatures = [
  {
    icon: Eye,
    title: 'Real-Time Job Visibility',
    description: 'See which jobs are active, which phase each tech is in, and how long they\'ve been on task — without interrupting a single repair.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track individual tech efficiency, time-on-task, and completion rates. Identify top performers and coaching opportunities.',
  },
  {
    icon: Mail,
    title: 'Daily Summary Reports',
    description: 'Automated end-of-day email summaries of all jobs completed, hours logged, and RO reports generated across your team.',
  },
  {
    icon: Upload,
    title: 'AI Guided Repairs',
    description: 'Based on AI knowledge and OEM repair procedures, project steps are organized into highly structured voice guidance to coach your technicians while they work hands-free.',
  },
  {
    icon: UserCheck,
    title: 'Team Management',
    description: 'Add technicians, manage seats, and control access. Shared voice AI hours pool across your entire team.',
  },
  {
    icon: Clock,
    title: 'Time Tracking Built In',
    description: 'Every tech clocks in and out per job automatically. No separate timekeeping system needed — it\'s built into the workflow.',
  },
];

const warrantyFeatures = [
  {
    icon: DollarSign,
    title: 'First-Time Approvals',
    description: 'Reports done right the first time means higher first-pass approval rates and more revenue recovered from every warranty repair.',
  },
  {
    icon: FileCheck,
    title: 'Complete 3C+V Documentation',
    description: 'Complaint, Cause, Correction, Validation — structured automatically from natural speech. ONRAMP also helps capture photos and videos during the repair for complete documentation.',
  },
  {
    icon: AlertTriangle,
    title: 'Pre-Submission Validation',
    description: 'Catches missing information and documentation gaps before they become rejected claims.',
  },
  {
    icon: Target,
    title: 'OEM-Specific Formatting',
    description: 'ONRAMP learns manufacturer requirements for warranty claim and RO report formatting, driving compliance and first-pass approval rates across GM, Ford, Toyota, Honda, and more.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

// ─── Animated Team Visualization ─────────────────────────────────────────────

const PHASE_COLORS = ['#60a5fa', '#fbbf24', '#4ade80', '#fb923c'];
const SVG_CX = 250;
const SVG_CY = 140;
const ORBIT_RX = 210;
const ORBIT_RY = 120;

// Layout (clockwise from 12 o'clock, using standard math angles where 0=3 o'clock):
//   Repair:    12:00 to 6:00 = right half  → angles -π/2 to π/2 (−1.57 to 1.57)
//   Close Out: 6:00 to 8:00  = bottom-left → angles π/2 to 5π/6 (1.57 to 2.62)
//   Diagnose:  8:00 to 10:00 = mid-left    → angles 5π/6 to 7π/6 (2.62 to 3.67)
//   Prepare:   10:00 to 12:00 = upper-left → angles 7π/6 to 3π/2 (3.67 to 4.71)
//
// We normalize to 0→2π where 0 = 12 o'clock (top), going clockwise:
//   Repair:    0 to π        (0 to 3.14)     — right half, 180°
//   Close Out: π to 4π/3     (3.14 to 4.19)  — bottom-left, 60°
//   Diagnose:  4π/3 to 5π/3  (4.19 to 5.24)  — mid-left, 60°
//   Prepare:   5π/3 to 2π    (5.24 to 6.28)  — upper-left, 60°

const REPAIR_END = Math.PI;           // 180°
const CLOSEOUT_END = 4 * Math.PI / 3; // 240°
const DIAGNOSE_END = 5 * Math.PI / 3; // 300°
// Prepare: 300° to 360°

function getPhaseForAngle(angle: number): number {
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (a < REPAIR_END) return 2;        // Repair (green)
  if (a < CLOSEOUT_END) return 3;      // Close Out (orange)
  if (a < DIAGNOSE_END) return 0;      // Diagnose (blue)
  return 1;                             // Prepare (amber)
}

function getColorForAngle(angle: number): string {
  return PHASE_COLORS[getPhaseForAngle(angle)];
}

// Convert our "clockwise from top" angle to standard math angle for x,y
function toXY(cwAngle: number): { x: number; y: number } {
  // clockwise from top: 0=top, π/2=right, π=bottom, 3π/2=left
  // math coords: x=cos(θ), y=sin(θ) where 0=right
  // So math angle = cwAngle - π/2
  const mathAngle = cwAngle - Math.PI / 2;
  return {
    x: SVG_CX + ORBIT_RX * Math.cos(mathAngle),
    y: SVG_CY + ORBIT_RY * Math.sin(mathAngle),
  };
}

// Initial angles: 9 in repair (spread across 0→π), 1 each in other phases
// Stagger them so they don't bunch up
const INITIAL_ANGLES = [
  // Repair (0 to π) — 9 techs evenly spaced
  0.17, 0.50, 0.83, 1.16, 1.49, 1.82, 2.15, 2.48, 2.81,
  // Close Out (~3.5)
  3.50,
  // Diagnose (~4.7)
  4.70,
  // Prepare (~5.7)
  5.70,
];

function TeamVisualization() {
  const anglesRef = useRef([...INITIAL_ANGLES]);
  const [, setTick] = useState(0);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let alive = true;

    const scheduleMove = (techIdx: number) => {
      if (!alive) return;
      const phase = getPhaseForAngle(anglesRef.current[techIdx]);
      let delay: number;
      let step: number;

      if (phase === 2) {
        // Repair: slow and steady — linger here
        delay = 2500 + Math.random() * 2500;
        step = 0.06 + Math.random() * 0.08;
      } else {
        // Other phases: zip through quickly
        delay = 600 + Math.random() * 800;
        step = 0.12 + Math.random() * 0.15;
      }

      const timer = setTimeout(() => {
        if (!alive) return;
        anglesRef.current[techIdx] = (anglesRef.current[techIdx] + step) % (2 * Math.PI);
        setTick(k => k + 1);
        scheduleMove(techIdx);
      }, delay);
      timers.push(timer);
    };

    // Stagger start times so techs don't all move at once
    for (let i = 0; i < INITIAL_ANGLES.length; i++) {
      const initDelay = i * 400 + Math.random() * 600;
      const timer = setTimeout(() => scheduleMove(i), initDelay);
      timers.push(timer);
    }

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={mobileViewport}
      transition={{ duration: 0.7 }}
      className="flex justify-center mb-14"
    >
      <div className="relative w-full max-w-2xl">
        <svg viewBox="0 0 500 280" className="w-full">
          {/* Central ellipse */}
          <ellipse cx={SVG_CX} cy={SVG_CY} rx="130" ry="75" fill="rgba(255,255,255,0.02)" />
          <ellipse cx={SVG_CX} cy={SVG_CY} rx="120" ry="68" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Animated tech nodes */}
          {anglesRef.current.map((angle, i) => {
            const { x, y } = toXY(angle);
            const color = getColorForAngle(angle);
            return (
              <g key={i} style={{ transition: 'all 1.2s ease-in-out' }}>
                <line x1={x} y1={y} x2={SVG_CX} y2={SVG_CY}
                  stroke={color} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.2"
                  style={{ transition: 'all 1.2s ease-in-out' }} />
                <circle cx={x} cy={y} r="16" fill={color} fillOpacity="0.06"
                  style={{ transition: 'all 1.2s ease-in-out' }} />
                <circle cx={x} cy={y} r="12" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" strokeOpacity="0.4"
                  style={{ transition: 'all 1.2s ease-in-out' }} />
                <circle cx={x} cy={y - 3} r="3" fill={color} fillOpacity="0.7"
                  style={{ transition: 'all 1.2s ease-in-out' }} />
                <ellipse cx={x} cy={y + 4} rx="4" ry="3" fill={color} fillOpacity="0.7"
                  style={{ transition: 'all 1.2s ease-in-out' }} />
              </g>
            );
          })}
        </svg>
        {/* ONRAMP logo centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/Onramp-Logo-Gray Brain-White Text-SML.png"
            alt="ONRAMP"
            className="h-7 md:h-9"
          />
        </div>
      </div>
    </motion.div>
  );
}

const managerPhases = [
  {
    icon: Search,
    label: 'DIAGNOSE',
    color: 'text-electric-400',
    bg: 'bg-electric-500/10',
    border: 'border-electric-500/30',
    borderActive: 'border-electric-500/60',
    glowColor: 'rgba(26,160,255,0.35)',
    checkColor: 'text-electric-400',
    shortDesc: 'Faster diagnosis = fewer wasted hours. AI cross-references TSBs so even junior techs diagnose like veterans.',
    desc: 'MGR_DIAGNOSE',
    details: [
      'AI eliminates guesswork — techs find root cause faster',
      'Cross-references TSBs and known failures automatically',
      'Junior techs diagnose at the level of your senior techs',
      'Fewer misdiagnoses = fewer comebacks and wasted labor',
      'Diagnostic notes captured automatically for documentation',
      'Works across all makes, models, and years',
    ],
  },
  {
    icon: List,
    label: 'PREPARE',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    borderActive: 'border-amber-500/60',
    glowColor: 'rgba(245,158,11,0.35)',
    checkColor: 'text-amber-400',
    shortDesc: 'Every tech gets a complete briefing — tools, parts, warnings — before they start.',
    desc: 'MGR_PREPARE',
    details: [
      'Complete parts and tools lists generated before work starts',
      'No mid-job surprises — specialty tools flagged in advance',
      'Reduces parts counter trips and wasted downtime',
      'OEM procedures parsed into clear, organized workflows',
      'Every tech starts every job fully prepared',
      'Consistent preparation quality across the entire team',
    ],
  },
  {
    icon: Wrench,
    label: 'REPAIR',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    borderActive: 'border-green-500/60',
    glowColor: 'rgba(74,222,128,0.35)',
    checkColor: 'text-green-400',
    shortDesc: 'Real-time AI coaching keeps every tech on track — fewer mistakes, faster completions.',
    desc: 'MGR_REPAIR',
    details: [
      'Step-by-step voice guidance keeps techs moving efficiently',
      'Torque specs, fluid capacities, wiring info — all on demand',
      'Fewer mistakes from missed steps or incorrect procedures',
      'Hands-free operation means techs stay productive in the bay',
      'Photos and videos captured during repairs for documentation',
      'Real-time progress tracking visible on your dashboard',
    ],
  },
  {
    icon: FileCheck,
    label: 'CLOSE OUT',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    borderActive: 'border-orange-500/60',
    glowColor: 'rgba(249,115,22,0.35)',
    checkColor: 'text-orange-400',
    shortDesc: 'AI writes warranty-grade 3C+V reports automatically from every tech on every job.',
    desc: 'MGR_CLOSE_OUT',
    details: [
      'AI writes 3C+V reports automatically — no keyboard time',
      'Consistent, warranty-grade documentation from every tech',
      'Higher first-pass approval rates on warranty claims',
      'Complete narratives — nothing missed or forgotten',
      'Ready for DMS upload, print, or email',
      'Eliminates end-of-day documentation backlogs',
    ],
  },
];

const mgrRichDescriptions: Record<string, React.ReactNode> = {
  MGR_DIAGNOSE: (
    <span>Faster diagnosis = fewer wasted hours on wrong paths. AI cross-references TSBs and known failures so even junior techs diagnose like veterans. Get to <strong className="text-white">root cause in record time</strong>.</span>
  ),
  MGR_PREPARE: (
    <span>Every tech gets a complete briefing — tools, parts, warnings — before they start. <strong className="text-white">No mid-job surprises</strong>, no wasted trips to the parts counter.</span>
  ),
  MGR_REPAIR: (
    <span>Real-time AI coaching keeps every tech on track. Step-by-step guidance, torque specs, and wiring info on demand. Your team works with greater <strong className="text-white">speed and accuracy</strong> — fewer mistakes, faster completions.</span>
  ),
  MGR_CLOSE_OUT: (
    <span>AI writes warranty-grade 3C+V reports automatically. Complete, consistent documentation from every tech on every job. Drives <strong className="text-white">higher warranty approval rates</strong> the first time.</span>
  ),
};

function ManagerPhaseCards() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  return (
    <div onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setActivePhase(null); }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {managerPhases.map((phase, index) => {
          const isActive = activePhase === index;
          return (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={mobileViewport}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setActivePhase(index); }}
              onClick={() => setActivePhase(isActive ? null : index)}
              className={`relative p-4 md:p-5 rounded-2xl ${phase.bg} border-2 backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                isActive ? phase.borderActive : phase.border
              }`}
              style={isActive ? { boxShadow: `0 0 20px ${phase.glowColor}` } : {}}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${phase.bg} mb-3`}>
                <phase.icon className={`w-5 h-5 ${phase.color}`} />
              </div>
              <h3 className={`text-sm font-bold ${phase.color} mb-1.5 tracking-wider`}>{phase.label}</h3>
              <p className="text-carbon-200 text-xs md:text-sm">{phase.shortDesc}</p>

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
              className={`mt-4 p-5 md:p-6 rounded-2xl bg-carbon-900/90 border-2 ${managerPhases[activePhase].borderActive} backdrop-blur-sm text-left`}
              style={{ boxShadow: `0 0 20px ${managerPhases[activePhase].glowColor}` }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-2 rounded-lg ${managerPhases[activePhase].bg}`}>
                  {(() => { const Icon = managerPhases[activePhase].icon; return <Icon className={`w-4 h-4 ${managerPhases[activePhase].color}`} />; })()}
                </div>
                <h4 className={`font-bold text-lg tracking-wider ${managerPhases[activePhase].color}`}>{managerPhases[activePhase].label}</h4>
              </div>
              <p className="text-carbon-200 text-sm md:text-base mb-4">
                {mgrRichDescriptions[managerPhases[activePhase].desc] || managerPhases[activePhase].desc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {managerPhases[activePhase].details.map((detail) => (
                  <div key={detail} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${managerPhases[activePhase].checkColor}`} />
                    <span className="text-carbon-200 text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile hint */}
      {activePhase === null && (
        <p className="md:hidden text-carbon-200 text-xs mt-3 text-center">Tap each phase to learn more</p>
      )}
    </div>
  );
}

export default function ManagersPage() {
  const [efficiencyGain, setEfficiencyGain] = useState(12);
  const [warrantyBump, setWarrantyBump] = useState(4);
  const [numTechnicians, setNumTechnicians] = useState(10);
  const [shopRate, setShopRate] = useState(AVG_BILLABLE_RATE);

  // [PostHog] Track calculator values 2s after last slider change (debounced)
  const trackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasInteractedRef = useRef(false);

  const currentCapacity = numTechnicians * HOURS_PER_WEEK * WEEKS_PER_YEAR;
  const additionalCapacity = currentCapacity * (efficiencyGain / 100);
  const revenueFromCapacity = additionalCapacity * shopRate;
  const warrantyHours = currentCapacity * WARRANTY_WORK_SHARE;
  const warrantyRevenue = warrantyHours * shopRate;
  const warrantyRecovery = warrantyRevenue * (warrantyBump / 100);
  const totalAnnualUnlocked = revenueFromCapacity + warrantyRecovery;

  // [PostHog] Debounced tracking
  useEffect(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      return;
    }
    clearTimeout(trackTimerRef.current);
    trackTimerRef.current = setTimeout(() => {
      trackCalculatorValues({
        tab: 'manager',
        values: { efficiencyGain, warrantyBump, numTechnicians, shopRate },
        result: Math.round(totalAnnualUnlocked),
      });
    }, 2000);
    return () => clearTimeout(trackTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [efficiencyGain, warrantyBump, numTechnicians, shopRate]);

  return (
    <div className="pt-16">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-safety-500/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety-500/10 border border-safety-500/30 mb-8"
          >
            <Building2 className="w-4 h-4 text-safety-400" />
            <span className="text-sm font-semibold text-safety-400 tracking-wider uppercase">
              For Service Managers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Empower Every Tech to Perform{' '}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
              Like Your Best Tech.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-carbon-200 mb-10 max-w-3xl mx-auto"
          >
            ONRAMP gives your entire team AI-powered diagnostics, step-by-step repair guidance, and automated RO documentation.
            Faster turn times. Better warranty approvals. Techs who want to stay.
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
                if (!el) return;
                // Scroll multiple times to compensate for whileInView animations
                // changing the page height during scroll
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 1000);
              }}
              className="group px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety flex items-center gap-2 cursor-pointer"
            >
              Calculate Your Shop's ROI
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

      {/* ── Three Profit Levers ──────────────────────────────────────── */}
      <section
        className="py-20 px-4 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(/30-bay-shop-aerial.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-safety-400 text-sm font-semibold tracking-wider uppercase">
              The Business Case
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-4">
              Three Levers.<br className="md:hidden" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                One Tool.
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              ONRAMP drives profit from three directions simultaneously — efficiency, warranty recovery, and talent development.
            </p>
          </motion.div>

          <div className="space-y-6">
            {profitLevers.map((lever, i) => {
              const c = leverColors[lever.color];
              return (
                <motion.div
                  key={lever.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={mobileViewport}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 md:p-8 rounded-2xl bg-carbon-800/50 border ${c.border} hover:bg-carbon-800/70 transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex items-center gap-4 md:w-64 flex-shrink-0">
                      <div className={`p-3 rounded-xl ${c.bg}`}>
                        <lever.icon className={`w-6 h-6 ${c.text}`} />
                      </div>
                      <div>
                        <div className={`text-3xl font-bold ${c.stat}`}>{lever.stat}</div>
                        <div className="text-carbon-200 text-xs">{lever.statLabel}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-xl mb-2">{lever.title}</h3>
                      <p className="text-carbon-200 leading-relaxed">{lever.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Every Tech, Every Job ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-carbon-900/30 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-safety-400 text-sm font-semibold tracking-wider uppercase">
              Team-Wide AI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Every Tech. Every Job.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                AI-Powered.
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              Your entire service department operating at peak performance — simultaneously. Every technician gets the same best-in-class AI coaching, on every step of every repair.
            </p>
          </motion.div>

          {/* Team visualization — animated tech nodes */}
          <TeamVisualization />

          {/* Four phase cards with hover expand — manager-focused */}
          <ManagerPhaseCards />
        </div>
      </section>

      {/* ── What Managers Get ────────────────────────────────────────── */}
      <section
        className="py-20 px-4 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(/Busy-Shop-aisle.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-safety-400 text-sm font-semibold tracking-wider uppercase">
              Your Command Center
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Complete Visibility.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                Zero Interruptions.
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              See what your techs are working on, what they're waiting on, and where every job stands — real-time status and documentation visibility without interrupting a single repair.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managerFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-safety-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-safety-500/10 text-safety-400 mb-4 group-hover:bg-safety-500/20 transition-colors">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-carbon-200 text-sm leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Warranty Deep Dive ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-900 to-carbon-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <span className="text-green-400 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              The Warranty Advantage
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Stop Leaving Money on the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-electric-400">
                OEM's Table
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              Poor documentation costs shops thousands in rejected warranty claims every year.
              ONRAMP generates RO narratives that get approved the first time.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {warrantyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl bg-carbon-800/30 border border-carbon-700/30"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-carbon-200">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sample RO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            transition={{ delay: 0.3 }}
            className="p-6 md:p-8 rounded-2xl bg-carbon-800/50 border border-green-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">Sample Warranty-Ready RO Report</span>
            </div>
            <div className="font-mono text-sm space-y-3">
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-electric-500">
                <span className="text-carbon-200">CONCERN:</span>
                <span className="text-carbon-200 ml-2">
                  Customer states vehicle intermittent no-start condition, occurs after sitting overnight
                </span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-safety-500">
                <span className="text-carbon-200">CAUSE:</span>
                <span className="text-carbon-200 ml-2">
                  Found B+ battery cable terminal end severely corroded, causing voltage drop of 2.3V under load. Parasitic draw within spec at 32mA.
                </span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-green-500">
                <span className="text-carbon-200">CORRECTION:</span>
                <span className="text-carbon-200 ml-2">
                  Replaced B+ cable terminal end per TSB 19-NA-123. Cleaned battery posts, applied dielectric grease. Load tested battery at 625 CCA (spec: 600 CCA). System operates as designed.
                </span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-amber-500">
                <span className="text-carbon-200">VALIDATION:</span>
                <span className="text-carbon-200 ml-2">
                  Vehicle started and shut off 5 consecutive times with no hesitation. Overnight cold-soak test passed — vehicle started on first crank after 14-hour sit. Voltage drop under load measured 0.1V (spec: &lt;0.5V). Repair verified.
                </span>
              </div>
            </div>
            <p className="text-carbon-200 text-sm mt-4">
              * Generated automatically from technician voice notes during the repair — no typing required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── ROI Calculator (PRESERVED — DO NOT MODIFY) ───────────────── */}
      <section id="roi-calculator" className="py-20 px-4 carbon-fiber-bg relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-safety-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-safety-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Calculator className="w-4 h-4" />
              ROI Engine
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Calculate Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-electric-400">
                Hidden Revenue
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              See how ONRAMP can unlock hidden revenue and lost profits for your service department.
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
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <TrendingUp className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Shop Profit Calculator</h3>
                  <p className="text-carbon-200 text-sm">Find your hidden capacity</p>
                </div>
              </div>

              {/* Technicians Slider (moved to top) */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    How many technicians are in your department?
                  </label>
                  <span className="text-safety-400 font-bold text-2xl">{numTechnicians}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="100"
                  value={numTechnicians}
                  onChange={(e) => setNumTechnicians(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                  }}
                />
                <div className="flex justify-between text-carbon-200 text-xs mt-1">
                  <span>3 techs</span>
                  <span>100 techs</span>
                </div>
              </div>

              {/* Efficiency Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    How much more efficient would your techs be if they weren't constantly going to the terminal?
                    <span className="block text-carbon-200 text-sm font-normal">
                      (Average shops see 10-15%)
                    </span>
                  </label>
                  <span className="text-safety-400 font-bold text-2xl">{efficiencyGain}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={efficiencyGain}
                  onChange={(e) => setEfficiencyGain(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                  }}
                />
                <div className="flex justify-between text-carbon-200 text-xs mt-1">
                  <span>5%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Warranty Recovery Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm md:text-base">
                    Warranty recovery from improved documentation
                    <span className="block text-carbon-200 text-sm font-normal">
                      (Approval rate improvement)
                    </span>
                  </label>
                  <span className="text-green-400 font-bold text-2xl">{warrantyBump}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={warrantyBump}
                  onChange={(e) => setWarrantyBump(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-green-600), var(--color-green-400))`,
                  }}
                />
                <div className="flex justify-between text-carbon-200 text-xs mt-1">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                <div className="flex flex-col">
                  <p className="text-carbon-200 text-sm flex-1">Current annual capacity</p>
                  <p className="text-white font-bold text-xl mt-1">
                    {currentCapacity.toLocaleString()} hrs
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-carbon-200 text-sm flex-1">Found capacity</p>
                  <p className="text-white font-bold text-xl mt-1">
                    +{Math.round(additionalCapacity).toLocaleString()} hrs
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              transition={{ delay: 0.3 }}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-safety-900/40 to-safety-950/40 border border-safety-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <DollarSign className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Hidden Revenue Unlocked</h3>
                  <p className="text-carbon-200 text-sm">Annual shop profit potential</p>
                </div>
              </div>

              {/* Shop Rate Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <label className="text-carbon-200 font-medium text-sm">
                    What is your hourly shop rate?
                  </label>
                  <span className="text-safety-400 font-bold text-2xl">${shopRate}</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="300"
                  step="5"
                  value={shopRate}
                  onChange={(e) => setShopRate(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                  }}
                />
                <div className="flex justify-between text-carbon-200 text-xs mt-1">
                  <span>$75/hr</span>
                  <span>$300/hr</span>
                </div>
              </div>

              {/* Big Number */}
              <div className="text-center py-8">
                <motion.div
                  key={totalAnnualUnlocked}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-2"
                >
                  <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-safety-300 to-safety-500">
                    ${Math.round(totalAnnualUnlocked).toLocaleString()}
                  </span>
                  <span className="text-safety-400 text-2xl font-semibold">/yr</span>
                </motion.div>
                <p className="text-carbon-200">Total revenue opportunity</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-safety-400" />
                    <span className="text-carbon-200">From efficiency gains</span>
                  </div>
                  <span className="text-safety-400 font-bold">
                    +${Math.round(revenueFromCapacity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-carbon-200">Warranty recovery**</span>
                  </div>
                  <span className="text-green-400 font-bold">
                    +${Math.round(warrantyRecovery).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-carbon-200 text-xs mt-6 text-center">
                * Based on ${shopRate}/hr shop rate, 25% warranty work volume.
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
            <p className="text-carbon-200 text-lg mb-6">
              These aren't hypothetical numbers. This is{' '}
              <span className="text-white font-semibold">found capacity</span>—profitability that's
              currently evaporating.
            </p>
          </motion.div>
        </div>
      </section>
      {/* ── END ROI Calculator ───────────────────────────────────────── */}

      {/* ── Getting Started ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-safety-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Rocket className="w-4 h-4" />
              Getting Started
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Your Entire Team, Up and Running in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-green-400">
                Under 20 Minutes
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              When you sign up, you'll choose a start date. This gives us time to ship Brain Buttons for your team. From your start date, your entire service department will be up and running in under 20 minutes.
            </p>
          </motion.div>

          <div className="relative">
            {/* ── Phase 1: Manager Setup ── */}
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={mobileViewport}
              className="text-safety-400 font-semibold text-sm uppercase tracking-widest mb-6 ml-[3.75rem] md:ml-[4.25rem]"
            >
              Manager Setup (~8 minutes)
            </motion.h3>

            <div className="relative mb-12">
              {[
                { icon: Building2, step: 1, title: 'Create Your Admin Account', time: '5 min', description: 'Create login and set up your service center' },
                { icon: Mail, step: 2, title: 'Invite Your Technicians', time: '3 min', description: 'Enter email addresses — invites go out by email and SMS' },
                { icon: CircleDot, step: 3, title: 'Hand Out Brain Buttons', time: '—', description: 'Distribute Brain Buttons to your team', last: true },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={mobileViewport}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex items-center gap-3 md:gap-5 mb-6 last:mb-0"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-carbon-950 text-safety-400 border-2 border-safety-400/30">
                    {item.step}
                  </div>
                  <div className="flex-1 p-3 md:p-5 rounded-2xl bg-carbon-800/50 border border-carbon-700/50">
                    <div className="flex items-center justify-between gap-2 md:gap-4 mb-1">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="inline-flex p-1.5 md:p-2 rounded-lg flex-shrink-0 bg-safety-500/10 text-safety-400">
                          <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h3 className="text-white font-bold text-base md:text-lg">{item.title}</h3>
                      </div>
                      <span className="flex-shrink-0 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold bg-safety-500/10 text-safety-400 ring-1 ring-safety-400/30">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-carbon-200 text-sm md:text-base ml-[36px] md:ml-12">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Fork indicator ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={mobileViewport}
              className="flex items-center gap-3 md:gap-4 mb-12 ml-[3.75rem] md:ml-[4.25rem]"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-safety-400/50 via-electric-400/50 to-electric-400/50" />
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-electric-500/10 border border-electric-400/30 text-electric-400 text-xs md:text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                <Users className="w-4 h-4 hidden md:block" />
                Technicians set up on their own
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-electric-400/50 to-electric-400/20" />
            </motion.div>

            {/* ── Phase 2: Each Technician ── */}
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={mobileViewport}
              className="text-electric-400 font-semibold text-sm uppercase tracking-widest mb-6 ml-[3.75rem] md:ml-[4.25rem]"
            >
              Each Technician (~8 minutes)
            </motion.h3>

            <div className="relative">
              {[
                { icon: Smartphone, step: 4, title: 'Download the App', time: '2 min', description: 'Install from invite link on iPhone or Android' },
                { icon: UserCog, step: 5, title: 'Set Up Their Profile', time: '5 min', description: 'Name their AI, choose their voice, set preferences' },
                { icon: CircleDot, step: 6, title: 'Connect Brain Button & Permissions', time: '1 min', description: 'Pair Bluetooth, accept mic/camera permissions' },
                { icon: Zap, step: 7, title: 'Start First Job', time: '15 sec', description: 'Enter an RO number and go', last: true },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={mobileViewport}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex items-center gap-3 md:gap-5 mb-6 last:mb-0"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-carbon-950 border-2 ${
                    item.last
                      ? 'text-green-400 border-green-400/40 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                      : 'text-electric-400 border-electric-400/30'
                  }`}>
                    {item.step}
                  </div>
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
                    <p className="text-carbon-200 text-sm md:text-base ml-[36px] md:ml-12">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={mobileViewport}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-carbon-200 text-lg mb-2">
              Admin setup in <span className="text-safety-400 font-semibold">8 minutes</span>. Each tech ready in <span className="text-electric-400 font-semibold">8 minutes</span>.
            </p>
            <p className="text-carbon-400 text-lg font-medium">
              Whole team live in under 20 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center p-10 md:p-16 rounded-3xl bg-gradient-to-br from-carbon-800/80 to-carbon-800/40 border border-safety-500/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                Plan
              </span>
            </h2>
            <Link
              to="/pricing#service-center"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety"
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
