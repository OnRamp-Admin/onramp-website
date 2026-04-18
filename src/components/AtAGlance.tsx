import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import BrainButtonPrompts from './BrainButtonPrompts';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Zap,
  Monitor,
  BarChart3,
  RefreshCw,
  Headphones,
  Mic,
  FileText,
  Radio,
  BatteryFull,
  HandMetal,
  ClipboardList,
  Users,
  ArrowRight,
  Rocket,
  FileCheck,
} from 'lucide-react';

const blocks = [
  {
    id: 'mobile-app',
    headline: "AI Brain in Your Pocket.\nAI Voice in Your Headphones.",
    subtext:
      'ONRAMP lives on your phone — but the help is right in your ears when you need it. No terminal trips, no desktop logins. Just tap-to-talk, and your AI assistant is ready to help you with every job, hands-free.',
    bullets: [
      { icon: Rocket, text: 'Start jobs in 15 seconds with just the RO# & VIN' },
      { icon: Headphones, text: 'Voice-first interface — works with any headphones' },
      { icon: Mic, text: 'Speak naturally with ONRAMP AI to diagnose, document, and navigate repairs' },
      { icon: FileCheck, text: 'Wrap up jobs in seconds — AI writes your RO Reports' },
      { icon: FileText, text: 'All your jobs, notes, and RO reports in one place' },
    ],
    bulletColor: 'electric',
    visual: {
      type: 'phone' as const,
      icon: Smartphone,
    },
    imageLeft: true,
  },
  {
    id: 'flic-button',
    headline: 'The Key to Hands-Free',
    subtext:
      "Tap-to-Talk. The Brain Button clips to your shirt or belt — giving you instant, physical control of your AI assistant without putting the wrench down. Tap again to pause.",
    bullets: [
      { icon: Mic, text: 'Tap-to-Talk. Tap-to-Pause.' },
      { icon: Radio, text: 'Bluetooth-connected — instant response, no delay' },
      { icon: HandMetal, text: 'Glove-friendly 1" physical button' },
      { icon: BatteryFull, text: 'Months of battery life — easy CR2032 swap' },
    ],
    bulletColor: 'electric',
    visual: {
      type: 'button' as const,
      icon: Zap,
    },
    imageLeft: false,
  },
  {
    id: 'dashboard',
    headline: 'Real-Time Visibility & Sync',
    subtext:
      'Everything your techs are working on or waiting on, with real-time status and perfect documentation, syncs instantly to the admin dashboard. Service managers get complete oversight without interrupting a single repair.',
    bullets: [
      { icon: RefreshCw, text: 'RO reports sync in real-time from phone to dashboard' },
      { icon: ClipboardList, text: 'Monitor job progress, tech activity, and bay status' },
      { icon: Users, text: 'Manager tools for team performance and ONRAMP platform usage' },
      { icon: Zap, text: 'Empower every technician to work like your best technician' },
    ],
    bulletColor: 'safety',
    visual: {
      type: 'desktop' as const,
      icon: Monitor,
    },
    imageLeft: true,
  },
];

const colorMap: Record<string, { icon: string; bg: string; border: string; glow: string }> = {
  electric: {
    icon: 'text-electric-400',
    bg: 'bg-electric-500/10',
    border: 'border-electric-500/20',
    glow: 'bg-electric-500/20',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'bg-amber-500/20',
  },
  safety: {
    icon: 'text-safety-400',
    bg: 'bg-safety-500/10',
    border: 'border-safety-500/20',
    glow: 'bg-safety-500/20',
  },
};

const phoneScreenshots = [
  { sm: '/diagnose-screen-sm.webp', full: '/diagnose-screen.webp' },
  { sm: '/prepare-screen-sm.webp', full: '/prepare-screen.webp' },
  { sm: '/workflow-screen-sm.webp', full: '/workflow-screen.webp' },
  { sm: '/step-screen-1-sm.webp', full: '/step-screen-1.webp' },
  { sm: '/step-screen-2-sm.webp', full: '/step-screen-2.webp' },
];

function PhoneMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phoneScreenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-[260px] md:w-[300px]">
      {/* Clipping container sized to the screen area within the frame */}
      <div
        className="absolute overflow-hidden z-0"
        style={{
          left: '3.5%',
          right: '3.5%',
          top: '1.5%',
          bottom: '1.5%',
          borderRadius: '2rem',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            srcSet={`${phoneScreenshots[currentIndex].sm} 480w, ${phoneScreenshots[currentIndex].full} 1206w`}
            sizes="300px"
            src={phoneScreenshots[currentIndex].sm}
            alt="ONRAMP mobile app"
            className="w-full h-full object-cover object-top absolute inset-0"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-30%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ imageRendering: 'auto', WebkitFontSmoothing: 'antialiased' }}
          />
        </AnimatePresence>
      </div>
      {/* iPhone frame on top */}
      <img
        src="/apple-iphone-17-pro-max-2025-medium.png"
        alt="OnRamp mobile app interface on iPhone"
        className="relative z-10 w-full h-auto drop-shadow-2xl"
      />
    </div>
  );
}

