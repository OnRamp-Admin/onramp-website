import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { Link } from 'react-router-dom';
import { Wrench, Sparkles, User, Shield, ArrowRight } from 'lucide-react';

// Cycle: start with nothing (TECH SAVVY), then alternate NOLOGY / NICIAN
const suffixes = ['', 'NOLOGY', 'NICIAN'];

const values = [
  {
    icon: Wrench,
    title: 'Built for the Bay',
    description: 'Every feature designed for greasy hands, loud shops, and real repairs. If it doesn\'t work under the hood, it doesn\'t ship.',
  },
  {
    icon: Sparkles,
    title: 'AI That Empowers',
    description: 'We believe AI should make workers more capable, not more replaceable. ONRAMP amplifies what technicians already know how to do.',
  },
  {
    icon: User,
    title: 'Technician-First',
    description: 'Every decision we make starts with one question: does this help the tech in the bay? If the answer is no, we don\'t build it.',
  },
  {
    icon: Shield,
    title: 'Honest Technology',
    description: 'No hype, no vaporware. What we sell is what works. We\'d rather under-promise and over-deliver than the other way around.',
  },
];

export default function AboutPage() {
  const [suffixIndex, setSuffixIndex] = useState(0); // starts with '' (TECH SAVVY.)

  useEffect(() => {
    // Sequence: '' (2s) → NOLOGY (4s) → NICIAN (5s) → NOLOGY (4s) → NICIAN (5s) → ...
    let timeout: ReturnType<typeof setTimeout>;
    let alive = true;

    const schedule = (index: number) => {
      if (!alive) return;
      setSuffixIndex(index);
      // Determine how long to hold this state
      const holdTime = index === 0 ? 2000  // initial TECH SAVVY
        : index === 2 ? 5000              // TECHNICIAN SAVVY — hold longer
        : 4000;                            // TECHNOLOGY SAVVY
      const nextIndex = index === 0 ? 1 : index === 1 ? 2 : 1; // skip 0 after first
      timeout = setTimeout(() => schedule(nextIndex), holdTime);
    };

    schedule(0);
    return () => { alive = false; clearTimeout(timeout); };
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-500/10 border border-electric-500/30 mb-6">
              <User className="w-4 h-4 text-electric-400" />
              <span className="text-sm font-semibold text-electric-400 tracking-wider uppercase">
                About ONRAMP
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight uppercase tracking-wide">
              <span className="flex flex-col md:flex-row items-center md:items-baseline justify-center">
                <span className="inline-flex items-baseline">
                  <span>TECH</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={suffixes[suffixIndex]}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{
                        width: { duration: 1.0, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.8, delay: 0.2 },
                      }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-500 inline-block overflow-hidden whitespace-nowrap"
                    >
                      {suffixes[suffixIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="md:ml-[0.25em]">SAVVY.</span>
              </span>
            </h1>
            <p className="text-carbon-300 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Twenty years in technology.<br />
              A lifetime in the garage.<br />
              One question that wouldn't go away.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="space-y-10"
          >
            {/* The Spark */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">The Spark</h2>
              <div className="space-y-4 text-carbon-300 text-base md:text-lg leading-relaxed">
                <p>
                  I've spent 20 years building software — from startups to enterprise, across industries,
                  through every wave of technology that promised to change the world. Most of them did.
                  But when AI started accelerating in 2023 and 2024, I saw something different. I saw a
                  technology that wasn't just going to change how companies operate — it was going to
                  change how <span className="text-white font-semibold">individual people work</span>. Every day. At the task level.
                </p>
                <p>
                  That excited me. And it scared me.
                </p>
              </div>
            </div>

            {/* Two Worlds — two-column with photo */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Two Worlds</h2>
              <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
                {/* Text — left on desktop, wraps photo on mobile */}
                <div className="flex-1 text-carbon-300 text-base md:text-lg leading-relaxed space-y-4">
                  <p>
                    Like a lot of people who develop a passion for the automotive industry, it started when I was a young
                    man turning wrenches with my dad in the garage. Cars, motorcycles, anything with an
                    engine — that's been my life. I know what it's like to be elbow-deep in a repair,
                    covered in grease, trying to remember a torque spec you looked up 10 minutes ago. I
                    know what it feels like to walk back to the terminal — <em>again</em> — because you
                    need the next step in a procedure you've already read three times.
                  </p>
                  <p>
                    When I looked at where AI was headed, I kept coming back to one question: what if the
                    people who actually keep this world running — the technicians, the mechanics, the
                    skilled tradespeople — had an AI that worked alongside them? Not one that replaced
                    them. One that made them <span className="text-white font-semibold">faster, sharper,
                    and better compensated</span> for the work they already do.
                  </p>
                </div>

                {/* Photo — right on desktop, middle on mobile */}
                <div className="flex-shrink-0 flex justify-center lg:w-2/5 order-first lg:order-last">
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-0 bg-electric-500/15 rounded-2xl blur-[60px] scale-90" />
                    <img
                      src="/AlexShop.png"
                      alt="Alex Littlewood, Founder of ONRAMP"
                      className="relative rounded-2xl w-full h-full object-cover shadow-2xl"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(26,160,255,0.15))' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Why ONRAMP */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Why ONRAMP</h2>
              <div className="space-y-4 text-carbon-300 text-base md:text-lg leading-relaxed">
                <p>
                  That's why I built ONRAMP. It's an AI voice agent purpose-built for automotive
                  technicians. It rides along on every repair — diagnosing, coaching, documenting — so
                  technicians can stay in the bay, stay focused, and flag more hours. It writes their
                  reports. It tracks their time. It makes sure nothing gets missed.
                </p>
                <p>
                  I built this for the veteran technician with 20 years under the hood who needs help
                  keeping up with vehicles that are getting more complex every model year. And I built
                  it for the newcomer wading into a highly technical industry for the first time, who
                  needs to get up to speed fast. That's why we're called <span className="text-white font-semibold">ONRAMP</span> —
                  because whether you're an experienced pro or just getting started, this is how you
                  get on the fast track.
                </p>
                <p>
                  I didn't build this for Silicon Valley. I built it for the service departments that
                  keep millions of cars on the road every day. For the techs who deserve better tools.
                  For the managers who need visibility without micromanaging. For an industry that's
                  been underserved by technology for too long.
                </p>
                <p className="text-white font-semibold text-xl md:text-2xl">
                  ONRAMP is my answer to the question I couldn't stop asking:<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-500">
                    What if AI actually helped the people who need it most?
                  </span>
                </p>
                <p className="text-carbon-300">
                  — Alex Littlewood, Founder
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
                Stand For
              </span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50"
              >
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-carbon-300 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={mobileViewport}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What can <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-500">ONRAMP</span> do for you?
            </h2>
            <p className="text-carbon-300 text-lg mb-8">
              Whether you're a technician looking to work smarter or a manager looking to drive profits — we built this for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/technicians"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300"
              >
                I'm a Technician
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/managers"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300"
              >
                I'm a Service Manager
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
