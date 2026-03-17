import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import {
  Building2, TrendingUp, Shield, DollarSign, Users,
  ClipboardCheck, FileCheck, AlertTriangle, Target, ArrowRight, Calculator,
} from 'lucide-react';
import { trackCalculatorValues } from '../lib/analytics';

// Manager ROI constants
const HOURS_PER_WEEK = 40;
const WEEKS_PER_YEAR = 52;
const AVG_BILLABLE_RATE = 125;
const WARRANTY_WORK_SHARE = 0.25;

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


export default function ManagersPage() {
  const [efficiencyGain, setEfficiencyGain] = useState(12);
  const [warrantyBump, setWarrantyBump] = useState(4);
  const [numTechnicians, setNumTechnicians] = useState(4);

  // [PostHog] Track calculator values 2s after last slider change (debounced)
  const trackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasInteractedRef = useRef(false);

  const currentCapacity = numTechnicians * HOURS_PER_WEEK * WEEKS_PER_YEAR;
  const additionalCapacity = currentCapacity * (efficiencyGain / 100);
  const revenueFromCapacity = additionalCapacity * AVG_BILLABLE_RATE;
  const warrantyHours = currentCapacity * WARRANTY_WORK_SHARE;
  const warrantyRevenue = warrantyHours * AVG_BILLABLE_RATE;
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
        values: { efficiencyGain, warrantyBump, numTechnicians },
        result: Math.round(totalAnnualUnlocked),
      });
    }, 2000);
    return () => clearTimeout(trackTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [efficiencyGain, warrantyBump, numTechnicians]);

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
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              See the revenue opportunity OnRamp unlocks for your service department.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <TrendingUp className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Shop Profit Calculator</h3>
                  <p className="text-carbon-400 text-sm">Find your hidden capacity</p>
                </div>
              </div>

              {/* Efficiency Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Overall shop efficiency gain
                    <span className="block text-carbon-500 text-sm font-normal">
                      (Industry avg: 10-15%)
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
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>5%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Warranty Recovery Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Warranty recovery from improved documentation
                    <span className="block text-carbon-500 text-sm font-normal">
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
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Technicians Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Number of technicians
                  </label>
                  <span className="text-safety-400 font-bold text-2xl">{numTechnicians}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={numTechnicians}
                  onChange={(e) => setNumTechnicians(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-safety-600), var(--color-safety-500))`,
                  }}
                />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>1 tech</span>
                  <span>100 techs</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                <div>
                  <p className="text-carbon-500 text-sm">Current annual capacity</p>
                  <p className="text-white font-bold text-xl">
                    {currentCapacity.toLocaleString()} hrs
                  </p>
                </div>
                <div>
                  <p className="text-carbon-500 text-sm">Found capacity</p>
                  <p className="text-white font-bold text-xl">
                    +{Math.round(additionalCapacity).toLocaleString()} hrs
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-safety-900/40 to-safety-950/40 border border-safety-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-safety-500/20">
                  <DollarSign className="w-6 h-6 text-safety-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Hidden Revenue Unlocked</h3>
                  <p className="text-carbon-400 text-sm">Annual shop profit potential</p>
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
                <p className="text-carbon-400">Total revenue opportunity</p>
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

              <p className="text-carbon-500 text-xs mt-6 text-center">
                * Based on ${AVG_BILLABLE_RATE}/hr shop rate, 25% warranty work volume.
              </p>
            </motion.div>
          </div>

          {/* Bottom Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-carbon-300 text-lg mb-6">
              These aren't hypothetical numbers. This is{' '}
              <span className="text-white font-semibold">found capacity</span>—revenue that's already
              walking out the door.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center p-10 md:p-16 rounded-3xl bg-gradient-to-br from-carbon-800/80 to-carbon-800/40 border border-safety-500/30">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety-500/10 border border-safety-500/30 mb-6">
              <Building2 className="w-4 h-4 text-safety-400" />
              <span className="text-sm font-semibold text-safety-400 tracking-wider uppercase">
                Service Center Pricing
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Plans for Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">Team</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto mb-4">
              Choose the number of technician seats and a usage level.
              The pool of Voice AI hours is shared across your entire team.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { label: 'Basic', detail: '3 hrs/tech/mo', price: '$39/seat' },
                { label: 'Pro', detail: '10 hrs/tech/mo', price: '$99/seat' },
                { label: 'Unlimited', detail: 'Unlimited hrs', price: '$199/seat' },
              ].map((t) => (
                <div key={t.label} className="p-3 rounded-xl bg-carbon-900/50 border border-carbon-700/30 text-center">
                  <div className="text-white font-semibold text-sm">{t.label}</div>
                  <div className="text-safety-400 text-xs font-medium">{t.detail}</div>
                  <div className="text-carbon-400 text-xs mt-1">{t.price}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/pricing"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/pricing#service-center';
                }}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety"
              >
                Build Your Shop Plan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/contact" className="text-safety-400 hover:text-safety-300 font-semibold underline underline-offset-4 transition-colors">
                Or talk to our team
              </a>
            </div>
            <p className="text-carbon-500 text-sm mt-6">
              Multi-location groups — contact us for volume pricing.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