function FlicMockup() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto w-[280px] md:w-[320px] flex flex-col items-center py-8">
        {/* Ambient glow */}
        <div className="absolute w-56 h-56 bg-electric-500/15 rounded-full blur-[80px]" />
        <div className="relative">
          <img
            src="/BrainButton.webp"
            alt="Brain Button"
            className="w-48 md:w-56 h-auto"
            style={{ filter: "drop-shadow(0 0 14px rgba(26,160,255,0.2))" }}
          />
        </div>
      </div>
      <BrainButtonPrompts />
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      {/* Monitor frame — sleek modern display */}
      <div className="rounded-xl border-[4px] border-carbon-500/80 bg-carbon-900 p-1.5 shadow-2xl shadow-safety-500/10">
        {/* Top bezel with camera dot */}
        <div className="flex justify-center py-1">
          <div className="w-2 h-2 rounded-full bg-carbon-600" />
        </div>
        {/* Screen area — screenshot placeholder */}
        <div className="rounded-lg bg-carbon-800 overflow-hidden aspect-[16/10] flex items-center justify-center">
          {/* Placeholder — replace with: <img src="/dashboard-screenshot.png" alt="ONRAMP Dashboard" className="w-full h-full object-cover" /> */}
          <div className="w-full h-full p-4 md:p-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-safety-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-safety-400" />
                </div>
                <div>
                  <div className="h-3 w-28 rounded bg-carbon-600 mb-1.5" />
                  <div className="h-2 w-20 rounded bg-carbon-700" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
              {[
                { label: 'Active Jobs', value: '12' },
                { label: 'In Progress', value: '5' },
                { label: 'Completed', value: '7' },
                { label: 'Approval Rate', value: '94%' },
              ].map((stat) => (
                <div key={stat.label} className="p-2 md:p-3 rounded-lg bg-carbon-700/50 border border-carbon-600/30">
                  <div className="text-xs md:text-sm font-bold text-safety-400">{stat.value}</div>
                  <div className="text-[8px] md:text-[10px] text-carbon-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-carbon-600/30 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2 bg-carbon-700/40 border-b border-carbon-600/30">
                <div className="h-2 w-16 rounded bg-carbon-500/50" />
                <div className="h-2 w-24 rounded bg-carbon-500/50 hidden md:block" />
                <div className="flex-1" />
                <div className="h-2 w-12 rounded bg-carbon-500/50" />
                <div className="h-2 w-16 rounded bg-carbon-500/50" />
              </div>
              {/* Rows */}
              {[
                { status: 'Complete', color: 'text-green-400 bg-green-500/15' },
                { status: 'Active', color: 'text-electric-400 bg-electric-500/15' },
                { status: 'Review', color: 'text-amber-400 bg-amber-500/15' },
                { status: 'Complete', color: 'text-green-400 bg-green-500/15' },
                { status: 'Active', color: 'text-electric-400 bg-electric-500/15' },
                { status: 'Complete', color: 'text-green-400 bg-green-500/15' },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-carbon-700/30 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-carbon-600/50 flex-shrink-0" />
                  <div className="h-2 w-20 md:w-28 rounded bg-carbon-600/40" />
                  <div className="h-2 w-16 md:w-20 rounded bg-carbon-600/30 hidden md:block" />
                  <div className="flex-1" />
                  <div className="h-2 w-10 rounded bg-carbon-600/30" />
                  <div className={`h-5 px-2 rounded-full ${row.color} flex items-center justify-center`}>
                    <span className="text-[8px] md:text-[9px] font-medium">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Monitor stand — thin neck + base */}
      <div className="flex justify-center">
        <div className="w-12 h-8 bg-gradient-to-b from-carbon-500/80 to-carbon-600/80 rounded-b-sm" />
      </div>
      <div className="flex justify-center -mt-px">
        <div className="w-32 h-3 bg-carbon-600/80 rounded-full shadow-lg" />
      </div>
    </div>
  );
}

const mockups: Record<string, React.FC> = {
  phone: PhoneMockup,
  button: FlicMockup,
  desktop: DashboardMockup,
};

export default function AtAGlance() {
  return (
    <section className="pt-24 pb-0 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={mobileViewport}
          className="text-center mb-20"
        >
          <span className="text-carbon-200 text-sm font-semibold tracking-wider uppercase">
            The Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
            ONRAMP at a Glance
          </h2>
          <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
            A mobile app, a physical button, and a management dashboard — everything technicians need to work smarter.
          </p>
        </motion.div>

        {/* Feature blocks */}
        <div className="space-y-24 md:space-y-32">
          {blocks.map((block) => {
            const colors = colorMap[block.bulletColor];
            const Mockup = mockups[block.visual.type];
            // Dashboard block gets full width visual
            const isDashboard = block.id === 'dashboard';

            return (
              <div key={block.id}>
                {isDashboard ? (
                  /* Dashboard — full-width background, content constrained inside */
                  <div
                    className="relative overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(/30-bay-shop-aerial.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center 60%',
                      width: '100vw',
                      marginLeft: 'calc(-50vw + 50%)',
                    }}
                  >
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-14 px-4 md:px-8 py-12 md:py-16 lg:py-20">
                      {/* Left on desktop, below text on mobile — Dashboard mockup + CTA */}
                      <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={mobileViewport}
                        transition={{ duration: 0.7 }}
                        className="w-full lg:w-1/2 flex flex-col items-center order-2 lg:order-1"
                      >
                        <div className="relative w-full max-w-md">
                          <div className={`absolute inset-0 ${colors.glow} rounded-full blur-[80px] scale-75 opacity-30`} />
                          <div className="relative">
                            <Mockup />
                          </div>
                        </div>
                        <Link
                          to="/how-it-works"
                          className="group inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-safety-500/20"
                        >
                          How It Works
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>

                      {/* Right on desktop, above mockup on mobile — Text */}
                      <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={mobileViewport}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="w-full lg:w-1/2 order-1 lg:order-2"
                      >
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border} mb-6`}>
                          <block.visual.icon className={`w-4 h-4 ${colors.icon}`} />
                          <span className={`${colors.icon} text-xs font-semibold tracking-wider uppercase`}>
                            The Dashboard
                          </span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
                          {block.headline}
                        </h3>

                        <p className="text-carbon-200 text-base md:text-lg mb-6 leading-relaxed">
                          {block.subtext}
                        </p>

                        <ul className="space-y-3">
                          {block.bullets.map((bullet, i) => (
                            <motion.li
                              key={bullet.text}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={mobileViewport}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mt-0.5`}>
                                <bullet.icon className={`w-4 h-4 ${colors.icon}`} />
                              </div>
                              <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                ) : block.id === 'mobile-app' ? (
                  /* Mobile App — full-width Electric Brain background */
                  <div
                    className="relative overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.75), rgba(6,6,13,0.75)), url(/ElectricBrain.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100vw',
                      marginLeft: 'calc(-50vw + 50%)',
                    }}
                  >
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 md:px-8 py-12 md:py-16 lg:py-20">
                      {/* Visual */}
                      <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={mobileViewport}
                        transition={{ duration: 0.7 }}
                        className="w-full lg:w-1/2 flex flex-col items-center"
                      >
                        <div className="relative">
                          <div className={`absolute inset-0 ${colors.glow} rounded-full blur-[80px] scale-75 opacity-50`} />
                          <div className="relative">
                            <Mockup />
                          </div>
                        </div>
                      </motion.div>

                      {/* Text */}
                      <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={mobileViewport}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="w-full lg:w-1/2"
                      >
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border} mb-6`}>
                          <block.visual.icon className={`w-4 h-4 ${colors.icon}`} />
                          <span className={`${colors.icon} text-xs font-semibold tracking-wider uppercase`}>
                            The App
                          </span>
                        </div>

                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
                          {block.headline}
                        </h3>

                        <p className="text-carbon-200 text-base md:text-lg mb-8 leading-relaxed">
                          {block.subtext}
                        </p>

                        <ul className="space-y-4">
                          {block.bullets.map((bullet, i) => (
                            <motion.li
                              key={bullet.text}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={mobileViewport}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mt-0.5`}>
                                <bullet.icon className={`w-4 h-4 ${colors.icon}`} />
                              </div>
                              <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  /* Flic — side-by-side zig-zag (no background image) */
                  <div
                    className={`flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16`}
                  >
                    {/* Visual */}
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={mobileViewport}
                      transition={{ duration: 0.7 }}
                      className="w-full lg:w-1/2 flex flex-col items-center"
                    >
                      {/* Badge centered above image on mobile for Brain Button */}
                      <div className={`lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border} mb-4`}>
                        <block.visual.icon className={`w-4 h-4 ${colors.icon}`} />
                        <span className={`${colors.icon} text-xs font-semibold tracking-wider uppercase`}>
                          The Brain Button
                        </span>
                      </div>
                      <div className="relative">
                        <div className={`absolute inset-0 ${colors.glow} rounded-full blur-[80px] scale-75 opacity-50`} />
                        <div className="relative">
                          <Mockup />
                        </div>
                      </div>
                    </motion.div>

                    {/* Text */}
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={mobileViewport}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      className="w-full lg:w-1/2"
                    >
                      <div className={`hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border} mb-6`}>
                        <block.visual.icon className={`w-4 h-4 ${colors.icon}`} />
                        <span className={`${colors.icon} text-xs font-semibold tracking-wider uppercase`}>
                          The Brain Button
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
                        {block.headline}
                      </h3>

                      <p className="text-carbon-200 text-base md:text-lg mb-8 leading-relaxed">
                        {block.subtext}
                      </p>

                      <ul className="space-y-4">
                        {block.bullets.map((bullet, i) => (
                          <motion.li
                            key={bullet.text}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={mobileViewport}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mt-0.5`}>
                              <bullet.icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>
                            <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
