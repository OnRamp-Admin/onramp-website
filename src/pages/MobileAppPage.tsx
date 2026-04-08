import { motion } from 'framer-motion';
import { Mic, Smartphone, Wifi, Shield, Zap, Radio, HandMetal, BatteryFull } from 'lucide-react';
import BrainButtonPrompts from '../components/BrainButtonPrompts';

// Inline SVG for App Store badge
function AppStoreBadge() {
  return (
    <a
      href="#"
      className="inline-block hover:opacity-80 transition-opacity"
      aria-label="Download on the App Store"
    >
      <svg
        viewBox="0 0 120 40"
        className="h-[50px] w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="40" rx="5" fill="#000" />
        <rect
          x="0.5"
          y="0.5"
          width="119"
          height="39"
          rx="4.5"
          stroke="#A6A6A6"
          fill="none"
        />
        <text
          x="10"
          y="14"
          fill="white"
          fontSize="7"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Download on the
        </text>
        <text
          x="10"
          y="26"
          fill="white"
          fontSize="13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
        >
          App Store
        </text>
      </svg>
    </a>
  );
}

// Google Play badge (muted / coming soon)
function GooglePlayBadge() {
  return (
    <div className="relative inline-block">
      <div className="opacity-40 grayscale pointer-events-none">
        <svg
          viewBox="0 0 135 40"
          className="h-[50px] w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="135" height="40" rx="5" fill="#000" />
          <rect
            x="0.5"
            y="0.5"
            width="134"
            height="39"
            rx="4.5"
            stroke="#A6A6A6"
            fill="none"
          />
          <text
            x="14"
            y="14"
            fill="white"
            fontSize="6.5"
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ textTransform: 'uppercase' }}
          >
            GET IT ON
          </text>
          <text
            x="14"
            y="26"
            fill="white"
            fontSize="13"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
          >
            Google Play
          </text>
        </svg>
      </div>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-carbon-300 whitespace-nowrap">
        Coming soon
      </span>
    </div>
  );
}

