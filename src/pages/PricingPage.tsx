import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { useLocation } from 'react-router-dom';
import {
  Check, Zap, Crown, Infinity as InfinityIcon, ArrowRight, Clock, Users, Building2, User, TrendingUp,
  Minus, Plus, MousePointerClick, HelpCircle, X, CheckCircle2, Loader2, Search,
} from 'lucide-react';
import { trackPricingTabSwitch, trackPricingConfigured, trackContactFormSubmit, trackSignupModalOpened, trackPricingTierSelected } from '../lib/analytics';
import { trackConversion } from '../lib/marketing-pixels';
import { useSEO } from '../hooks/useSEO';

/* ------------------------------------------------------------------ */
/*  Google Form Configuration                                          */
/* ------------------------------------------------------------------ */

const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSecRS6mfq1RZqVOEZ4KLTmogrF_4aSZ2fwg25YMO07ap88RmQ/formResponse';
const GOOGLE_FORM_FIELDS = {
  source: 'entry.1894016444',
  usageLevel: 'entry.1525145917',
  seats: 'entry.1446346906',
  name: 'entry.502216171',
  email: 'entry.1760694518',
  phone: 'entry.1441318369',
  shopName: 'entry.417059025',
  role: 'entry.2032741101',
  message: 'entry.1443923466',
};

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getPhoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!pattern.test(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  const suspiciousTLDs = ['con', 'cmo', 'cim', 'coom'];
  const tld = domain.split('.').pop() || '';
  if (suspiciousTLDs.includes(tld)) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Google Places Autocomplete                                         */
/* ------------------------------------------------------------------ */

interface PlaceSuggestion {
  name: string;
  formattedAddress: string;
  placeId?: string;
}

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

async function searchPlaces(
  query: string,
  location: { lat: number; lng: number } | null,
): Promise<PlaceSuggestion[]> {
  if (!PLACES_API_KEY || query.length < 3) return [];
  try {
    const body: Record<string, unknown> = {
      input: query,
      includedPrimaryTypes: ['car_dealer', 'car_repair'],
    };
    if (location) {
      body.locationBias = {
        circle: { center: { latitude: location.lat, longitude: location.lng }, radius: 50000.0 },
      };
    }
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_API_KEY },
      body: JSON.stringify(body),
    });
    if (!response.ok) return [];
    const data = await response.json();
    const suggestions: PlaceSuggestion[] = (data.suggestions || []).map((s: any) => ({
      name: s.placePrediction?.structuredFormat?.mainText?.text || '',
      formattedAddress: s.placePrediction?.structuredFormat?.secondaryText?.text || '',
      placeId: s.placePrediction?.placeId,
    }));
    return suggestions;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Shared Data                                                        */
/* ------------------------------------------------------------------ */

const tierConfigs = [
  {
    key: 'basic' as const,
    name: 'Basic',
    pricePerSeat: 39,
    hoursPerSeat: 3,
    additionalRate: 15,
    description: 'For very light workloads or part-time technicians.',
    icon: Zap,
    highlight: false,
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    pricePerSeat: 99,
    hoursPerSeat: 10,
    additionalRate: 12,
    description: 'The standard for shop professionals running full days under the hood.',
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
  },
  {
    key: 'unlimited' as const,
    name: 'Unlimited',
    pricePerSeat: 199,
    originalPricePerSeat: 249,
    hoursPerSeat: Infinity,
    additionalRate: 0,
    description: 'For power users who want maximum productivity without restrictions.',
    icon: InfinityIcon,
    highlight: false,
  },
];

/* Color themes per tier — used throughout service center configurator */
const tierColors = {
  basic: {
    text: 'text-electric-400',
    bg: 'bg-electric-500/15',
    bgSubtle: 'bg-electric-500/10',
    bgHover: 'hover:from-electric-400 hover:to-electric-500',
    border: 'border-electric-500/60',
    borderCard: 'border-electric-500/40',
    ring: 'ring-electric-500/30',
    borderPill: 'border-electric-500/30',
    gradient: 'from-electric-500/10',
    btnGradient: 'from-electric-500 to-electric-600',
    btnHover: 'hover:from-electric-400 hover:to-electric-500',
    shadow: 'shadow-electric-500/20',
    sliderFrom: '--color-electric-600',
    sliderTo: '--color-electric-500',
    saveBg: 'bg-electric-500/10',
    saveText: 'text-electric-400',
  },
  pro: {
    text: 'text-safety-400',
    bg: 'bg-safety-500/15',
    bgSubtle: 'bg-safety-500/10',
    bgHover: 'hover:from-safety-400 hover:to-safety-500',
    border: 'border-safety-500/60',
    borderCard: 'border-safety-500/40',
    ring: 'ring-safety-500/30',
    borderPill: 'border-safety-500/30',
    gradient: 'from-safety-500/10',
    btnGradient: 'from-safety-500 to-safety-600',
    btnHover: 'hover:from-safety-400 hover:to-safety-500',
    shadow: 'shadow-safety-500/20',
    sliderFrom: '--color-safety-600',
    sliderTo: '--color-safety-500',
    saveBg: 'bg-safety-500/10',
    saveText: 'text-safety-400',
  },
  unlimited: {
    text: 'text-green-400',
    bg: 'bg-green-500/15',
    bgSubtle: 'bg-green-500/10',
    bgHover: 'hover:from-green-400 hover:to-green-500',
    border: 'border-green-500/60',
    borderCard: 'border-green-500/40',
    ring: 'ring-green-500/30',
    borderPill: 'border-green-500/30',
    gradient: 'from-green-500/10',
    btnGradient: 'from-green-500 to-green-600',
    btnHover: 'hover:from-green-400 hover:to-green-500',
    shadow: 'shadow-green-500/20',
    sliderFrom: '--color-green-600',
    sliderTo: '--color-green-500',
    saveBg: 'bg-green-500/10',
    saveText: 'text-green-400',
  },
} as const;

/* Tier-specific fill colors for SVG (can't use Tailwind classes in SVG attributes) */
const tierSvgColors: Record<string, { fill: string; stroke: string; glow: string }> = {
  basic:     { fill: '#1aa0ff', stroke: '#0088e6', glow: 'rgba(26,160,255,0.3)' },
  pro:       { fill: '#ff971a', stroke: '#e67d00', glow: 'rgba(255,151,26,0.3)' },
  unlimited: { fill: '#4ade80', stroke: '#22c55e', glow: 'rgba(74,222,128,0.3)' },
};

/* Pool ellipse sizing per tier (rx, ry radii) */
const poolEllipseSizes: Record<string, { rx: number; ry: number }> = {
  basic:     { rx: 64, ry: 37 },
  pro:       { rx: 99, ry: 57 },
  unlimited: { rx: 113, ry: 65 },
};

/* ------------------------------------------------------------------ */
/*  Shared Pool Visualization                                          */
/* ------------------------------------------------------------------ */

