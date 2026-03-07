import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Building2, TrendingUp, Shield, DollarSign, Users, Check,
  ClipboardCheck, FileCheck, AlertTriangle, Target, Zap, Crown, Infinity,
} from 'lucide-react';

// Manager ROI constants
const HOURS_PER_WEEK = 40;
const WEEKS_PER_YEAR = 52;
const AVG_BILLABLE_RATE = 125;
const WARRANTY_WORK_SHARE = 0.25;
const WARRANTY_APPROVAL_BUMP = 0.05;

const benefits = [
  {
    icon: TrendingUp,
    title: 'Found Capacity',
    description:
      'Turn 10-15% efficiency gains into pure shop profit without hiring more staff. Fill bays faster.',
    highlight: 'No additional headcount',
  },
  {
    icon: Shield,
    title: 'The Warranty Edge',
    description:
      'Ultra-accurate, professional RO reports that meet every OEM documentation requirement automatically.',
    highlight: 'Reduced claim rejections',
  },
  {
    icon: DollarSign,
    title: 'Maximum OEM Payouts',
    description:
      'Proper labor code matching, detailed cause-and-correction narratives. Get paid for every warranty minute.',
    highlight: 'Recover lost revenue',
  },
];

const warrantyFeatures = [
  {
    icon: ClipboardCheck,
    title: 'Auto-Matched Labor Codes',
    description: 'AI matches your verbal repairs to the correct OEM labor operations instantly.',
  },
  {
    icon: FileCheck,
    title: 'Complete 3C Documentation',
    description: 'Cause, Correction, Concern—automatically structured from natural speech.',
  },
  {
    icon: AlertTriangle,
    title: 'Pre-Submission Validation',
    description: 'Catch missing fields and documentation gaps before they become rejected claims.',
  },
  {
    icon: Target,
    title: 'OEM-Specific Formatting',
    description: 'Templates aligned to manufacturer requirements for GM, Ford, Toyota, Honda, and more.',
  },
];

const features = [
  'Voice-guided repair assistance',
  'Hands-free Flic button control',
  'AI-generated RO narratives',
  'Real-time spec & TSB lookup',
  'Step-by-step job coaching',
  'OEM warranty documentation',
  'Multi-vehicle support',
  'Cloud job history & analytics',
];

const tiers = [
  {
    name: 'Basic',
    price: 39,
    hours: '3',
    hoursLabel: 'Voice AI hours / mo',
    perSeat: true,
    description: 'For shops testing the waters with voice-first repairs.',
    icon: Zap,
    highlight: false,
  },
  {
    name: 'Pro',
    price: 99,
    hours: '10',
    hoursLabel: 'Voice AI hours / mo',
    perSeat: true,
    description: 'The standard for professional service departments.',
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Unlimited',
    price: 199,
    originalPrice: 249,
    hours: 'Unlimited',
    hoursLabel: 'Voice AI hours / mo',
    perSeat: true,
    description: 'For high-volume departments that never want to think about limits.',
    icon: Infinity,
    highlight: false,
  },
];

