import { motion } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { Link } from 'react-router-dom';
import { Mic, FileCheck, Gauge, Shield, ArrowRight, Wrench, Building2, Stethoscope, Package, PenLine, Zap, BarChart3, Eye, Magnet, Camera } from 'lucide-react';

const techBullets = [
  { icon: Mic, text: 'Voice AI — with you every step of the way' },
  { icon: Stethoscope, text: 'Diagnose at the speed of AI' },
  { icon: Package, text: 'AI prepares your tools list and replacement parts list' },
  { icon: Wrench, text: 'Perform faster — real-time AI coaching in your headphones' },
  { icon: Camera, text: 'Capture photos and videos through device integration' },
  { icon: PenLine, text: 'Speak your notes — AI summarizes them' },
  { icon: FileCheck, text: 'ONRAMP AI writes perfect RO reports, instantly' },
];

const managerBullets = [
  { icon: Gauge, text: 'Increase overall bay efficiency' },
  { icon: Zap, text: 'Maximize daily throughput' },
  { icon: Shield, text: 'Perfect RO reports = More warranty approvals' },
  { icon: Eye, text: 'Monitor real-time RO progress' },
  { icon: BarChart3, text: 'Visualize individual tech performance rates' },
  { icon: Magnet, text: 'Retain and attract top techs with modern AI tools' },
];

export default function AudienceSplit() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Subtle center divider glow */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-carbon-700/50 to-transparent hidden lg:block" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={mobileViewport}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Driving Profits —<br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">For One.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">For All!</span>
          </h2>
        </motion.div>

        {/* Two-column split */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT — Technicians */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={mobileViewport}
            transition={{ duration: 0.6 }}
            className="group relative rounded-2xl border border-electric-500/20 bg-gradient-to-br from-carbon-800/80 to-carbon-900/80 p-8 md:p-10 hover:border-electric-500/40 transition-all duration-500"
          >
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-electric-500/5 rounded-br-[4rem] pointer-events-none" />

            <div className="relative">
              {/* Role badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 mb-6">
                <Wrench className="w-4 h-4 text-electric-400" />
                <span className="text-electric-400 text-sm font-semibold tracking-wide uppercase">
                  For Technicians
                </span>
              </div>

              {/* Sub-headline */}
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Beat Book Time.<br className="md:hidden" />
                <span className="hidden md:inline"> </span>Every Time.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">
                  Take Home More Pay.
                </span>
              </h3>

              {/* Core message */}
              <p className="text-carbon-300 text-base md:text-lg mb-8 leading-relaxed">
                Stop wasting time at the terminal scrolling through PDFs and typing reports. Use ONRAMP as your wingman to diagnose quickly, prepare better, work faster, and write perfect reports, instantly.
              </p>

              {/* Bullets */}
              <ul className="space-y-4 mb-10">
                {techBullets.map((bullet, i) => (
                  <motion.li
                    key={bullet.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={mobileViewport}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-electric-500/10 flex items-center justify-center">
                      <bullet.icon className="w-4.5 h-4.5 text-electric-400" />
                    </div>
                    <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/technicians"
                className="group/btn w-full md:w-auto flex md:inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-electric-500/20 hover:shadow-electric-500/40 text-center"
              >
                <span>See How You Can<br className="md:hidden" /> Flag More Time</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — Managers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={mobileViewport}
            transition={{ duration: 0.6 }}
            className="group relative rounded-2xl border border-safety-500/20 bg-gradient-to-br from-carbon-800/80 to-carbon-900/80 p-8 md:p-10 hover:border-safety-500/40 transition-all duration-500"
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-safety-500/5 rounded-bl-[4rem] pointer-events-none" />

            <div className="relative">
              {/* Role badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-safety-500/10 border border-safety-500/20 mb-6">
                <Building2 className="w-4 h-4 text-safety-400" />
                <span className="text-safety-400 text-sm font-semibold tracking-wide uppercase">
                  For Service Managers
                </span>
              </div>

              {/* Sub-headline */}
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Maximize Bay Throughput &<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-400 to-safety-600">
                  Warranty Payouts.
                </span>
              </h3>

              {/* Core message */}
              <p className="text-carbon-300 text-base md:text-lg mb-8 leading-relaxed">
                ONRAMP will help your team drive profitability through faster diagnosis, AI-Guided repairs, and perfect RO reports. Accelerated turn-times and improved warranty claim approvals mean more service center profit.
              </p>

              {/* Bullets */}
              <ul className="space-y-4 mb-10">
                {managerBullets.map((bullet, i) => (
                  <motion.li
                    key={bullet.text}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={mobileViewport}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-safety-500/10 flex items-center justify-center">
                      <bullet.icon className="w-4.5 h-4.5 text-safety-400" />
                    </div>
                    <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/managers"
                className="group/btn w-full md:w-auto flex md:inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-safety-500 hover:bg-safety-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-safety-500/20 hover:shadow-safety-500/40 text-center"
              >
                <span>See How ONRAMP<br className="md:hidden" /> Drives Profits</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
