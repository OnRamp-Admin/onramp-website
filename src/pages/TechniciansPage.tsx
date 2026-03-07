import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Mic, Clock, Zap, Wrench, DollarSign, TrendingUp, Check,
  ArrowRight, Package, Crown, Infinity,
} from 'lucide-react';

// Technician ROI constants
const FLAT_RATE_AVG = 28;
const WEEKS_PER_MONTH = 4.33;

const benefits = [
  {
    icon: Clock,
    title: 'Stop the Paperwork Tax',
    description:
      'Eliminate the back-and-forth between the vehicle and the service terminal. Stay in the bay where you make money.',
    highlight: '15-20 min saved per job',
  },
  {
    icon: Mic,
    title: 'Hands Stay on the Job',
    description:
      'Speak repairs as you work. No greasy keyboards, no dropped phones. Your voice is your interface.',
    highlight: 'Truly hands-free',
  },
  {
    icon: Zap,
    title: 'Instant Spec Access',
    description:
      'Torque specs, fluid capacities, wiring diagrams—all delivered by voice while you\'re under the hood.',
    highlight: 'Real-time answers',
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
    description: 'For the tech who wants to try voice-first repairs on lighter workloads.',
    icon: Zap,
    highlight: false,
  },
  {
    name: 'Pro',
    price: 99,
    hours: '10',
    hoursLabel: 'Voice AI hours / mo',
    description: 'The standard for shop professionals running full days under the hood.',
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
    description: 'For power users who never want to think about limits.',
    icon: Infinity,
    highlight: false,
  },
];

export default function TechniciansPage() {
  const [prepTimeSaved, setPrepTimeSaved] = useState(10);
  const [docTimeSaved, setDocTimeSaved] = useState(8);

  const totalMinutesSavedPerJob = prepTimeSaved + docTimeSaved;
  const dailyMinutesSaved = totalMinutesSavedPerJob * 4;
  const weeklyHoursSaved = (dailyMinutesSaved * 5) / 60;
  const additionalBillableHoursWeekly = weeklyHoursSaved * 0.8;
  const monthlyIncomeBoost = additionalBillableHoursWeekly * FLAT_RATE_AVG * WEEKS_PER_MONTH;
  const yearlyIncomeBoost = monthlyIncomeBoost * 12;

  return (
    <div className="pt-16">
      {/* Hero */}
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
            More Wrenching.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
              More Earning.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-carbon-300 mb-8 max-w-3xl mx-auto"
          >
            Every minute at the terminal is a minute not turning a wrench.
            OnRamp keeps you where the money is—under the hood.
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
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-electric-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4 group-hover:bg-electric-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{benefit.title}</h3>
                <p className="text-carbon-400 mb-4">{benefit.description}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-electric-500/10 text-electric-400 text-sm font-medium">
                  {benefit.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 carbon-fiber-bg relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calculate Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                Take-Home Boost
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              See how much more you could be earning with the time OnRamp saves you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-electric-500/20">
                  <Clock className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Time Savings</h3>
                  <p className="text-carbon-400 text-sm">Adjust per your workflow</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Minutes saved per job
                    <span className="block text-carbon-500 text-sm font-normal">(Avoiding PC/reference lookups)</span>
                  </label>
                  <span className="text-electric-400 font-bold text-2xl">{prepTimeSaved}m</span>
                </div>
                <input type="range" min="0" max="30" value={prepTimeSaved} onChange={(e) => setPrepTimeSaved(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>0 min</span><span>30 min</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-carbon-200 font-medium">
                    Minutes saved on documentation
                    <span className="block text-carbon-500 text-sm font-normal">(RO writing & story time)</span>
                  </label>
                  <span className="text-electric-400 font-bold text-2xl">{docTimeSaved}m</span>
                </div>
                <input type="range" min="0" max="20" value={docTimeSaved} onChange={(e) => setDocTimeSaved(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-carbon-500 text-xs mt-1">
                  <span>0 min</span><span>20 min</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/30">
                <div>
                  <p className="text-carbon-500 text-sm">Daily time saved</p>
                  <p className="text-white font-bold text-xl">{Math.round(dailyMinutesSaved)} min</p>
                </div>
                <div>
                  <p className="text-carbon-500 text-sm">Weekly hours saved</p>
                  <p className="text-white font-bold text-xl">{weeklyHoursSaved.toFixed(1)} hrs</p>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-electric-900/40 to-electric-950/40 border border-electric-500/30"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-electric-500/20">
                  <DollarSign className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Your Take-Home Boost</h3>
                  <p className="text-carbon-400 text-sm">Based on ${FLAT_RATE_AVG}/hr flat rate</p>
                </div>
              </div>

              <div className="text-center py-8">
                <motion.div key={monthlyIncomeBoost} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-300 to-electric-500">
                    ${Math.round(monthlyIncomeBoost).toLocaleString()}
                  </span>
                  <span className="text-electric-400 text-2xl font-semibold">/mo</span>
                </motion.div>
                <p className="text-carbon-400">Potential monthly income boost</p>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-electric-400" />
                    <span className="text-carbon-200">Additional billable hours/week</span>
                  </div>
                  <span className="text-electric-400 font-bold">+{additionalBillableHoursWeekly.toFixed(1)} hrs</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-carbon-900/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-carbon-200">Yearly income potential</span>
                  </div>
                  <span className="text-green-400 font-bold">+${Math.round(yearlyIncomeBoost).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-carbon-500 text-xs mt-6 text-center">
                * Based on 4 jobs/day, 5 days/week. Actual results vary by shop and workload.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Starter Pack */}
      <section className="py-20 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-safety-500/30 bg-gradient-to-br from-carbon-800/80 via-carbon-800/60 to-safety-500/5"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-safety-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-electric-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety-500/15 border border-safety-500/30 mb-6">
                    <Package className="w-4 h-4 text-safety-400" />
                    <span className="text-sm font-semibold text-safety-400 tracking-wider uppercase">Starter Pack</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Everything you need.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">One price.</span>
                  </h2>

                  <p className="text-carbon-300 text-lg mb-8 max-w-xl">
                    Get the Flic hands-free button and 3 months of Pro-level access.
                    Try voice-first repairs risk-free.
                  </p>

                  <div className="space-y-3 mb-8">
                    {['Flic wireless button included', '3 months of Pro plan (10 hrs/mo)', 'All features unlocked from day one'].map((item) => (
                      <div key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-safety-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-safety-400" />
                        </div>
                        <span className="text-carbon-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  <a href="/contact" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety">
                    Get the Starter Pack
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                <div className="flex-shrink-0 w-full max-w-sm">
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
                    <p className="text-carbon-500 text-xs">After 90 days, continues at $99/mo Pro plan. Cancel anytime.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Monthly <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">Plans</span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Every plan includes the full feature set. The only difference is how many hours of Voice AI you need.
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
                <div className={`inline-flex p-3 rounded-xl mb-4 ${tier.highlight ? 'bg-safety-500/10 text-safety-400' : 'bg-electric-500/10 text-electric-400'}`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {tier.originalPrice && <span className="text-carbon-500 text-lg line-through mr-1">${tier.originalPrice}</span>}
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-carbon-400">/mo</span>
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
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>

          {/* Feature list */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-center text-white font-bold text-xl mb-8">All plans include everything</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-electric-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-electric-400" />
                  </div>
                  <span className="text-carbon-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
