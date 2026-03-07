import { motion } from 'framer-motion';
import { Check, Package, Zap, Crown, Infinity, ArrowRight } from 'lucide-react';

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
    color: 'electric',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 99,
    hours: '10',
    hoursLabel: 'Voice AI hours / mo',
    description: 'The standard for shop professionals running full days under the hood.',
    icon: Crown,
    color: 'safety',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Unlimited',
    price: 199,
    originalPrice: 249,
    hours: 'Unlimited',
    hoursLabel: 'Voice AI hours / mo',
    description: 'For power users and high-volume shops that never want to think about limits.',
    icon: Infinity,
    color: 'electric',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-carbon-950 to-carbon-900">
      <div className="max-w-6xl mx-auto">

        {/* Starter Pack — Full Width Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-20 overflow-hidden rounded-3xl border border-safety-500/30 bg-gradient-to-br from-carbon-800/80 via-carbon-800/60 to-safety-500/5"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-safety-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-electric-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

              {/* Left: Content */}
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
                  Try voice-first repairs risk-free—if it doesn't change how you work,
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

                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  href="#contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety"
                >
                  Get the Starter Pack
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>

              {/* Right: Price Card */}
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

        {/* Section Header */}
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

        {/* Pricing Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
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

              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                tier.highlight
                  ? 'bg-safety-500/10 text-safety-400'
                  : 'bg-electric-500/10 text-electric-400'
              }`}>
                <tier.icon className="w-6 h-6" />
              </div>

              <h3 className="text-white font-bold text-2xl mb-2">{tier.name}</h3>

              <div className="flex items-baseline gap-1 mb-1">
                {tier.originalPrice && (
                  <span className="text-carbon-500 text-lg line-through mr-1">${tier.originalPrice}</span>
                )}
                <span className="text-4xl font-bold text-white">${tier.price}</span>
                <span className="text-carbon-400">/mo</span>
              </div>

              <div className={`text-sm font-semibold mb-4 ${
                tier.highlight ? 'text-safety-400' : 'text-electric-400'
              }`}>
                {tier.hours} {tier.hoursLabel}
              </div>

              <p className="text-carbon-400 text-sm mb-6">{tier.description}</p>

              <a
                href="#contact"
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white shadow-lg shadow-safety-500/20'
                    : 'bg-carbon-700/50 hover:bg-carbon-600/50 text-white border border-carbon-600/50 hover:border-carbon-500/50'
                }`}
              >
                Get Started
              </a>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-center text-white font-bold text-xl mb-8">
            All plans include everything
          </h3>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-electric-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-electric-400" />
                </div>
                <span className="text-carbon-200">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
