import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Check, Package, Zap, Crown, Infinity as InfinityIcon, ArrowRight, Clock, Users, Building2, User, TrendingUp,
} from 'lucide-react';
import { trackPricingTabSwitch, trackPricingConfigured } from '../lib/analytics';

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
    description: 'For lighter workloads and shops testing the waters.',
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
    description: 'For power users who never want to think about limits.',
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
      'RO number scanning via camera',
      'Job tracking dashboard',
      'Job approval workflow',
      'Parts waiting / on-hold status',
      'Job completion and wrap-up',
    ],
  },
  {
    category: 'AI Document Processing',
    features: [
      'Technical documentation upload (PDF, images)',
      'AI extraction of repair steps and procedures',
      'Precise step-by-step workflow generation',
      'Required parts and components extraction',
      'Replacement component identification',
      'Torque specification extraction',
      'Fluid capacity and type extraction',
      'Automatic workflow organization into phases',
    ],
  },
  {
    category: 'AI-Enhanced Repair Guidance',
    features: [
      'AI value-added enhancements per step',
      'Safety warnings and precautions',
      'Tool requirements per step',
      'Real-time spec and TSB lookup',
      'Multi-vehicle and multi-system support',
    ],
  },
  {
    category: 'Voice AI Assistant',
    features: [
      'Voice-guided repair assistance',
      'Hands-free step-by-step job coaching',
      'Voice-controlled step navigation',
      'Real-time voice Q&A during repairs',
      'AI diagnosis assistant',
      'Dashboard voice navigation and queries',
    ],
  },
  {
    category: 'Documentation & Reporting',
    features: [
      'AI-generated RO narratives (Concern / Cause / Correction)',
      'OEM warranty-grade documentation',
      'Automated technician notes and observations',
      'Job history and cloud storage',
      'Repair report export',
    ],
  },
  {
    category: 'Hardware & Platform',
    features: [
      'iOS mobile app (native)',
      'Web browser access',
      'Flic wireless button integration',
      'Bluetooth audio support',
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Starter Pack (shared between tabs)                                 */
/* ------------------------------------------------------------------ */

function StarterPack() {
  return (
    <section className="px-4 mb-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-safety-500/30 bg-gradient-to-br from-carbon-800/80 via-carbon-800/60 to-safety-500/5"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-safety-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-electric-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety-500/15 border border-safety-500/30 mb-6"
                >
                  <Package className="w-4 h-4 text-safety-400" />
                  <span className="text-sm font-semibold text-safety-400 tracking-wider uppercase">
                    Starter Pack
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                >
                  Everything you need.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                    One price.
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-carbon-300 text-lg mb-8 max-w-xl"
                >
                  Get the Flic hands-free button and 3 months of Pro-level access.
                  Try voice-first repairs risk-free — if it doesn't change how you work,
                  you've lost nothing.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 mb-8"
                >
                  {[
                    'Flic wireless button included',
                    '3 months of Pro plan (10 hrs/mo)',
                    'All features unlocked from day one',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-safety-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-safety-400" />
                      </div>
                      <span className="text-carbon-200">{item}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety"
                  >
                    Get the Starter Pack
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="flex-shrink-0 w-full max-w-sm"
              >
                <div className="p-8 rounded-2xl bg-carbon-900/80 border border-safety-500/20 text-center">
                  <div className="text-carbon-400 text-sm mb-2 line-through">$346 value</div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-6xl md:text-7xl font-bold text-white">$99</span>
                  </div>
                  <div className="text-carbon-400 mb-6">one-time to get started</div>
                  <div className="h-px bg-carbon-700/50 mb-6" />
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-electric-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Flic Button</div>
                        <div className="text-carbon-400 text-sm">Wireless hands-free control</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-safety-500/10 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-safety-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">3 Months Pro</div>
                        <div className="text-carbon-400 text-sm">30 total Voice AI hours</div>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-carbon-700/50 my-6" />
                  <p className="text-carbon-500 text-xs">
                    After 90 days, continues at $99/mo Pro plan. Cancel anytime.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Grid (shared)                                              */
/* ------------------------------------------------------------------ */

function FeatureGrid() {
  return (
    <section className="px-4 pb-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
            What's Included
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            Everything in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              Every Plan
            </span>
          </h2>
          <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
            No feature gates, no upsells. Every plan gets the full OnRamp platform.
          </p>
        </motion.div>

        <div className="space-y-10">
          {featureCategories.map((cat, catIndex) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                    viewport={{ once: true }}
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
/*  Individual Pricing Tab                                             */
/* ------------------------------------------------------------------ */

function IndividualPricing() {
  return (
    <>
      <StarterPack />

      {/* Monthly Plans */}
      <section className="px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Every plan includes the full feature set. The only difference is how many hours of Voice AI you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {tierConfigs.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-safety-500/10 to-carbon-800/80 border-2 border-safety-500/40 scale-[1.02]'
                    : 'bg-carbon-800/50 border border-carbon-700/50 hover:border-electric-500/30'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-safety-500 to-safety-600 text-white text-sm font-semibold shadow-lg shadow-safety-500/30">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  tier.highlight
                    ? 'bg-safety-500/10 text-safety-400'
                    : 'bg-electric-500/10 text-electric-400'
                }`}>
                  <tier.icon className="w-6 h-6" />
                </div>

                <h3 className="text-white font-bold text-2xl mb-2">{tier.name}</h3>

                <div className="flex items-baseline gap-1 mb-1">
                  {tier.originalPricePerSeat && (
                    <span className="text-carbon-500 text-lg line-through mr-1">${tier.originalPricePerSeat}</span>
                  )}
                  <span className="text-4xl font-bold text-white">${tier.pricePerSeat}</span>
                  <span className="text-carbon-400">/mo</span>
                </div>

                <div className={`text-sm font-semibold mb-4 ${
                  tier.highlight ? 'text-safety-400' : 'text-electric-400'
                }`}>
                  {tier.hoursPerSeat === Infinity ? 'Unlimited' : tier.hoursPerSeat} Voice AI hours / mo
                </div>

                <p className="text-carbon-400 text-sm mb-6">{tier.description}</p>

                <div className={`rounded-xl p-4 mb-6 ${
                  tier.highlight
                    ? 'bg-safety-500/5 border border-safety-500/20'
                    : 'bg-carbon-700/30 border border-carbon-700/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-carbon-400" />
                    <span className="text-carbon-200 text-sm font-medium">Voice AI Usage</span>
                  </div>
                  <div className="text-carbon-300 text-sm space-y-1">
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

                <Link
                  to="/contact"
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white shadow-lg shadow-safety-500/20'
                      : 'bg-carbon-700/50 hover:bg-carbon-600/50 text-white border border-carbon-600/50 hover:border-carbon-500/50'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Service Center Pricing Tab                                         */
/* ------------------------------------------------------------------ */

function ServiceCenterPricing() {
  const [numTechs, setNumTechs] = useState(10);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro' | 'unlimited'>('pro');

  // [PostHog] Debounced tracking — captures configurator state 2s after last change
  const configTrackRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tier = tierConfigs.find((t) => t.key === selectedTier)!;
  const c = tierColors[selectedTier];
  const totalPrice = numTechs * tier.pricePerSeat;
  const totalHours = tier.hoursPerSeat === Infinity ? Infinity : numTechs * tier.hoursPerSeat;
  const isUnlimited = tier.hoursPerSeat === Infinity;

  // Strikethrough for unlimited
  const showStrikethrough = isUnlimited && tier.originalPricePerSeat;
  const strikethroughTotal = showStrikethrough ? numTechs * tier.originalPricePerSeat! : 0;

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

  // Color-keyed selector highlight classes per tier
  const selectorColors: Record<string, { selected: string; icon: string; text: string }> = {
    basic:     { selected: `${tierColors.basic.bg} border-2 ${tierColors.basic.border} ring-1 ${tierColors.basic.ring}`, icon: `${tierColors.basic.bgSubtle} ${tierColors.basic.text}`, text: tierColors.basic.text },
    pro:       { selected: `${tierColors.pro.bg} border-2 ${tierColors.pro.border} ring-1 ${tierColors.pro.ring}`, icon: `${tierColors.pro.bgSubtle} ${tierColors.pro.text}`, text: tierColors.pro.text },
    unlimited: { selected: `${tierColors.unlimited.bg} border-2 ${tierColors.unlimited.border} ring-1 ${tierColors.unlimited.ring}`, icon: `${tierColors.unlimited.bgSubtle} ${tierColors.unlimited.text}`, text: tierColors.unlimited.text },
  };

  return (
    <>
      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Choose the number of technician seats and a usage level.
              Every seat gets full access — the pool of Voice AI hours is shared across your team.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* Left: Controls (3 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 space-y-8"
            >
              {/* Technician Seats — on top */}
              <div className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50">
                <h3 className="text-white font-bold text-lg mb-2">Technician Seats</h3>
                <p className="text-carbon-400 text-sm mb-6">
                  The number of technicians with access to OnRamp.
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
                  max="25"
                  value={numTechs}
                  onChange={(e) => setNumTechs(Number(e.target.value))}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, var(${c.sliderFrom}), var(${c.sliderTo}))` }}
                />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>5 techs</span>
                  <span>25 techs</span>
                </div>

                {/* Shared Voice AI Pool */}
                <div className="mt-6">
                  <div className="p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                    <p className={`${c.text} text-sm font-semibold mb-1`}>Shared Voice AI Pool</p>
                    <p className="text-white font-bold text-xl mb-2">
                      {isUnlimited ? 'Unlimited' : `${totalHours} hrs/mo`}
                    </p>
                    {!isUnlimited && (
                      <p className="text-carbon-500 text-xs">
                        {tier.hoursPerSeat} hrs x {numTechs} techs
                      </p>
                    )}
                    <p className="text-carbon-400 text-xs mt-2">
                      Hours are pooled across your team — if one tech uses less, others can use more. No hours go to waste.
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Level Selector — below */}
              <div className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50">
                <h3 className="text-white font-bold text-lg mb-2">Usage Level</h3>
                <p className="text-carbon-400 text-sm mb-6">
                  Determines the Voice AI hours included per technician each month.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {tierConfigs.map((t) => {
                    const isSelected = selectedTier === t.key;
                    const sc = selectorColors[t.key];
                    const isTierUnlimited = t.key === 'unlimited';
                    return (
                      <button
                        key={t.key}
                        onClick={() => setSelectedTier(t.key)}
                        className={`relative p-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? sc.selected
                            : 'bg-carbon-700/30 border border-carbon-700/50 hover:border-carbon-600/80'
                        }`}
                      >
                        {t.badge && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-safety-500 to-safety-600 text-white text-[10px] font-semibold whitespace-nowrap">
                            {t.badge}
                          </span>
                        )}
                        <div className={`inline-flex p-2 rounded-lg mb-2 ${
                          isSelected ? sc.icon : 'bg-carbon-600/30 text-carbon-400'
                        }`}>
                          <t.icon className="w-4 h-4" />
                        </div>
                        <div className="text-white font-semibold text-sm">{t.name}</div>
                        <div className={`text-xs font-medium mt-0.5 ${
                          isSelected ? sc.text : 'text-carbon-500'
                        }`}>
                          {t.hoursPerSeat === Infinity ? 'Unlimited hrs' : `${t.hoursPerSeat} hrs`}/tech/mo
                        </div>
                        <div className="text-carbon-400 text-xs mt-1">
                          {isTierUnlimited && t.originalPricePerSeat ? (
                            <>
                              <span className="line-through text-carbon-500">${t.originalPricePerSeat}</span>{' '}
                              <span className="text-green-400 font-semibold">${t.pricePerSeat}</span>/seat
                            </>
                          ) : (
                            <>${t.pricePerSeat}/seat/mo</>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right: Summary Card (2 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
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
                    {showStrikethrough && (
                      <div className="text-carbon-500 text-lg line-through mb-1">
                        ${strikethroughTotal.toLocaleString()}/mo
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-5xl md:text-6xl font-bold text-white">
                        ${totalPrice.toLocaleString()}
                      </span>
                      <span className="text-carbon-400 text-lg">/mo</span>
                    </div>
                    {showStrikethrough && (
                      <span className={`inline-block px-2 py-0.5 rounded-full ${c.saveBg} ${c.saveText} text-xs font-semibold`}>
                        Save ${(strikethroughTotal - totalPrice).toLocaleString()}/mo
                      </span>
                    )}
                  </motion.div>

                  <p className="text-carbon-400 text-sm mt-3">
                    {numTechs} seats x{' '}
                    {showStrikethrough ? (
                      <>
                        <span className="line-through text-carbon-500">${tier.originalPricePerSeat}</span>{' '}
                        <span className={c.saveText}>${tier.pricePerSeat}</span>
                      </>
                    ) : (
                      <>${tier.pricePerSeat}</>
                    )}
                    /seat
                  </p>
                </div>

                <div className="h-px bg-carbon-700/50 mb-6" />

                {/* Summary details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-300 text-sm">Technician seats</span>
                    <span className="text-white font-semibold">{numTechs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-300 text-sm">Shared Voice AI pool</span>
                    <span className="text-white font-semibold">
                      {isUnlimited ? 'Unlimited' : `${totalHours} hrs/mo`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-carbon-300 text-sm">Per-seat cost</span>
                    <span className="text-white font-semibold">
                      {showStrikethrough ? (
                        <>
                          <span className="line-through text-carbon-500 mr-1">${tier.originalPricePerSeat}</span>
                          ${tier.pricePerSeat}/mo
                        </>
                      ) : (
                        <>${tier.pricePerSeat}/mo</>
                      )}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="flex justify-between items-center">
                      <span className="text-carbon-300 text-sm">Avg hours per tech</span>
                      <span className="text-white font-semibold">{tier.hoursPerSeat} hrs/mo</span>
                    </div>
                  )}
                </div>

                {/* Additional hours callout */}
                {!isUnlimited && (
                  <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-700/50 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-carbon-400" />
                      <span className="text-carbon-200 text-sm font-medium">Need more hours?</span>
                    </div>
                    <p className="text-carbon-400 text-sm">
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
                      <span className="text-carbon-400">
                        You spend ${annualCost.toLocaleString()}/yr
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${c.saveBg} ${c.saveText} font-semibold`}>
                        {roiMultiple}x ROI
                      </span>
                    </div>
                  </motion.div>
                  <p className="text-carbon-500 text-[10px] mt-2">
                    *Assumes {efficiencyPct}% efficiency gain + {Math.round(warrantyBump * 100)}% warranty approval improvement at ${ROI_SHOP_RATE}/hr
                  </p>
                </div>

                <div className="mt-auto">
                  <Link
                    to="/contact"
                    className={`group flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r ${c.btnGradient} ${c.btnHover} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${c.shadow}`}
                  >
                    Contact Sales
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <p className="text-carbon-500 text-xs text-center mt-4">
                    All features included. No per-feature charges.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Pricing Page                                                  */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
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
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-electric-400 text-sm font-semibold tracking-wider uppercase"
          >
            Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            Simple Plans.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              Full Power.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-carbon-300 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Every plan includes every feature. The only difference is how many
            hours of Voice AI you need each month.
          </motion.p>
        </div>
      </section>

      {/* Tab Toggle */}
      <section className="px-4 mb-16">
        <div className="max-w-md mx-auto">
          <div className="flex p-1.5 rounded-xl bg-carbon-800/60 border border-carbon-700/50">
            <button
              onClick={() => { setTab('individual'); trackPricingTabSwitch('individual'); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                tab === 'individual'
                  ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                  : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => { setTab('service-center'); trackPricingTabSwitch('service-center'); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                tab === 'service-center'
                  ? 'bg-safety-500/15 text-safety-400 border border-safety-500/30'
                  : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Service Center
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
            viewport={{ once: true }}
            className="text-center p-10 md:p-16 rounded-3xl bg-gradient-to-br from-carbon-800/80 to-carbon-800/40 border border-carbon-700/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to stop the paperwork tax?
            </h2>
            <p className="text-carbon-300 text-lg mb-8 max-w-xl mx-auto">
              Get started with the Starter Pack or pick the monthly plan that fits your workflow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-carbon-700/50 hover:bg-carbon-600/50 text-white font-semibold rounded-xl border border-carbon-600/50 hover:border-carbon-500/50 transition-all duration-300"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
