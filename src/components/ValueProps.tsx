import { motion } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import {
  FileCheck,
  Clock,
  Shield,
  DollarSign,
  Mic,
  Zap,
  TrendingUp,
  ClipboardCheck,
  AlertTriangle,
  Target,
} from 'lucide-react';

const technicianBenefits = [
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

const managerBenefits = [
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
    description: 'Cause, Correction, Concern—automatically structured from your natural speech.',
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

export default function ValueProps() {
  return (
    <>
      {/* Technician Section */}
      <section className="py-24 px-4 bg-carbon-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-16"
          >
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
              For Technicians
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              More Wrenching.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                More Earning.
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Every minute spent at the terminal is a minute not turning a wrench.
              ONRAMP keeps you where the money is—under the hood.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {technicianBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-electric-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4 group-hover:bg-electric-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{benefit.title}</h3>
                <p className="text-carbon-300 mb-4">{benefit.description}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-electric-500/10 text-electric-400 text-sm font-medium">
                  {benefit.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manager Section */}
      <section className="py-24 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-16"
          >
            <span className="text-safety-400 text-sm font-semibold tracking-wider uppercase">
              For Service Managers
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Unlock Hidden{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                Shop Profit
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Your techs aren't lazy. They're buried in documentation. Free them up
              and watch your throughput—and your bottom line—climb.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {managerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50 hover:border-safety-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-safety-500/10 text-safety-400 mb-4 group-hover:bg-safety-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{benefit.title}</h3>
                <p className="text-carbon-300 mb-4">{benefit.description}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-safety-500/10 text-safety-400 text-sm font-medium">
                  {benefit.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Deep Dive */}
      <section className="py-24 px-4 bg-gradient-to-b from-carbon-900 to-carbon-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-16"
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
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              Poor documentation costs shops thousands in rejected warranty claims every year.
              ONRAMP writes RO narratives that get approved the first time.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {[
              { stat: '8%', label: 'Industry avg claim rejection rate' },
              { stat: '$15K', label: 'Avg annual warranty leakage per shop' },
              { stat: '60%', label: 'Rejections due to documentation' },
              { stat: '90%+', label: 'ONRAMP first-pass approval rate' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700/30 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={mobileViewport}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="text-3xl md:text-4xl font-bold text-green-400 mb-2"
                >
                  {item.stat}
                </motion.div>
                <p className="text-carbon-300 text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
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
                  <p className="text-carbon-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Example RO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            transition={{ delay: 0.3 }}
            className="mt-16 p-6 md:p-8 rounded-2xl bg-carbon-800/50 border border-green-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">Sample Warranty-Ready RO Line</span>
            </div>
            <div className="font-mono text-sm space-y-3">
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-electric-500">
                <span className="text-carbon-300">CONCERN:</span>
                <span className="text-carbon-200 ml-2">
                  Customer states vehicle intermittent no-start condition, occurs after sitting overnight
                </span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-safety-500">
                <span className="text-carbon-300">CAUSE:</span>
                <span className="text-carbon-200 ml-2">
                  Found B+ battery cable terminal end severely corroded, causing voltage drop of 2.3V under load. Parasitic draw within spec at 32mA.
                </span>
              </div>
              <div className="p-3 rounded bg-carbon-900/80 border-l-4 border-green-500">
                <span className="text-carbon-300">CORRECTION:</span>
                <span className="text-carbon-200 ml-2">
                  Replaced B+ cable terminal end per TSB 19-NA-123. Cleaned battery posts, applied dielectric grease. Load tested battery at 625 CCA (spec: 600 CCA). System operates as designed.
                </span>
              </div>
            </div>
            <p className="text-carbon-300 text-sm mt-4">
              * Generated automatically from technician voice notes during repair
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