export default function ManagersPage() {
  const [efficiencyGain, setEfficiencyGain] = useState(12);
  const [numTechnicians, setNumTechnicians] = useState(4);

  const currentCapacity = numTechnicians * HOURS_PER_WEEK * WEEKS_PER_YEAR;
  const additionalCapacity = currentCapacity * (efficiencyGain / 100);
  const revenueFromCapacity = additionalCapacity * AVG_BILLABLE_RATE;
  const warrantyHours = currentCapacity * WARRANTY_WORK_SHARE;
  const warrantyRevenue = warrantyHours * AVG_BILLABLE_RATE;
  const warrantyRecovery = warrantyRevenue * WARRANTY_APPROVAL_BUMP;
  const totalAnnualUnlocked = revenueFromCapacity + warrantyRecovery;

  return (
    <div className="pt-16">
      {/* Hero */}
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
            Unlock Hidden{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
              Shop Profit
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-carbon-300 mb-8 max-w-3xl mx-auto"
          >
            Your techs aren't lazy. They're buried in documentation.
            Free them up and watch your throughput—and your bottom line—climb.
          </motion.p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-safety-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-safety-500/10 text-safety-400 mb-4 group-hover:bg-safety-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{benefit.title}</h3>
                <p className="text-carbon-400 mb-4">{benefit.description}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-safety-500/10 text-safety-400 text-sm font-medium">
                  {benefit.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Deep Dive */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-900 to-carbon-950">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-green-400 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              The Warranty Advantage
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Stop Leaving Money on the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-electric-400">OEM's Table</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Poor documentation costs shops thousands in rejected warranty claims every year.
              OnRamp writes RO narratives that get approved the first time.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { stat: '25%+', label: 'Typical OEM warranty work share' },
              { stat: '30%', label: 'First-submission decline rate' },
              { stat: '15%', label: 'Claims ultimately never paid' },
              { stat: '5%+', label: 'OnRamp approval rate improvement' },
            ].map((item, index) => (
              <div key={item.label} className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700/30 text-center">
                <motion.div initial={{ scale: 0.5 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1, type: 'spring' }} className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                  {item.stat}
                </motion.div>
                <p className="text-carbon-400 text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {warrantyFeatures.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex gap-4 p-6 rounded-2xl bg-carbon-800/30 border border-carbon-700/30">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-carbon-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sample RO */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-16 p-6 md:p-8 rounded-2xl bg-carbon-800/50 border border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">Sample Warranty-Ready RO Line</span>
            </div>
            <div className="font-mono text-sm space-y-3">
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-electric-500">
                <span className="text-carbon-500">CONCERN:</span>
                <span className="text-carbon-200 ml-2">Customer states vehicle intermittent no-start condition, occurs after sitting overnight</span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-safety-500">
                <span className="text-carbon-500">CAUSE:</span>
                <span className="text-carbon-200 ml-2">Found B+ battery cable terminal end severely corroded, causing voltage drop of 2.3V under load. Parasitic draw within spec at 32mA.</span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-green-500">
                <span className="text-carbon-500">CORRECTION:</span>
                <span className="text-carbon-200 ml-2">Replaced B+ cable terminal end per TSB 19-NA-123. Cleaned battery posts, applied dielectric grease. Load tested battery at 625 CCA (spec: 600 CCA). System operates as designed.</span>
              </div>
            </div>
            <p className="text-carbon-500 text-sm mt-4">* Generated automatically from technician voice notes during repair</p>
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 carbon-fiber-bg relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-safety-500/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calculate Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">Hidden Revenue</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              See the revenue opportunity OnRamp unlocks for your service department.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <TrendingUp className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Shop Profit Calculator</h3>
                  <p className="text-carbon-400 text-sm">Find your hidden capacity</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Overall shop efficiency gain
                    <span className="block text-carbon-500 text-sm font-normal">(Industry avg: 10-15%)</span>
                  </label>
                  <span className="text-safety-400 font-bold text-2xl">{efficiencyGain}%</span>
                </div>
                <input type="range" min="5" max="25" value={efficiencyGain} onChange={(e) => setEfficiencyGain(Number(e.target.value))} className="w-full" style={{ background: 'linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))' }} />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>5%</span><span>25%</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">Number of technicians</label>
                  <span className="text-safety-400 font-bold text-2xl">{numTechnicians}</span>
                </div>
                <input type="range" min="1" max="20" value={numTechnicians} onChange={(e) => setNumTechnicians(Number(e.target.value))} className="w-full" style={{ background: 'linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))' }} />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>1 tech</span><span>20 techs</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                <div>
                  <p className="text-carbon-500 text-sm">Current annual capacity</p>
                  <p className="text-white font-bold text-xl">{currentCapacity.toLocaleString()} hrs</p>
                </div>
                <div>
                  <p className="text-carbon-500 text-sm">Found capacity</p>
                  <p className="text-white font-bold text-xl">+{Math.round(additionalCapacity).toLocaleString()} hrs</p>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-safety-900/40 to-safety-950/40 border border-safety-500/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <DollarSign className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Hidden Revenue Unlocked</h3>
                  <p className="text-carbon-400 text-sm">Annual shop profit potential</p>
                </div>
              </div>

              <div className="text-center py-8">
                <motion.div key={totalAnnualUnlocked} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-safety-300 to-safety-500">
                    ${Math.round(totalAnnualUnlocked).toLocaleString()}
                  </span>
                  <span className="text-safety-400 text-2xl font-semibold">/yr</span>
                </motion.div>
                <p className="text-carbon-400">Total revenue opportunity</p>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-safety-400" />
                    <span className="text-carbon-200">From efficiency gains</span>
                  </div>
                  <span className="text-safety-400 font-bold">+${Math.round(revenueFromCapacity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-carbon-200">Warranty recovery**</span>
                  </div>
                  <span className="text-green-400 font-bold">+${Math.round(warrantyRecovery).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-carbon-500 text-xs mt-6 text-center">
                * Based on ${AVG_BILLABLE_RATE}/hr shop rate.
                <br />
                ** Assumes 5% bump in warranty approvals for a shop that does 25% warranty work volume.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Plans for Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">Team</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Per-seat pricing. Every plan includes the full feature set—the only difference is Voice AI hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-safety-500/10 to-carbon-800/80 border-2 border-safety-500/40 scale-[1.02]'
                    : 'bg-carbon-800/50 border border-carbon-700/50 hover:border-safety-500/30'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-safety-500 to-safety-600 text-white text-sm font-semibold shadow-lg shadow-safety-500/30">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className={`inline-flex p-3 rounded-xl mb-4 ${tier.highlight ? 'bg-safety-500/10 text-safety-400' : 'bg-electric-500/10 text-electric-400'}`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {tier.originalPrice && <span className="text-carbon-500 text-lg line-through mr-1">${tier.originalPrice}</span>}
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-carbon-400">/mo per seat</span>
                </div>
                <div className={`text-sm font-semibold mb-4 ${tier.highlight ? 'text-safety-400' : 'text-electric-400'}`}>
                  {tier.hours} {tier.hoursLabel}
                </div>
                <p className="text-carbon-400 text-sm mb-6">{tier.description}</p>
                <a href="/contact" className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white shadow-lg shadow-safety-500/20'
                    : 'bg-carbon-700/50 hover:bg-carbon-600/50 text-white border border-carbon-600/50 hover:border-carbon-500/50'
                }`}>
                  Contact Sales
                </a>
              </motion.div>
            ))}
          </div>

          {/* Feature list */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-center text-white font-bold text-xl mb-8">Every seat includes all features</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-safety-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-safety-400" />
                  </div>
                  <span className="text-carbon-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <p className="text-carbon-300 text-lg mb-6">
              Need a custom plan for a multi-location group?{' '}
              <a href="/contact" className="text-safety-400 hover:text-safety-300 font-semibold underline underline-offset-4 transition-colors">
                Talk to our team
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