function PoolVisualization({
  numTechs,
  hoursPerSeat,
  tierKey,
}: {
  numTechs: number;
  hoursPerSeat: number;
  tierKey: 'basic' | 'pro' | 'unlimited';
}) {
  const svg = tierSvgColors[tierKey];
  const pool = poolEllipseSizes[tierKey];
  const isUnlimited = hoursPerSeat === Infinity;
  const totalHours = isUnlimited ? Infinity : numTechs * hoursPerSeat;

  // Container: wider than tall to fill the space below the slider nicely
  const containerW = 380;
  const containerH = 260;
  const cx = containerW / 2;
  const cy = containerH / 2;

  // Outer ellipse for node orbit — wider to match container aspect ratio
  const orbitRx = Math.min(170, 135 + numTechs * 0.7);
  const orbitRy = Math.min(110, 90 + numTechs * 0.4);

  // Node size shrinks when there are many techs
  const nodeR = numTechs <= 15 ? 10 : numTechs <= 30 ? 8 : 6;

  // Build node positions on the elliptical orbit
  const nodes = Array.from({ length: numTechs }, (_, i) => {
    const angle = (i / numTechs) * Math.PI * 2 - Math.PI / 2; // start from top
    return {
      id: i,
      x: cx + orbitRx * Math.cos(angle),
      y: cy + orbitRy * Math.sin(angle),
    };
  });

  return (
    <div className="mt-6 flex justify-center w-full">
      <motion.svg
        viewBox={`0 0 ${containerW} ${containerH}`}
        className="overflow-visible w-full max-w-[380px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow filter for the central ellipse */}
        <defs>
          <filter id={`pool-glow-${tierKey}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>
          <radialGradient id={`pool-grad-${tierKey}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={svg.fill} stopOpacity="0.18" />
            <stop offset="80%" stopColor={svg.stroke} stopOpacity="0.06" />
            <stop offset="100%" stopColor={svg.stroke} stopOpacity="0.02" />
          </radialGradient>
        </defs>

        {/* Lines from each node to center */}
        {nodes.map((node) => (
          <motion.line
            key={`line-${node.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25, x1: node.x, y1: node.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: node.id * 0.01 }}
            x1={node.x}
            y1={node.y}
            x2={cx}
            y2={cy}
            stroke={svg.fill}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ))}

        {/* Central pool glow */}
        <motion.ellipse
          animate={{ rx: pool.rx, ry: pool.ry }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          cx={cx}
          cy={cy}
          fill={svg.glow}
          filter={`url(#pool-glow-${tierKey})`}
        />

        {/* Central pool ellipse */}
        <motion.ellipse
          animate={{ rx: pool.rx, ry: pool.ry }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          cx={cx}
          cy={cy}
          fill={`url(#pool-grad-${tierKey})`}
          stroke={svg.fill}
          strokeWidth={1.5}
          strokeOpacity={0.5}
        />

        {/* Pool text */}
        {isUnlimited ? (
          <motion.text
            animate={{ x: cx, y: cy }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={svg.fill}
            fontSize={72}
            fontWeight="bold"
            fontFamily="Inter, system-ui, sans-serif"
          >
            ∞
          </motion.text>
        ) : (
          <>
            <motion.text
              animate={{ x: cx, y: cy - 8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={svg.fill}
              fontSize={totalHours >= 100 ? 22 : 20}
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {totalHours}
            </motion.text>
            <motion.text
              animate={{ x: cx, y: cy + 12 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={svg.fill}
              fontSize={totalHours >= 100 ? 14 : 13}
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif"
            >
              HRS
            </motion.text>
          </>
        )}

        {/* Technician nodes */}
        {nodes.map((node) => (
          <motion.g key={`node-${node.id}`}>
            {/* Outer glow */}
            <motion.circle
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1, cx: node.x, cy: node.y }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.25, delay: node.id * 0.015 }}
              r={nodeR + 3}
              fill={svg.fill}
              fillOpacity={0.15}
            />
            {/* Node circle */}
            <motion.circle
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, cx: node.x, cy: node.y }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.25, delay: node.id * 0.015 }}
              r={nodeR}
              fill={svg.stroke}
              fillOpacity={0.6}
              stroke={svg.fill}
              strokeWidth={1.5}
            />
            {/* Tiny person silhouette — only when nodes are big enough */}
            {nodeR >= 8 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: node.id * 0.015 }}
              >
                {/* Head */}
                <circle
                  cx={node.x}
                  cy={node.y - (nodeR >= 10 ? 2.5 : 2)}
                  r={nodeR >= 10 ? 2.2 : 1.8}
                  fill="white"
                />
                {/* Body */}
                <ellipse
                  cx={node.x}
                  cy={node.y + (nodeR >= 10 ? 2.5 : 2)}
                  rx={nodeR >= 10 ? 3 : 2.2}
                  ry={nodeR >= 10 ? 2.2 : 1.6}
                  fill="white"
                />
              </motion.g>
            )}
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
}

/* Flic button pricing per tier — full retail is $49.99 */
const flicPricing: Record<string, { seatPrice: number; seatDiscount: string; extraPrice: number; extraDiscount: string }> = {
  basic:     { seatPrice: 49.99, seatDiscount: '',         extraPrice: 49.99, extraDiscount: '' },
  pro:       { seatPrice: 24.99, seatDiscount: '50% off',  extraPrice: 37.49, extraDiscount: '25% off' },
  unlimited: { seatPrice: 0,     seatDiscount: 'FREE',     extraPrice: 24.99, extraDiscount: '50% off' },
};

/* ROI constants */
const ROI_SHOP_RATE = 125;        // $/hr billable
const ROI_HOURS_PER_WEEK = 40;
const ROI_WEEKS_PER_YEAR = 52;
const ROI_WARRANTY_SHARE = 0.25;

/* Efficiency gain scales with usage level */
const ROI_EFFICIENCY_BY_TIER: Record<string, number> = {
  basic: 0.03,     // 3% shop gain
  pro: 0.05,       // 5% shop gain
  unlimited: 0.12, // 12% shop gain
};

/* Warranty approval rate improvement — e.g. 80% → 82% = 2% bump */
const ROI_WARRANTY_BUMP_BY_TIER: Record<string, number> = {
  basic: 0.02,     // 2% approval rate improvement
  pro: 0.04,       // 4% approval rate improvement
  unlimited: 0.06, // 6% approval rate improvement
};

const featureCategories = [
  {
    category: 'Repair Order Management',
    features: [
      'Create and manage repair orders',
      'VIN scanning via camera',
      'Job tracking dashboard with real-time status',
      'Parts waiting / on-hold status management',
      'Built-in clock in/out and time tracking per job',
      'Job completion and close out workflow',
    ],
  },
  {
    category: 'AI Document Processing',
    features: [
      'Drag-and-drop PDF upload',
      'Multi-step AI extraction of repair procedures',
      'Structured workflow generation with organized sections',
      'Parts list with part numbers extraction',
      'Tools list extraction',
      'Torque specifications and coded values extraction',
      'Fluid capacity and type extraction',
      'Safety warnings and technical notes parsing',
    ],
  },
  {
    category: 'AI-Powered Diagnosis',
    features: [
      'Symptom-driven AI diagnostic flow',
      'TSB and recall cross-referencing',
      'Known failure pattern matching',
      'Root cause prioritization',
      'Diagnostic notes captured automatically',
      'Works across all makes, models, and years',
    ],
  },
  {
    category: 'Voice AI Assistant',
    features: [
      'Hands-free voice coaching through every repair phase',
      'Voice-controlled step navigation',
      'Real-time voice Q&A — torque specs, wiring, fluid capacities',
      'Deep Research Mode for complex steps',
      '40+ voice options — male and female styles',
      'Adjustable speech speed',
      'Name your AI — personalized voice assistant',
      'Automated sleep mode to preserve usage hours',
    ],
  },
  {
    category: 'Documentation & Reporting',
    features: [
      'AI-generated 3C+V RO reports (Condition, Cause, Correction, Validation)',
      'Warranty-grade documentation from voice notes',
      'Photo and video capture during repairs',
      'Automated technician notes and observations',
      'Job history and cloud storage',
      'Export reports, photos, and videos to your computer',
    ],
  },
  {
    category: 'Hardware & Platform',
    features: [
      'iOS and Android mobile apps',
      'Web dashboard for management and document uploads',
      'Brain Button — wireless Bluetooth tap-to-talk control',
      'Works with any Bluetooth or wired headphones',
      'Service center team management and seat administration',
      'Usage tracking and email alerts at key thresholds',
    ],
  },
];


function FeatureGrid() {
  return (
    <section className="px-4 pb-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={mobileViewport}
          className="text-center mb-16"
        >
          <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
            What's Included
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            Everything in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              Every Plan
            </span>
          </h1>
          <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
            No feature gates, no upsells. Every plan gets the full ONRAMP platform.
          </p>
        </motion.div>

        <div className="space-y-10">
          {featureCategories.map((cat, catIndex) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={mobileViewport}
              transition={{ delay: catIndex * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-carbon-700/80 to-transparent" />
                <h3 className="text-white font-bold text-lg whitespace-nowrap">
                  {cat.category}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-carbon-700/80 to-transparent" />
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {cat.features.map((feature, fIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={mobileViewport}
                    transition={{ delay: fIndex * 0.03 }}
                    className="flex items-start gap-3 py-1"
                  >
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded bg-electric-500/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-electric-400" />
                    </div>
                    <span className="text-carbon-200 text-sm leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Flic Button Info Modal                                             */
/* ------------------------------------------------------------------ */

function FlicInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-5 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src="/BrainButton.webp"
                alt="Brain Button"
                className="w-28 h-28 object-contain mb-5"
                style={{ filter: "drop-shadow(0 0 12px rgba(26,160,255,0.2))" }}
              />
              <h3 className="text-2xl font-bold text-white mb-2">
                The Key to Hands-Free
              </h3>
              <p className="text-carbon-200 text-sm">
                The Brain Button is a required purchase with the ONRAMP subscription — it's essential to hands-free operation.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {[
                {
                  title: 'Clips to your shirt',
                  desc: 'Compact, lightweight design with a built-in clip. Stays put while you work under the hood.',
                },
                {
                  title: 'Tap to Start / Stop AI Voice',
                  desc: 'One press to start or stop your AI voice assistant. No swiping, no unlocking, no greasy screens.',
                },
                {
                  title: 'Hands-free productivity is the key to speed',
                  desc: 'Keep both hands on the job. Navigate steps, ask questions, and document repairs without putting down your tools.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-safety-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-safety-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-carbon-200 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50">
              <p className="text-carbon-200 text-xs text-center">
                One-time purchase. Required for use. Discounts available depending on your plan level.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SCFlicInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src="/BrainButton.webp"
                alt="Brain Button"
                className="w-28 h-28 object-contain mb-5"
                style={{ filter: "drop-shadow(0 0 12px rgba(26,160,255,0.2))" }}
              />
              <h3 className="text-2xl font-bold text-white mb-2">
                The Key to Hands-Free
              </h3>
              <p className="text-carbon-200 text-sm">
                The Brain Button is a required purchase with the ONRAMP subscription — it's essential to hands-free operation.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {[
                {
                  title: 'One per technician',
                  desc: 'Each tech gets their own Brain Button. Clips to a shirt or lanyard for instant access.',
                },
                {
                  title: 'Tap to Start / Stop AI Voice',
                  desc: 'One press to start or stop the AI voice assistant. No swiping, no unlocking, no greasy screens.',
                },
                {
                  title: 'Keep your team productive',
                  desc: 'Hands-free voice control means techs stay on the job. Less downtime, more billable hours.',
                },
                {
                  title: 'Order spares',
                  desc: 'Add extra buttons so you\'re never down if one gets lost or broken.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-safety-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-safety-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-carbon-200 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50">
              <p className="text-carbon-200 text-xs text-center">
                One-time purchase. Brain Button pricing varies by plan level — discounts applied automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Technician Seats Info Modal                                        */
/* ------------------------------------------------------------------ */

function SeatsInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const faqs = [
    {
      q: 'Why is the minimum 5 technicians?',
      a: 'When setting up a service center on ONRAMP, we provision a dedicated organization with allocated server resources. Five technicians is the minimum that makes this worthwhile. If you only have 3 techs, don\'t worry — the 3 who sign up will simply have a larger pool of Voice AI hours to pull from on Basic and Pro plans.',
    },
    {
      q: 'What if I have more than 50 technicians?',
      a: 'We can handle as many as you\'ve got. Reach out to us and we\'ll get you set up with multiple service centers to keep everything organized.',
    },
    {
      q: 'Are there volume discounts?',
      a: 'Yes — volume discounts are applied automatically as you increase the number of technicians on the platform. The more seats you add, the more you save per seat.',
    },
    {
      q: 'If I only have 10 technicians, can I sign up for 15?',
      a: 'Absolutely — and it often makes a lot of sense. Extra seats mean you can onboard new hires instantly, you\'ll have spare Brain Buttons ready to go, and your team gets a larger shared pool of Voice AI hours instead of paying for overages.',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-electric-500/15 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-electric-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Technician Seats
              </h3>
              <p className="text-carbon-200 text-sm">
                Common questions about team sizing on ONRAMP.
              </p>
            </div>

            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <p className="text-white font-semibold text-sm mb-1">{faq.q}</p>
                  <p className="text-carbon-200 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Usage Level Info Modal                                             */
/* ------------------------------------------------------------------ */

function UsageLevelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const faqs = [
    {
      q: 'The Basic plan only has 3 hours/tech/month — that doesn\'t seem like a lot?!',
      a: 'It\'s not meant to be — Basic is designed for shops with part-time technicians or teams that are just getting started and don\'t mind paying a premium for hours ($15/hr, sold in 10-packs) as they go. The hours are pooled across all seats, so if you have 10 seats but only 5 active techs, each tech effectively gets 6 hours/mo on this plan. Light-use techs might only use ONRAMP 20 to 30 minutes per shift — that\'s 6–9 shifts per month on Basic.',
    },
    {
      q: 'My full-time techs work all day — is 10 hours/tech/mo on the Pro plan really enough?',
      a: 'Pro is the best plan for full-time shops that are just getting started, and for most shops it works great. Remember, hours are shared by all seats. If you have 20 seats, that\'s 200 hours — some techs may only use 5, and then heavy users might use 60. The pool helps balance it out. And when you go past the limit, you can add packs of 10 hours for just $120 ($12/hr), so it\'s still pay-as-you-go. Pro also gets you Brain Buttons at 50% off.',
    },
    {
      q: 'Why would I need unlimited hours?',
      a: 'The Unlimited plan is for service centers that want to unleash their technicians with no worry about hour limits or overage costs, and maximize their team\'s productivity. A truly heavy user of ONRAMP might use it 2–3 hours a day — that\'s 40–60+ hours a month, which could get expensive fast on Basic or Pro. Unlimited removes that ceiling entirely. You also get Brain Buttons FREE with every seat.',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-electric-500/15 flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-electric-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Usage Levels
              </h3>
              <p className="text-carbon-200 text-sm">
                How Voice AI hours work on each plan.
              </p>
            </div>

            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <p className="text-white font-semibold text-sm mb-1">{faq.q}</p>
                  <p className="text-carbon-200 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual Usage Level Modal                                       */
/* ------------------------------------------------------------------ */

function IndividualUsageLevelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const faqs = [
    {
      q: 'The Basic plan only has 3 hours/month — is that enough?',
      a: 'Basic is really designed for part-time technicians or anyone who just wants to try ONRAMP out without a big commitment. If you use ONRAMP for about 20–30 minutes per shift, that covers roughly 6–9 shifts per month. It\'s a low-risk way to get started and see what AI-assisted repair feels like. If you go over, you can add hours for $15/hr — so you only pay for what you use.',
    },
    {
      q: 'How far does 10 hours/month on the Pro plan actually go?',
      a: 'Pro is a great starting point for most full-time technicians. Ten hours a month gives you enough for assistance on diagnostics and a couple of pointers throughout each project. If you start to tip over your included hours, additional hours are just $12/hr — so you can pay as you go without worrying about a big jump in cost.',
    },
    {
      q: 'When does Unlimited make sense for an individual technician?',
      a: 'Unlimited is for technicians who are busy and want to maximize their productivity and increase their take-home pay as much as possible. If you\'re the kind of tech who wants ONRAMP running on nearly every job, working a lot of hours, and handling a high volume of jobs — Unlimited removes any worry about watching the clock. Heavy users can easily hit 2–3 hours a day, which would run up costs quickly on Basic or Pro. Unlimited gives you peace of mind and the lowest effective cost per hour.',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-electric-500/15 flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-electric-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                How Many Hours Do I Need?
              </h3>
              <p className="text-carbon-200 text-sm">
                A guide to choosing the right plan based on how you work.
              </p>
            </div>

            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <p className="text-white font-semibold text-sm mb-1">{faq.q}</p>
                  <p className="text-carbon-200 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Signup Interest Modal                                              */
/* ------------------------------------------------------------------ */

function SignupModal({
  open,
  onClose,
  mode,
  planKey,
  numTechs,
}: {
  open: boolean;
  onClose: () => void;
  mode: 'individual' | 'service-center';
  planKey: 'basic' | 'pro' | 'unlimited';
  numTechs?: number;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Places autocomplete state
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shopSelected, setShopSelected] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSelectingRef = useRef(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const tier = tierConfigs.find((t) => t.key === planKey)!;
  const c = tierColors[planKey];

  const isIndividual = mode === 'individual';
  const title = isIndividual ? 'Join the Waitlist' : 'Request Account';
  const subtitle = isIndividual
    ? "Due to the technical requirements of onboarding new customers, ONRAMP is bringing new users on in waves. Brain Buttons are essential to operation, and we're currently awaiting our next shipment — we're scheduling customer launch dates over the next three to four weeks. Please join the waitlist, and we'll be in touch to get you signed up as soon as possible."
    : 'Someone from our account team will be in touch to schedule a demo and get your service center signed up.';
  const submitLabel = isIndividual ? 'Join Waitlist' : 'Submit';

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(''); setEmail(''); setPhone(''); setRole('');
      setShopName(''); setShopAddress('');
      setSubmitting(false); setSubmitted(false); setError('');
      setSuggestions([]); setShowSuggestions(false); setShopSelected(false);
      isSelectingRef.current = false;
    }
  }, [open]);

  // Get user location
  useEffect(() => {
    if (open && !userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
      );
    }
  }, [open, userLocation]);

  // Close suggestions when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Debounced Places search
  useEffect(() => {
    if (isSelectingRef.current) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (shopName.length >= 3 && !shopSelected) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchPlaces(shopName, userLocation);
        if (!isSelectingRef.current) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      }, 300);
    } else {
      setSuggestions([]); setShowSuggestions(false);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [shopName, userLocation, shopSelected]);

  const selectPlace = (place: PlaceSuggestion) => {
    isSelectingRef.current = true;
    setShopName(place.name);
    setShopAddress(place.formattedAddress);
    setShopSelected(true);
    setShowSuggestions(false);
    setTimeout(() => { isSelectingRef.current = false; }, 100);
  };

  const clearShopSelection = () => {
    setShopName(''); setShopAddress('');
    setShopSelected(false);
    setSuggestions([]); setShowSuggestions(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !role || !shopName.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (getPhoneDigits(phone).length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const source = isIndividual
        ? `Pricing - Individual - ${tier.name}`
        : `Pricing - Service Center - ${tier.name}`;
      const seats = isIndividual ? '1' : String(numTechs || 1);

      const formData = new URLSearchParams();
      formData.append(GOOGLE_FORM_FIELDS.source, source);
      formData.append(GOOGLE_FORM_FIELDS.usageLevel, tier.name);
      formData.append(GOOGLE_FORM_FIELDS.seats, seats);
      formData.append(GOOGLE_FORM_FIELDS.name, name.trim());
      formData.append(GOOGLE_FORM_FIELDS.email, email.trim());
      formData.append(GOOGLE_FORM_FIELDS.phone, getPhoneDigits(phone));
      formData.append(GOOGLE_FORM_FIELDS.shopName, shopName.trim());
      formData.append(GOOGLE_FORM_FIELDS.role, role);
      formData.append(GOOGLE_FORM_FIELDS.message, '');

      await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      setSubmitted(true);
      trackContactFormSubmit({
        form_location: 'pricing_modal',
        role: role,
        hasPhone: getPhoneDigits(phone).length >= 10,
        hasShopName: shopName.trim().length > 0,
      });
      trackConversion('lead');
    } catch (err) {
      console.error('[SignupModal] Submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const inputClasses = 'w-full px-4 py-3 rounded-xl bg-carbon-900/60 border border-carbon-700 text-white placeholder-carbon-500 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30 transition-colors text-sm';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            {submitted ? (
              /* ── Success State ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className={`w-16 h-16 rounded-full ${c.bg} flex items-center justify-center mb-5`}>
                  <CheckCircle2 className={`w-8 h-8 ${c.text}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">We'll be in touch!</h3>
                <p className="text-carbon-200 text-sm max-w-sm">
                  Thanks for your interest in ONRAMP. Someone from our team will reach out shortly to get you set up.
                </p>
                <button
                  onClick={onClose}
                  className={`mt-8 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r ${c.btnGradient} ${c.btnHover} text-white transition-all duration-300 shadow-lg ${c.shadow} cursor-pointer`}
                >
                  Got it
                </button>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-carbon-200 text-sm">{subtitle}</p>
                </div>

                {/* Service Center plan summary */}
                {!isIndividual && (
                  <div className={`p-4 rounded-xl ${c.bg} border ${c.borderPill} mb-6`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>Selected Plan</span>
                        <p className="text-white font-bold text-lg">{tier.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>Technicians</span>
                        <p className="text-white font-bold text-lg">{numTechs}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Shop Name with Places Autocomplete — first field */}
                  <div className="relative" ref={suggestionsRef}>
                    <label className="block text-carbon-200 text-xs font-medium mb-1.5">Dealership / Shop Name *</label>
                    {shopSelected ? (
                      <div className="relative">
                        <div className={`${inputClasses} pr-10 cursor-default`}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-electric-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white text-sm font-medium">{shopName}</div>
                              {shopAddress && <div className="text-carbon-200 text-xs">{shopAddress}</div>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearShopSelection}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-200 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-200" />
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => { setShopName(e.target.value); setShopSelected(false); }}
                          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                          className={`${inputClasses} pl-10`}
                          placeholder="Search by name (e.g., BMW of Carlsbad)"
                        />
                      </div>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-xl bg-carbon-800 border border-carbon-700/50 shadow-2xl max-h-48 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-carbon-200 bg-carbon-800/80 border-b border-carbon-700/30 rounded-t-xl">
                          Service Centers Near You
                        </div>
                        {suggestions.map((place, idx) => (
                          <button
                            key={`place-${idx}`}
                            type="button"
                            onClick={() => selectPlace(place)}
                            className="w-full text-left px-4 py-3 hover:bg-carbon-700/50 border-b border-carbon-700/20 last:border-b-0 last:rounded-b-xl transition-colors cursor-pointer"
                          >
                            <div className="text-white text-sm font-medium">{place.name}</div>
                            <div className="text-carbon-200 text-xs mt-0.5">{place.formattedAddress}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-xs font-medium mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-xs font-medium mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-xs font-medium mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      placeholder="(555) 123-4567"
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-xs font-medium mb-1.5">Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`${inputClasses} pr-12 ${!role ? 'text-carbon-500' : ''}`}
                      required
                    >
                      <option value="" disabled>Select your role</option>
                      <option value="Technician">Technician</option>
                      <option value="Service Advisor">Service Advisor</option>
                      <option value="Service Manager">Service Manager</option>
                      <option value="Shop Owner">Shop Owner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r ${c.btnGradient} ${c.btnHover} text-white transition-all duration-300 shadow-lg ${c.shadow} disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      submitLabel
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual Pricing Tab                                             */
/* ------------------------------------------------------------------ */

function IndividualPricing() {
  const [selectedTier, setSelectedTier] = useState('pro');
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [flicModalOpen, setFlicModalOpen] = useState(false);
  const [usageLevelModalOpen, setUsageLevelModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupPlan, setSignupPlan] = useState<'basic' | 'pro' | 'unlimited'>('pro');

  const badgeLabels: Record<string, string> = {
    basic: 'Light Use',
    pro: 'Most Popular',
    unlimited: 'Best Value',
  };

  const ctaLabels: Record<string, string> = {
    basic: 'Join the Waitlist',
    pro: 'Join the Waitlist',
    unlimited: 'Join the Waitlist',
  };

  return (
    <>
      {/* Monthly Plans */}
      <section className="px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-12"
          >
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
              Monthly Plans
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                Level
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              Every plan includes <span className="underline">every</span> feature.
              <br />The only difference is how many hours of Voice AI are included.
            </p>
          </motion.div>

          {/* Mobile-only tier selector */}
          <div className="flex md:hidden p-1.5 rounded-xl bg-carbon-800/60 border border-carbon-700/50 mb-6">
            {tierConfigs.map((tier) => {
              const isActive = selectedTier === tier.key;
              const tc = tierColors[tier.key];
              return (
                <button
                  key={tier.key}
                  onClick={() => { setSelectedTier(tier.key); trackPricingTierSelected({ tier: tier.key }); }}
                  className={`flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${tc.btnGradient} text-white shadow-lg ${tc.shadow}`
                      : `${tc.bgSubtle} ${tc.text} border ${tc.borderPill}`
                  }`}
                >
                  {tier.name}
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16" onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setHoveredTier(null); }}>
            {tierConfigs.map((tier, index) => {
              // Show active styling for hovered tier, or selected tier if nothing hovered
              const activeTier = hoveredTier || selectedTier;
              const isActive = activeTier === tier.key;
              const tc = tierColors[tier.key];

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={mobileViewport}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => { setSelectedTier(tier.key); trackPricingTierSelected({ tier: tier.key }); }}
                  onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setHoveredTier(tier.key); }}
                  className={`relative p-8 rounded-2xl transition-all duration-300 cursor-pointer ${selectedTier === tier.key ? 'block' : 'hidden md:block'} ${
                    isActive
                      ? `bg-gradient-to-b ${tc.gradient} to-carbon-800/80 border-2 ${tc.borderCard} scale-[1.02]`
                      : 'bg-carbon-800/50 border border-carbon-700/50'
                  }`}
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${tc.btnGradient} text-white shadow-lg ${tc.shadow}`
                        : 'bg-carbon-700/80 text-carbon-200 border border-carbon-600/50'
                    }`}>
                      {badgeLabels[tier.key]}
                    </span>
                  </div>

                  <div className={`inline-flex p-3 rounded-xl mb-4 transition-colors duration-300 ${
                    isActive
                      ? `${tc.bgSubtle} ${tc.text}`
                      : 'bg-carbon-700/30 text-carbon-200'
                  }`}>
                    <tier.icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-2xl">{tier.name}</h3>
                    {tier.originalPricePerSeat && (
                      <span className={`text-sm font-bold px-3 py-1 rounded-full transition-colors duration-300 ${
                        isActive
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-carbon-700/50 text-carbon-200 border border-carbon-600/50'
                      }`}>
                        20% Off Deal
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    {tier.originalPricePerSeat && (
                      <span className="text-carbon-200 text-lg line-through mr-1">${tier.originalPricePerSeat}</span>
                    )}
                    <span className={`text-4xl font-bold ${tier.originalPricePerSeat && isActive ? 'text-green-400' : 'text-white'}`}>${tier.pricePerSeat}</span>
                    <span className="text-carbon-200">/mo</span>
                  </div>

                  <div className={`text-sm font-semibold mb-4 transition-colors duration-300 ${
                    isActive ? tc.text : 'text-carbon-200'
                  }`}>
                    {tier.hoursPerSeat === Infinity ? 'Unlimited' : tier.hoursPerSeat} Voice AI hours / mo
                  </div>

                  <p className="text-carbon-200 text-sm mb-6">{tier.description}</p>

                  <div className={`relative rounded-xl p-4 mb-6 transition-colors duration-300 ${
                    isActive
                      ? `${tc.saveBg} border ${tc.borderPill}`
                      : 'bg-carbon-700/30 border border-carbon-700/50'
                  }`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUsageLevelModalOpen(true); }}
                      className="absolute top-3 right-3 p-0.5 rounded-full text-white hover:text-white/80 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-carbon-200" />
                      <span className="text-carbon-200 text-sm font-medium">Voice AI Usage</span>
                    </div>
                    <div className="text-carbon-200 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Included hours</span>
                        <span className="text-white font-semibold">
                          {tier.hoursPerSeat === Infinity ? 'Unlimited' : `${tier.hoursPerSeat} hrs/mo`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional hours</span>
                        <span className="text-white font-semibold">
                          {tier.additionalRate === 0 ? (
                            <span className="text-green-400">$0 — included</span>
                          ) : (
                            `$${tier.additionalRate}/hr`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`relative rounded-xl p-4 mb-6 transition-colors duration-300 ${
                    isActive
                      ? `${tc.saveBg} border ${tc.borderPill}`
                      : 'bg-carbon-700/30 border border-carbon-700/50'
                  }`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlicModalOpen(true); }}
                      className="absolute top-3 right-3 p-0.5 rounded-full text-white hover:text-white/80 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4">
                      <img
                        src="/BrainButton.webp"
                        alt="Brain Button"
                        className="w-16 h-16 object-contain flex-shrink-0"
                        style={{ filter: "drop-shadow(0 0 10px rgba(26,160,255,0.2))" }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointerClick className="w-4 h-4 text-carbon-200" />
                          <span className="text-carbon-200 text-sm font-medium">Brain Button</span>
                        </div>
                        {tier.key === 'unlimited' ? (
                          <div className="text-green-400 font-bold text-lg">FREE</div>
                        ) : tier.key === 'pro' ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-carbon-200 line-through text-sm">$49.99</span>
                            <span className="text-white font-bold text-lg">$24.99</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isActive ? 'bg-safety-500/15 text-safety-400' : 'bg-carbon-600/30 text-carbon-200'}`}>50% off</span>
                          </div>
                        ) : (
                          <div className="text-white font-bold text-lg">$49.99</div>
                        )}
                        <p className="text-carbon-200 text-xs mt-1">One-time purchase.<br />Required for use.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSignupPlan(tier.key as 'basic' | 'pro' | 'unlimited'); setSignupModalOpen(true); trackSignupModalOpened({ mode: 'individual', plan: tier.key }); }}
                    className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `bg-gradient-to-r ${tc.btnGradient} ${tc.btnHover} text-white shadow-lg ${tc.shadow}`
                        : 'bg-carbon-700/50 hover:bg-carbon-600/50 text-white border border-carbon-600/50 hover:border-carbon-500/50'
                    }`}
                  >
                    {ctaLabels[tier.key]}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <FlicInfoModal open={flicModalOpen} onClose={() => setFlicModalOpen(false)} />
      <IndividualUsageLevelModal open={usageLevelModalOpen} onClose={() => setUsageLevelModalOpen(false)} />
      <SignupModal
        open={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        mode="individual"
        planKey={signupPlan}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Service Center Pricing Tab                                         */
/* ------------------------------------------------------------------ */

function ServiceCenterPricing() {
  const [numTechs, setNumTechs] = useState(10);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro' | 'unlimited'>('pro');
  const [extraFlics, setExtraFlics] = useState(0);
  const [scFlicModalOpen, setScFlicModalOpen] = useState(false);
  const [seatsModalOpen, setSeatsModalOpen] = useState(false);
  const [usageLevelModalOpen, setUsageLevelModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  // [PostHog] Debounced tracking — captures configurator state 2s after last change
  const configTrackRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tier = tierConfigs.find((t) => t.key === selectedTier)!;
  const c = tierColors[selectedTier];

  // Volume discount: 10+ seats = 5% off, 20+ seats = 10% off, 30+ seats = 15% off
  const volumeDiscount = numTechs >= 30 ? 0.15 : numTechs >= 20 ? 0.10 : numTechs >= 10 ? 0.05 : 0;
  const volumeDiscountPct = Math.round(volumeDiscount * 100);
  const basePrice = numTechs * tier.pricePerSeat;
  const totalHours = tier.hoursPerSeat === Infinity ? Infinity : numTechs * tier.hoursPerSeat;
  const isUnlimited = tier.hoursPerSeat === Infinity;

  // Unlimited plan: combined discount from original $249 — 20%, 25%, 30%, 35%
  const unlimitedCombinedRate = isUnlimited
    ? (numTechs >= 30 ? 0.35 : numTechs >= 20 ? 0.30 : numTechs >= 10 ? 0.25 : 0.20)
    : 0;
  const unlimitedCombinedPct = Math.round(unlimitedCombinedRate * 100);

  // For unlimited, price is computed from original; for others, apply volume discount
  const totalPrice = isUnlimited && tier.originalPricePerSeat
    ? Math.round(numTechs * tier.originalPricePerSeat * (1 - unlimitedCombinedRate))
    : Math.round(basePrice * (1 - volumeDiscount));

  // Strikethrough for unlimited (always) or volume discount on basic/pro
  const showStrikethrough = isUnlimited && tier.originalPricePerSeat;
  const strikethroughTotal = showStrikethrough ? numTechs * tier.originalPricePerSeat! : 0;

  // Flic button calculations
  const totalFlics = numTechs + extraFlics;
  const flicTier = flicPricing[selectedTier];
  const flicBaseCost = numTechs * flicTier.seatPrice;
  const flicExtraCost = extraFlics * flicTier.extraPrice;
  const totalFlicCost = flicBaseCost + flicExtraCost;

  // ROI calculation — efficiency gain scales with tier
  const efficiencyGain = ROI_EFFICIENCY_BY_TIER[selectedTier] ?? 0.07;
  const annualCapacity = numTechs * ROI_HOURS_PER_WEEK * ROI_WEEKS_PER_YEAR;
  const revenueFromCapacity = annualCapacity * efficiencyGain * ROI_SHOP_RATE;
  const warrantyBump = ROI_WARRANTY_BUMP_BY_TIER[selectedTier] ?? 0.10;
  const warrantyRecovery = annualCapacity * ROI_WARRANTY_SHARE * ROI_SHOP_RATE * warrantyBump;
  const hiddenRevenue = Math.round(revenueFromCapacity + warrantyRecovery);
  const annualCost = totalPrice * 12;
  const roiMultiple = annualCost > 0 ? Math.round(hiddenRevenue / annualCost) : 0;
  const efficiencyPct = Math.round(efficiencyGain * 100);

  // [PostHog] Track configurator changes after 2s of inactivity
  useEffect(() => {
    clearTimeout(configTrackRef.current);
    configTrackRef.current = setTimeout(() => {
      trackPricingConfigured({
        tier: selectedTier,
        num_technicians: numTechs,
        monthly_total: totalPrice,
        roi_multiple: roiMultiple,
      });
    }, 2000);
    return () => clearTimeout(configTrackRef.current);
  }, [selectedTier, numTechs, totalPrice, roiMultiple]);


  return (
    <>
      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-12"
          >
            <span className={`${c.text} text-sm font-semibold tracking-wider uppercase`}>
              Service Center Plans
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Build Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                Shop Plan
              </span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              Choose your usage level, team size, and Brain Buttons.
              <br />Every seat/plan gets <span className="underline">every</span> feature — the only difference is Voice AI hours.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* Left: Controls (3 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              className="lg:col-span-3 space-y-8"
            >
              {/* 1. Usage Level Selector — first */}
              <div className="relative pt-0 pb-6 px-4 md:pb-8 md:px-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 overflow-hidden">
                <div className={`absolute top-0 left-0 w-10 h-10 rounded-br-xl bg-gradient-to-br ${c.btnGradient} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <button
                  onClick={() => setUsageLevelModalOpen(true)}
                  className="absolute top-2.5 right-5 p-0.5 rounded-full text-white hover:text-white/80 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="flex items-center ml-12 h-10">
                  <h3 className="text-white font-bold text-lg">Usage Level</h3>
                </div>
                <p className="text-carbon-200 text-sm mb-6 ml-12">
                  Determines the Voice AI hours included per technician each month. Total hours are pooled and shared by all.
                </p>

                {/* Toggle bar — matches Individual page style */}
                <div className="flex p-1.5 rounded-xl bg-carbon-900/60 border border-carbon-700/50 mb-6">
                  {tierConfigs.map((t) => {
                    const isSelected = selectedTier === t.key;
                    const tc = tierColors[t.key];
                    return (
                      <button
                        key={t.key}
                        onClick={() => setSelectedTier(t.key)}
                        className={`flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? `bg-gradient-to-r ${tc.btnGradient} text-white shadow-lg ${tc.shadow}`
                            : `${tc.bgSubtle} ${tc.text} border ${tc.borderPill}`
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>

                {/* Selected plan detail card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTier}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className={`p-5 rounded-xl border ${c.borderPill} ${c.bgSubtle} overflow-hidden`}
                  >
                    {/* Header: icon + name + price stacked on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${c.bg}`}>
                          <tier.icon className={`w-5 h-5 ${c.text}`} />
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">{tier.name}</div>
                          <div className={`text-sm font-semibold ${c.text}`}>
                            {isUnlimited ? 'Unlimited' : tier.hoursPerSeat} Voice AI hours/tech/mo
                          </div>
                        </div>
                      </div>
                      <div className="sm:ml-auto sm:text-right">
                        {tier.originalPricePerSeat && (
                          <span className="text-carbon-200 text-sm line-through mr-2">${tier.originalPricePerSeat}</span>
                        )}
                        <span className="text-white font-bold text-xl">${tier.pricePerSeat}</span>
                        <span className="text-carbon-200 text-sm">/seat/mo</span>
                      </div>
                    </div>
                    <p className="text-carbon-200 text-sm mb-3">{tier.description}</p>
                    {/* Stats: title on top, value below — larger */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-carbon-900/40 text-center">
                        <span className="text-carbon-200 text-xs block mb-1">Included hours</span>
                        <span className={`font-bold ${c.text} ${isUnlimited ? 'text-3xl leading-none' : 'text-lg'}`}>{isUnlimited ? '∞' : `${tier.hoursPerSeat}/tech`}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-carbon-900/40 text-center">
                        <span className="text-carbon-200 text-xs block mb-1">Overage rate</span>
                        <span className={`font-bold text-lg ${c.text}`}>{tier.additionalRate === 0 ? 'N/A' : `$${tier.additionalRate}/hr`}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 2. Technician Seats — second */}
              <div className="relative pt-0 pb-6 px-6 md:pb-8 md:px-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 overflow-hidden">
                <div className={`absolute top-0 left-0 w-10 h-10 rounded-br-xl bg-gradient-to-br ${c.btnGradient} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <button
                  onClick={() => setSeatsModalOpen(true)}
                  className="absolute top-2.5 right-5 p-0.5 rounded-full text-white hover:text-white/80 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="flex items-center ml-12 h-10">
                  <h3 className="text-white font-bold text-lg">Technician Seats</h3>
                </div>
                <p className="text-carbon-200 text-sm mb-6 ml-12">
                  The number of technicians with access to ONRAMP.
                </p>

                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium flex items-center gap-2">
                    <Users className={`w-4 h-4 ${c.text}`} />
                    Number of technicians
                  </label>
                  <span className={`${c.text} font-bold text-2xl`}>{numTechs}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={numTechs}
                  onChange={(e) => setNumTechs(Number(e.target.value))}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, var(${c.sliderFrom}), var(${c.sliderTo}))` }}
                />
                <div className="flex justify-between text-carbon-200 text-xs mt-1">
                  <span>5 techs</span>
                  <span>50 techs</span>
                </div>
                {(() => {
                  const nextTier = numTechs < 10 ? { target: 10, pct: isUnlimited ? 25 : 5, label: isUnlimited ? 'combined' : 'volume' }
                    : numTechs < 20 ? { target: 20, pct: isUnlimited ? 30 : 10, label: isUnlimited ? 'combined' : 'volume' }
                    : numTechs < 30 ? { target: 30, pct: isUnlimited ? 35 : 15, label: isUnlimited ? 'combined' : 'volume' }
                    : null;
                  const seatsNeeded = nextTier ? nextTier.target - numTechs : 0;
                  const hasDiscount = isUnlimited ? unlimitedCombinedRate >= 0.20 : volumeDiscount > 0;
                  const currentPct = isUnlimited ? unlimitedCombinedPct : volumeDiscountPct;
                  const discountLabel = isUnlimited
                    ? (unlimitedCombinedRate >= 0.25 ? 'combined discount active' : 'discount active')
                    : 'volume discount active';

                  // Color tiers for unlimited: 20%=green, 25%=green, 30%=yellow, 35%=purple
                  // Color tiers for non-unlimited: use tier colors, 15%=purple
                  const discountColor = isUnlimited
                    ? unlimitedCombinedRate >= 0.35
                      ? { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' }
                      : unlimitedCombinedRate >= 0.30
                        ? { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' }
                        : unlimitedCombinedRate >= 0.25
                          ? { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
                          : { bg: 'bg-white/5', border: 'border-white/10', text: 'text-carbon-200' }
                    : volumeDiscount >= 0.15
                      ? { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' }
                      : { bg: c.saveBg, border: c.borderPill, text: c.saveText };

                  return hasDiscount ? (
                    <div className={`mt-3 px-3 py-2 rounded-lg border ${discountColor.bg} ${discountColor.border}`}>
                      <span className={`text-sm font-semibold ${discountColor.text}`}>
                        {currentPct}% {discountLabel}
                      </span>
                      {nextTier && (
                        <p className="text-carbon-200 text-xs mt-1">
                          Add {seatsNeeded} more seat{seatsNeeded !== 1 ? 's' : ''} to unlock <span className="text-white font-medium">{nextTier.pct}% {nextTier.label} discount</span>
                        </p>
                      )}
                    </div>
                  ) : nextTier ? (
                    <p className="text-carbon-200 text-xs mt-3">
                      Add {seatsNeeded} more seat{seatsNeeded !== 1 ? 's' : ''} to unlock <span className="text-white font-medium">{nextTier.pct}% {nextTier.label} discount</span>
                    </p>
                  ) : null;
                })()}

                {/* Shared pool visualization */}
                <PoolVisualization numTechs={numTechs} hoursPerSeat={tier.hoursPerSeat} tierKey={selectedTier} />
                <p className="text-carbon-200 text-xs text-center mt-2 leading-relaxed">
                  All {numTechs} technician seats share one pool of Voice AI hours available to the entire service center.
                </p>
              </div>

              {/* 3. Brain Buttons — third */}
              <div className="relative pt-0 pb-6 px-6 md:pb-8 md:px-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 overflow-hidden">
                <div className={`absolute top-0 left-0 w-10 h-10 rounded-br-xl bg-gradient-to-br ${c.btnGradient} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <button
                  onClick={() => setScFlicModalOpen(true)}
                  className="absolute top-2.5 right-5 p-0.5 rounded-full text-white hover:text-white/80 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="flex items-center ml-12 h-10">
                  <h3 className="text-white font-bold text-lg">Brain Buttons</h3>
                </div>
                <p className="text-carbon-200 text-sm mb-6 ml-12">
                  One button per technician for hands-free voice control.<br />Add spares so you're never down if one gets lost.
                </p>

                <div className="flex items-center gap-3 md:gap-6">
                  {/* Flic image */}
                  <div className="flex-shrink-0">
                    <img
                      src="/BrainButton.webp"
                      alt="Brain Button"
                      className="w-16 h-16 md:w-20 md:h-20 object-contain"
                      style={{ filter: "drop-shadow(0 0 10px rgba(26,160,255,0.2))" }}
                    />
                  </div>

                  {/* Quantity + pricing */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-carbon-200 font-medium flex items-center gap-2">
                        <MousePointerClick className={`w-4 h-4 ${c.text}`} />
                        Total buttons
                      </span>
                      <span className={`${c.text} font-bold text-2xl`}>{totalFlics}</span>
                    </div>

                    {/* Base count (= seats) */}
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-carbon-200">1 per technician (minimum)</span>
                      <span className="text-carbon-200">{numTechs} buttons</span>
                    </div>

                    {/* Extra buttons +/- */}
                    <div className="flex justify-between items-center">
                      <span className="text-carbon-200 text-sm">Extra / spare buttons</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExtraFlics(Math.max(0, extraFlics - 1))}
                          disabled={extraFlics === 0}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            extraFlics === 0
                              ? 'bg-carbon-700/30 text-carbon-200 cursor-not-allowed'
                              : `bg-carbon-700/50 text-carbon-200 hover:${c.bg} hover:${c.text} cursor-pointer`
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-bold text-lg w-6 text-center">{extraFlics}</span>
                        <button
                          onClick={() => setExtraFlics(extraFlics + 1)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-carbon-700/50 text-carbon-200 hover:${c.bg} hover:${c.text} transition-colors cursor-pointer`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flic pricing info */}
                {(() => {
                  const fullRetail = 49.99;
                  const seatRetailTotal = numTechs * fullRetail;
                  const extraRetailTotal = extraFlics * fullRetail;
                  const seatSavings = numTechs * (fullRetail - flicTier.seatPrice);
                  const extraSavings = extraFlics * (fullRetail - flicTier.extraPrice);

                  return (
                    <div className="mt-5 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                      {/* Seat buttons line */}
                      <div className="flex flex-wrap justify-between items-center gap-x-2 mb-1">
                        <span className="text-carbon-200 text-sm">
                          {numTechs} × ${fullRetail}
                        </span>
                        <span className="text-white font-semibold text-sm">
                          ${seatRetailTotal.toFixed(2)}
                        </span>
                      </div>
                      {flicTier.seatPrice < fullRetail && flicTier.seatDiscount && (
                        <div className="flex flex-wrap justify-between items-center gap-x-2 mb-1">
                          <span className={`text-xs font-semibold ${isUnlimited ? 'text-green-400' : 'text-safety-400'}`}>
                            {flicTier.seatDiscount.toUpperCase()} on {tier.name} Plan
                          </span>
                          {seatSavings > 0 && (
                            <span className="text-green-400 text-xs font-semibold">Save ${seatSavings.toFixed(2)}</span>
                          )}
                        </div>
                      )}
                      {/* Extra / spare buttons line */}
                      {extraFlics > 0 && (
                        <>
                          <div className="flex flex-wrap justify-between items-center gap-x-2">
                            <span className="text-carbon-200 text-sm">
                              {extraFlics} spare × ${fullRetail}
                            </span>
                            <span className="text-white font-semibold text-sm">${extraRetailTotal.toFixed(2)}</span>
                          </div>
                          {flicTier.extraPrice < fullRetail && flicTier.extraDiscount && (
                            <div className="flex flex-wrap justify-between items-center gap-x-2 mb-1">
                              <span className={`text-xs font-semibold ${isUnlimited ? 'text-green-400' : 'text-safety-400'}`}>
                                {flicTier.extraDiscount.toUpperCase()} on {tier.name} Plan
                              </span>
                              {extraSavings > 0 && (
                                <span className="text-green-400 text-xs font-semibold">Save ${extraSavings.toFixed(2)}</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {/* Total + total savings */}
                      {(() => {
                        const retailGrandTotal = seatRetailTotal + extraRetailTotal;
                        const savingsGrandTotal = seatSavings + extraSavings;
                        return (
                          <div className="mt-2 pt-2 border-t border-carbon-700/30">
                            <div className="flex justify-between items-center">
                              <span className="text-carbon-200 text-sm font-medium">Total</span>
                              <div className="text-right">
                                {savingsGrandTotal > 0 && (
                                  <span className="text-carbon-200 text-xs line-through mr-2">${retailGrandTotal.toFixed(2)}</span>
                                )}
                                <span className={`text-sm font-bold ${totalFlicCost === 0 ? 'text-green-400' : 'text-white'}`}>
                                  {totalFlicCost === 0 ? 'FREE' : `$${totalFlicCost.toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                            {savingsGrandTotal > 0 && (
                              <div className="flex justify-end mt-0.5">
                                <span className="text-green-400 text-xs font-semibold">Save ${savingsGrandTotal.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <p className="text-carbon-200 text-xs mt-2">One-time purchase — ships to your shop.</p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>

            {/* Right: Summary Card (2 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              className="lg:col-span-2"
            >
              <div className={`sticky top-24 p-8 rounded-2xl bg-gradient-to-b ${c.gradient} to-carbon-800/80 border-2 ${c.borderCard} flex flex-col transition-colors duration-300`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${c.bg} border ${c.borderPill} mb-5`}>
                    <Building2 className={`w-3.5 h-3.5 ${c.text}`} />
                    <span className={`text-xs font-semibold ${c.text} uppercase tracking-wider`}>
                      {tier.name} Plan
                    </span>
                  </div>

                  <motion.div
                    key={`${selectedTier}-${numTechs}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    {(showStrikethrough || volumeDiscount > 0) && (
                      <div className="text-carbon-200 text-lg line-through mb-1">
                        ${(showStrikethrough ? strikethroughTotal : basePrice).toLocaleString()}/mo
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-5xl md:text-6xl font-bold text-white">
                        ${totalPrice.toLocaleString()}
                      </span>
                      <span className="text-carbon-200 text-lg">/mo</span>
                    </div>
                    {showStrikethrough && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${unlimitedCombinedRate >= 0.35 ? 'bg-purple-500/15 text-purple-400' : `${c.saveBg} ${c.saveText}`}`}>
                        Save {unlimitedCombinedPct}% — ${(strikethroughTotal - totalPrice).toLocaleString()}/mo
                      </span>
                    )}
                  </motion.div>

                  <p className="text-carbon-200 text-base mt-3">
                    {numTechs} seats x{' '}
                    {showStrikethrough ? (
                      <>
                        <span className="line-through text-carbon-200">${tier.originalPricePerSeat}</span>{' '}
                        <span className={c.saveText}>${Math.round(tier.originalPricePerSeat! * (1 - unlimitedCombinedRate))}</span>
                      </>
                    ) : volumeDiscount > 0 ? (
                      <>
                        <span className="line-through text-carbon-200">${tier.pricePerSeat}</span>{' '}
                        <span className={c.saveText}>${Math.round(tier.pricePerSeat * (1 - volumeDiscount))}</span>
                      </>
                    ) : (
                      <>${tier.pricePerSeat}</>
                    )}
                    /seat
                  </p>
                  {!isUnlimited && volumeDiscount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${volumeDiscount >= 0.15 ? 'bg-purple-500/15 text-purple-400' : `${c.saveBg} ${c.saveText}`}`}>
                        {volumeDiscountPct}% volume discount applied — save ${(basePrice - totalPrice).toLocaleString()}/mo
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="h-px bg-carbon-700/50 mb-6" />

                {/* Summary details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-200 text-sm">Technician seats</span>
                    <span className="text-white font-semibold">{numTechs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-200 text-sm">Shared Voice AI pool</span>
                    <span className="text-white font-semibold">
                      {isUnlimited ? 'Unlimited' : `${totalHours} hrs/mo`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-200 text-sm">Per-seat cost</span>
                    <span className="text-white font-semibold">
                      {showStrikethrough ? (
                        <>
                          <span className="line-through text-carbon-200 mr-1">${tier.originalPricePerSeat}</span>
                          ${Math.round(tier.originalPricePerSeat! * (1 - unlimitedCombinedRate))}/mo
                        </>
                      ) : volumeDiscount > 0 ? (
                        <>
                          <span className="line-through text-carbon-200 mr-1">${tier.pricePerSeat}</span>
                          ${Math.round(tier.pricePerSeat * (1 - volumeDiscount))}/mo
                        </>
                      ) : (
                        <>${tier.pricePerSeat}/mo</>
                      )}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="flex justify-between items-center">
                      <span className="text-carbon-200 text-sm">Avg hours per tech</span>
                      <span className="text-white font-semibold">{tier.hoursPerSeat} hrs/mo</span>
                    </div>
                  )}
                </div>

                {/* Flic buttons one-time cost */}
                {(() => {
                  const fullRetail = 49.99;
                  const retailTotal = totalFlics * fullRetail;
                  const flicSavings = retailTotal - totalFlicCost;

                  return (
                    <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointerClick className={`w-4 h-4 ${c.text}`} />
                        <span className="text-carbon-200 text-sm font-medium">Brain Buttons (one-time)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-carbon-200 text-sm">{totalFlics} button{totalFlics !== 1 ? 's' : ''}</span>
                        <div className="text-right">
                          {flicSavings > 0 && (
                            <span className="text-carbon-200 text-xs line-through mr-2">${retailTotal.toFixed(2)}</span>
                          )}
                          <span className={`font-bold text-lg ${totalFlicCost === 0 ? 'text-green-400' : 'text-white'}`}>
                            {totalFlicCost === 0 ? 'FREE' : `$${totalFlicCost.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                      {flicSavings > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="text-green-400 text-xs font-bold">Save ${flicSavings.toFixed(2)}</span>
                        </div>
                      )}
                      <p className="text-carbon-200 text-[10px] mt-1">
                        One-time purchase, added at checkout
                      </p>
                    </div>
                  );
                })()}

                {/* Additional hours callout */}
                {!isUnlimited && (
                  <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-carbon-200" />
                      <span className="text-carbon-200 text-sm font-medium">Need more hours?</span>
                    </div>
                    <p className="text-carbon-200 text-sm">
                      Add 10-hour packs at{' '}
                      <span className="text-white font-semibold">${tier.additionalRate}/hr</span>{' '}
                      (${tier.additionalRate * 10}/pack).
                    </p>
                  </div>
                )}

                {isUnlimited && (
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-6">
                    <p className="text-green-400 text-sm font-medium text-center">
                      Unlimited hours — no overages, ever.
                    </p>
                  </div>
                )}

                {/* ROI / Hidden Revenue */}
                <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className={`w-4 h-4 ${c.text}`} />
                    <span className="text-carbon-200 text-sm font-medium">Hidden Revenue Unlocked*</span>
                  </div>
                  <motion.div
                    key={`roi-${numTechs}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className={`text-2xl font-bold ${c.text} mb-1`}>
                      ${hiddenRevenue.toLocaleString()}/yr
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-carbon-200">
                        You spend ${annualCost.toLocaleString()}/yr
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${c.saveBg} ${c.saveText} font-semibold`}>
                        {roiMultiple}x ROI
                      </span>
                    </div>
                  </motion.div>
                  <p className="text-carbon-200 text-[10px] mt-2">
                    *Assumes {efficiencyPct}% efficiency gain + {Math.round(warrantyBump * 100)}% warranty approval improvement at ${ROI_SHOP_RATE}/hr
                  </p>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => { setSignupModalOpen(true); trackSignupModalOpened({ mode: 'service-center', plan: selectedTier }); }}
                    className={`group flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r ${c.btnGradient} ${c.btnHover} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${c.shadow} cursor-pointer`}
                  >
                    Contact Sales
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-carbon-200 text-xs text-center mt-4">
                    All features included. No per-feature charges.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SCFlicInfoModal open={scFlicModalOpen} onClose={() => setScFlicModalOpen(false)} />
      <SeatsInfoModal open={seatsModalOpen} onClose={() => setSeatsModalOpen(false)} />
      <UsageLevelModal open={usageLevelModalOpen} onClose={() => setUsageLevelModalOpen(false)} />
      <SignupModal
        open={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        mode="service-center"
        planKey={selectedTier}
        numTechs={numTechs}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Pricing Page                                                  */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  useSEO({
    title: 'Pricing - Plans for Technicians & Service Centers | OnRamp',
    description: 'Flexible pricing for individual technicians and full service centers. Calculate your ROI and find the right OnRamp plan.',
  });
  const location = useLocation();
  const [tab, setTab] = useState<'individual' | 'service-center'>(() => {
    // Default to service-center; allow #individual hash to override
    const hash = window.location.hash.replace('#', '');
    return hash === 'individual' ? 'individual' : 'service-center';
  });

  // React to hash changes (e.g. navigating from ManagersPage)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'individual') setTab('individual');
    else if (hash === 'service-center') setTab('service-center');
  }, [location.hash]);

  return (
    <div className="pt-24 pb-24">

      {/* Hero Header */}
      <section className="px-4 mb-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            Simple Plans.<br className="md:hidden" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              Full Power.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Tab Toggle */}
      <section id="plan-selector" className="px-4 mb-16 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-carbon-800/60 border border-carbon-700/50">
            <button
              onClick={() => { setTab('individual'); trackPricingTabSwitch('individual'); }}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-4 md:py-6 rounded-lg md:rounded-xl text-base md:text-lg font-semibold transition-all duration-200 cursor-pointer ${
                tab === 'individual'
                  ? 'bg-electric-500/20 text-electric-300 border-2 border-electric-400/50 shadow-lg shadow-electric-500/10'
                  : 'text-electric-400'
              }`}
            >
              <User className="w-5 h-5 md:w-7 md:h-7" />
              Individual
            </button>
            <button
              onClick={() => { setTab('service-center'); trackPricingTabSwitch('service-center'); }}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-4 md:py-6 rounded-lg md:rounded-xl text-base md:text-lg font-semibold transition-all duration-200 cursor-pointer ${
                tab === 'service-center'
                  ? 'bg-safety-500/20 text-safety-300 border-2 border-safety-400/50 shadow-lg shadow-safety-500/10'
                  : 'text-safety-400'
              }`}
            >
              <Building2 className="w-5 h-5 md:w-7 md:h-7" />
              <span className="hidden sm:inline">Service Center</span>
              <span className="sm:hidden">Shop</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'individual' ? <IndividualPricing /> : <ServiceCenterPricing />}
        </motion.div>
      </AnimatePresence>


      {/* Feature Grid (always visible) */}
      <FeatureGrid />

      {/* Bottom CTA */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center p-10 md:p-16 rounded-3xl bg-gradient-to-br from-carbon-800/80 to-carbon-800/40 border border-carbon-700/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Choose Your{' '}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${tab === 'individual' ? 'from-electric-400 to-electric-600' : 'from-safety-400 to-safety-600'}`}>
                Plan
              </span>
            </h2>
            <button
              onClick={() => {
                const el = document.getElementById('plan-selector');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }}
              className={`group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${tab === 'individual' ? 'from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 glow-electric' : 'from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 glow-safety'} text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer`}
            >
              Choose Your Plan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