// Phone mockup with ONRAMP screenshot
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] md:w-[320px]">
      {/* Phone frame */}
      <div className="relative rounded-[3rem] border-[8px] border-carbon-700 bg-carbon-900 shadow-2xl shadow-electric-500/20 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-carbon-700 rounded-b-2xl z-10" />

        {/* Screen content */}
        <div className="aspect-[9/19.5] bg-gradient-to-b from-carbon-900 to-carbon-950 flex flex-col items-center p-6 pt-10">
          {/* Status bar */}
          <div className="absolute top-2 left-0 right-0 flex justify-between px-8 text-[10px] text-carbon-300">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <Wifi className="w-3 h-3" />
              <div className="w-5 h-2.5 border border-carbon-400 rounded-sm relative">
                <div className="absolute inset-[1px] right-[3px] bg-green-400 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App content mockup */}
          <div className="flex flex-col items-center mt-8">
            {/* Logo */}
            <div className="flex items-center justify-center mb-2">
              <img src="/Onramp-Logo-Pink Brain-White Text-SML.png" alt="ONRAMP" className="h-7" />
            </div>

            {/* Animated voice indicator - fixed height container so it doesn't push content */}
            <div className="flex items-center justify-center gap-1 h-[36px] my-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-electric-400 rounded-full"
                  animate={{
                    height: [8, 20 + Math.random() * 16, 8],
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>

            <p className="text-electric-400 text-sm font-medium text-center">
              "What's the torque spec for the intake manifold bolts?"
            </p>

            <div className="w-full mt-4 space-y-2">
              <div className="bg-carbon-800/60 rounded-lg p-3 border border-carbon-700/50">
                <p className="text-[11px] text-carbon-300 leading-relaxed">
                  The intake manifold bolts on the 2019 Ford F-150 5.0L should be torqued to <span className="text-electric-400 font-semibold">89 lb-in</span> in the sequence shown...
                </p>
              </div>
            </div>

            {/* Mic button */}
            <motion.div
              className="mt-4 w-14 h-14 rounded-full bg-gradient-to-r from-electric-500 to-electric-600 flex items-center justify-center glow-electric"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute -inset-8 bg-gradient-to-r from-electric-500/10 via-transparent to-electric-500/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}

// QR Code placeholder (simple generated pattern)
function QRCodePlaceholder() {
  return (
    <div className="bg-white rounded-xl p-3 inline-block">
      <div className="w-[140px] h-[140px] relative">
        <svg viewBox="0 0 140 140" className="w-full h-full">
          {/* Corner markers */}
          <rect x="4" y="4" width="36" height="36" fill="black" />
          <rect x="8" y="8" width="28" height="28" fill="white" />
          <rect x="14" y="14" width="16" height="16" fill="black" />
          <rect x="100" y="4" width="36" height="36" fill="black" />
          <rect x="104" y="8" width="28" height="28" fill="white" />
          <rect x="110" y="14" width="16" height="16" fill="black" />
          <rect x="4" y="100" width="36" height="36" fill="black" />
          <rect x="8" y="104" width="28" height="28" fill="white" />
          <rect x="14" y="110" width="16" height="16" fill="black" />
          {[
            [48, 8], [56, 8], [72, 8], [80, 8],
            [48, 16], [64, 16], [88, 16],
            [56, 24], [72, 24], [80, 24],
            [48, 32], [64, 32], [88, 32],
            [8, 48], [16, 48], [32, 48], [56, 48], [72, 48], [88, 48], [104, 48], [120, 48],
            [24, 56], [48, 56], [64, 56], [80, 56], [96, 56], [112, 56],
            [8, 64], [32, 64], [48, 64], [72, 64], [88, 64], [104, 64], [128, 64],
            [16, 72], [40, 72], [56, 72], [80, 72], [96, 72], [120, 72],
            [8, 80], [24, 80], [48, 80], [64, 80], [88, 80], [104, 80], [128, 80],
            [16, 88], [32, 88], [56, 88], [72, 88], [96, 88], [112, 88],
            [48, 104], [64, 104], [80, 104], [96, 104], [112, 104],
            [56, 112], [72, 112], [88, 112], [104, 112], [128, 112],
            [48, 120], [64, 120], [80, 120], [96, 120], [120, 120],
            [56, 128], [72, 128], [88, 128], [112, 128],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height="8" fill="black" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// Flic button section bullets
const flicBullets = [
  { icon: Mic, text: 'Tap-to-Talk. Tap-to-Pause.' },
  { icon: Radio, text: 'Bluetooth-connected — instant response, no delay' },
  { icon: HandMetal, text: 'Glove-friendly 1" physical button' },
  { icon: BatteryFull, text: 'Months of battery life — easy CR2032 swap' },
];

const features = [
  {
    icon: Mic,
    title: 'Voice-First Design',
    description:
      'Built for hands-free operation. Ask questions, get step-by-step guidance, and navigate jobs entirely by voice.',
  },
  {
    icon: Smartphone,
    title: 'Take It to the Bay',
    description:
      'Your phone goes where a desktop can\'t. Get AI guidance right at the vehicle — no walking back to a terminal.',
  },
  {
    icon: Shield,
    title: 'Seamless Sync',
    description:
      'Everything syncs with your ONRAMP web account. Jobs, notes, and history are always up to date across devices.',
  },
];

export default function MobileAppPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Messaging */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-electric-500/10 border border-electric-500/20 rounded-full text-electric-400 text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Mobile App
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                Your AI Voice Guide{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
                  Lives in Your Pocket
                </span>
              </h1>

              <p className="text-lg text-carbon-300 mb-8 leading-relaxed">
                ONRAMP's AI voice assistant is designed to work from your mobile device.
                Bring the power of hands-free, voice-guided repair instructions directly to the vehicle —
                no more running back to a service terminal.
              </p>

              {/* Download badges */}
              <div className="flex flex-wrap items-start gap-6 mb-8">
                <AppStoreBadge />
                <GooglePlayBadge />
              </div>

              {/* QR Code */}
              <div className="flex items-center gap-4 p-4 bg-carbon-900/50 border border-carbon-800/50 rounded-xl inline-flex">
                <QRCodePlaceholder />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Scan to Download</p>
                  <p className="text-carbon-300 text-xs leading-relaxed max-w-[180px]">
                    Point your phone's camera at this QR code to go directly to the app store.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Phone Mockup + Accessories */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-t border-carbon-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Desktop + Mobile ={' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
                Full Power
              </span>
            </h2>
            <p className="text-carbon-300 text-lg max-w-2xl mx-auto">
              ONRAMP works best when you use the web app and mobile app together.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '1',
                title: 'Set Up Jobs on Desktop',
                description:
                  'Use the ONRAMP web app to create jobs, upload service documents, and manage your repair queue.',
              },
              {
                step: '2',
                title: 'Install the Mobile App',
                description:
                  'Download ONRAMP on your iPhone. Sign in with your same account — everything syncs automatically.',
              },
              {
                step: '3',
                title: 'Get Voice Guidance in the Bay',
                description:
                  'Open a job on your phone and start the AI voice guide. Hands-free instructions, right at the vehicle.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-carbon-900/50 border border-carbon-800/50 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-500 to-electric-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-carbon-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-carbon-900/50 border border-carbon-800/50 rounded-2xl p-6 hover:border-electric-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-electric-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-electric-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-carbon-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Key to Hands-Free — Flic Button Section */}
      <section className="py-16 px-4 border-t border-carbon-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            {/* Visual — Flic button */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-[280px] md:w-[320px] flex flex-col items-center py-8">
                  <div className="absolute inset-0 bg-electric-500/15 rounded-full blur-[80px] scale-75 opacity-50" />
                  <img
                    src="/BrainButton.png"
                    alt="Brain Button"
                    className="w-48 md:w-56 h-auto relative"
                    style={{ filter: "drop-shadow(0 0 14px rgba(26,160,255,0.2))" }}
                  />
                </div>
                <BrainButtonPrompts />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 mb-6">
                <Zap className="w-4 h-4 text-electric-400" />
                <span className="text-electric-400 text-xs font-semibold tracking-wider uppercase">
                  The Brain Button
                </span>
              </div>

              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                The Key to Hands-Free
              </h3>

              <p className="text-carbon-300 text-base md:text-lg mb-8 leading-relaxed">
                Tap-to-Talk. The Brain Button clips to your shirt or belt — giving you instant,
                physical control of your AI assistant without putting the wrench down. Tap again to pause.
              </p>

              <ul className="space-y-4">
                {flicBullets.map((bullet, i) => (
                  <motion.li
                    key={bullet.text}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center mt-0.5">
                      <bullet.icon className="w-4 h-4 text-electric-400" />
                    </div>
                    <span className="text-carbon-200 text-base md:text-lg">{bullet.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
