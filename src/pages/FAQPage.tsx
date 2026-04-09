import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackFAQExpanded } from '../lib/analytics';
import { useSEO } from '../hooks/useSEO';

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const faqCategories = [
  {
    category: "Why Not Just Use ChatGPT or Another Voice AI?",
    items: [
      {
        q: "I can already ask ChatGPT or Google how to fix something. Why do I need ONRAMP?",
        a: "ONRAMP isn't a general-purpose AI — it's built specifically for automotive technicians to work smarter, faster, and more efficiently. It works alongside you and guides you every step of the way — from diagnosis through repair to report writing. It's your AI co-worker that knows the vehicle, the complaint, the procedure, and exactly where you left off. You can pick up any repair conversation right where you stopped — whether it's been five minutes or five days. Every time you open ChatGPT or Google, you're starting from scratch with zero context. ONRAMP is hyper-focused on automotive repair, not general-purpose anything.",
      },
      {
        q: "Can't I just use other voice AI on my phone for free?",
        a: "You could — but you'd be talking to an AI that has no idea what job you're on, can't reference your uploaded service procedures, and won't auto-generate a warranty-ready RO report. General-purpose AI won't track and follow your workflow the way a purpose-built tool does, and it won't have the depth of knowledge on TSBs, known failures, and OEM procedures that ONRAMP has. Beyond that, voice AI on consumer services burns through tokens fast — even on expensive paid plans, you won't be able to stay on a voice session anywhere near as long as you can with ONRAMP. We're built to be alongside you for the entire repair, not a quick Q&A.",
      },
      {
        q: "What makes ONRAMP different from just Googling the repair?",
        a: "BULLET_GOOGLE_DIFF",
      },
    ],
  },
  {
    category: "How It Actually Works",
    items: [
      {
        q: "How does ONRAMP know what I'm working on?",
        a: "It's not that ONRAMP knows what you're working on — it's that ONRAMP is literally working on it with you. You're the hands. ONRAMP is helping you and coaching you from the start — accelerating your diagnosis, helping you find the issue, then guiding and coaching you through every step of the repair with important information like parts, part numbers, torque specifications, tools, and the individual steps of the procedure. Every piece of the conversation builds on what came before, so by the time you're deep into a repair, ONRAMP has the full story of the job.",
      },
      {
        q: "What are the four phases?",
        a: "BULLET_FOUR_PHASES",
      },
      {
        q: "Where do repair procedures come from?",
        a: "BULLET_REPAIR_PROCEDURES",
      },
      {
        q: "What document formats can I upload?",
        a: "PDF is the primary format. Just print your OEM procedure to PDF, drag and drop it into the job, and ONRAMP's AI extracts structured repair steps, parts lists, torque specs, and tool requirements automatically.",
      },
      {
        q: "How does the voice control work?",
        a: "BULLET_VOICE_CONTROL",
      },
      {
        q: "What is the Brain Button?",
        a: "A small wireless Bluetooth button that you clip to your belt or shirt. One press starts or stops your ONRAMP voice session — no fumbling with your phone with greasy hands. Important: the Brain Button is not a microphone or a speaker. It's purely a tactile control that activates the app. Headphones with a microphone are required for the voice experience — the Brain Button just gives you reliable physical start/stop control in any environment. We consider it a key part of how ONRAMP works best.",
      },
    ],
  },
  {
    category: "Shop Noise & Reliability",
    items: [
      {
        q: "Will it work in a noisy shop? Impact guns, air hoses, other techs talking?",
        a: "Yes. ONRAMP is hardened for real shop environments with advanced noise filtering and speech recognition tuned for high-noise conditions. That said, we'll be honest — a busy shop is a challenging audio environment. There may be the occasional time you need to repeat yourself, just like you would with a co-worker standing next to an impact gun. A Bluetooth headset with a boom mic gives you the best experience in loud bays.",
      },
      {
        q: "What if it misunderstands me?",
        a: "We use the most advanced speech recognition technology available, but sure — sometimes you might get misunderstood. All you have to do is correct it and talk to it like it's a person who didn't quite catch what you said. Say \"no, I meant...\" or just repeat yourself, and it will rebound naturally. It won't auto-advance steps or take action unless it's confident you asked for it.",
      },
      {
        q: "What happens if I lose connection?",
        a: "ONRAMP requires data via Wi-Fi or 5G to run the voice AI. If your connection drops, the session pauses and can reconnect. Your job data, notes, and progress are saved — nothing is lost. We're building a grace period feature so brief signal drops (like driving between buildings) don't interrupt your session.",
      },
    ],
  },
  {
    category: "Time Tracking & Performance",
    items: [
      {
        q: "Does ONRAMP track my time?",
        a: "Yes. Built-in clock in/out with a live dashboard timer tracks your time per job. You can adjust entries if you forget to clock in or out. The whole point is to help you understand where your time goes so you can work smarter, move faster, and flag more hours.",
      },
      {
        q: "I'm flat-rate. How does this help me?",
        a: "Everything about ONRAMP is built to help you work faster. No more terminal trips to look up procedures. No more diagnostic guesswork. No more writing 3C stories from memory at the end of the day. ONRAMP keeps you in the bay, focused on turning wrenches, with the AI handling the information and documentation alongside you. Less wasted time = more jobs completed = more hours flagged = more money in your pocket. The ROI calculator on our website shows the math for your specific situation.",
      },
      {
        q: "Can I see my performance over time?",
        a: "Yes. The app tracks your completed jobs, time-on-task, and performance metrics. Both techs and managers have dashboard views showing job history and analytics. The goal is to help you manage your performance and see the real impact on your efficiency and earnings.",
      },
    ],
  },
  {
    category: "Repair Order Reports & Documentation",
    items: [
      {
        q: "How does ONRAMP write my RO reports?",
        a: "ONRAMP follows alongside you through every step of the repair — capturing your diagnostic findings, measurements, notes, and actions as they happen. When you close out a job, it generates a complete RO report written in proper industry terminology and format, following the 3C+V framework (Condition, Cause, Correction, Validation). Because it was with you the entire time, nothing gets missed or forgotten.",
      },
      {
        q: "What is 3C+V documentation?",
        a: "It's the industry-standard format for repair documentation: Condition (what's wrong), Cause (why it's wrong), Correction (what you did), and Validation (proof it's fixed). ONRAMP captures all four components during the repair and assembles them into a properly formatted report automatically.",
      },
      {
        q: "Can I take photos and videos during the repair?",
        a: "Yes. Just tell the AI you want to open the camera, then grab your phone and capture a photo or video. They're attached to the job record and included in your documentation — critical for repairs that require visual evidence. Coming soon: Meta Glasses integration, so you can tell ONRAMP to take a photo or video through your Meta Glasses without ever reaching for your phone.",
      },
      {
        q: "Can I export and share my RO reports, photos, and videos?",
        a: "Yes. Everything created in ONRAMP — RO reports, photos, videos, documentation — can be automatically exported to your computer, making it easy to move content from ONRAMP into your DMS or any other system. In the future, direct API integrations will push this content automatically to your shop management system.",
      },
    ],
  },
  {
    category: "OEM Warranty Work",
    items: [
      {
        q: "How does ONRAMP help with warranty claims?",
        a: "The number one reason warranty claims get rejected is incomplete or poorly written documentation. ONRAMP solves this by building the documentation in real time as the technician works — not from memory hours later. Every diagnostic finding, every measurement, every step completed, and every part replaced is captured as it happens. The result is a thorough, properly formatted 3C+V report that gives warranty reviewers exactly what they need to approve the claim.",
      },
      {
        q: "Does it really help catch things that would otherwise get missed?",
        a: "Yes. Because ONRAMP follows the repair step by step, it helps ensure nothing is overlooked. If there's a gasket that needs replacing, a measurement that needs documenting, or a validation step that needs completing — ONRAMP is tracking it and making sure it ends up in the report. That thoroughness is what turns rejected claims into approved ones.",
      },
      {
        q: "Will this actually improve my warranty approval rate?",
        a: "When every repair is documented completely, in the correct format, with the right terminology — first-pass approval rates go up. It's that simple. Most rejections come from incomplete narratives, missing measurements, or skipped documentation steps. ONRAMP eliminates those gaps because it's documenting alongside the work, not after the fact.",
      },
    ],
  },
  {
    category: "Integration & Compatibility",
    items: [
      {
        q: "Does ONRAMP integrate with my DMS (Reynolds & Reynolds, CDK, Tekion)?",
        a: "ONRAMP currently generates DMS-ready RO reports and documentation that you paste into your existing system. Direct API integrations with specific DMS platforms are on the roadmap. The output is formatted to drop right into your RO notes regardless of which DMS you use.",
      },
      {
        q: "Does it work with AllData, Mitchell, or other info systems?",
        a: "ONRAMP doesn't replace your info subscription — it complements it. When you upload a PDF from any info system into ONRAMP, it takes a procedure that can normally be challenging to navigate and transforms it into an extremely consistent format where everything is hyper-organized: all replacement parts in one place, all tools in one place, and steps easily navigable. The AI then walks you through everything — in the Prepare phase it gives you detailed overviews to get you ready, and during the Repair phase it's in your ear with the right information exactly when you need it.",
      },
      {
        q: "Does it work on iPhone and Android?",
        a: "Yes. ONRAMP is developed as a web application with native apps for both iPhone and Android. Your mobile device is your primary interface for working with ONRAMP in the bay, with a full web complement available for dashboard access, document uploads, and management tasks.",
      },
    ],
  },
  {
    category: "For Service Managers",
    items: [
      {
        q: "How do I manage my team on ONRAMP?",
        a: "ONRAMP has full service center management built in. You create your service center, invite technicians by email, and manage seats from your dashboard. You see every tech's active and completed jobs, time-on-task, and performance metrics in real time.",
      },
      {
        q: "Can I see what my techs are working on right now?",
        a: "Yes. The manager dashboard shows active jobs, which phase each tech is in, and real-time status. You get visibility without walking the floor.",
      },
      {
        q: "Does ONRAMP send me reports?",
        a: "Yes. The system sends email notifications including usage alerts at key thresholds, and RO reports for completed jobs are available in the dashboard at any time.",
      },
      {
        q: "How does this help with training new techs?",
        a: "ONRAMP acts as a real-time mentor. A junior tech gets the same step-by-step AI guidance that mirrors how a senior tech would coach them through a job. They learn proper diagnostic flow, correct repair sequence, and documentation habits from day one. This reduces your training burden and lets newer techs take on more complex work sooner.",
      },
      {
        q: "What if a tech leaves? Do I lose their job history?",
        a: "No. All job data, RO reports, time records, and documentation belong to the service center. When a tech leaves, their completed work stays in your system. That said — because you're offering your technicians best-in-class technology that helps them work more efficiently and earn more money, we expect they'll want to stay and keep working for you.",
      },
    ],
  },
  {
    category: "Pricing, Plans & Usage",
    items: [
      {
        q: "How much does it cost?",
        a: "PRICING_LINK", // Special marker — rendered with Link component
      },
      {
        q: "How is AI voice time usage tracked?",
        a: "Usage is tracked by the time spent in an active voice session with ONRAMP's AI voice guide. If you're not in an active conversation with the AI, the clock isn't running. An active conversation includes the technician speaking, the AI processing and thinking, and the AI speaking back. Plans come with blocks of hours, but time is tracked in minutes against the usage pool for an individual technician or a service center.",
      },
      {
        q: "What if a technician just leaves it on and wastes minutes/hours?",
        a: "ONRAMP has an automated sleep mode that activates after 30 seconds of inactivity to minimize waste. If no one is speaking, the session goes to sleep and preserves the shop's hours. It can be woken up instantly with the Brain Button or a voice command — no need to restart anything.",
      },
      {
        q: "What happens if I use all my hours?",
        a: "You get email alerts at 50%, 75%, 90%, and 100% of your plan. You can purchase additional packages of hours at your plan's overage rate — either set it to auto-purchase or buy manually. No surprise shutoffs mid-repair. You can also upgrade your plan anytime.",
      },
      {
        q: "What if one technician uses it five times more than another?",
        a: "BULLET_USAGE_IMBALANCE",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes — no long-term contracts on our monthly plans. However, if you opt for an annual commitment (which comes with significant savings), that commitment is binding for the contract term.",
      },
      {
        q: "Is the Brain Button required?",
        a: "No, but highly recommended. The Brain Button gives you reliable, hands-free physical control over your voice sessions — and a much less greasy screen. Technicians who use the Brain Button have a better experience, more efficiency, and truly hands-free operation. We consider it a must-have for getting the most out of ONRAMP.",
      },
    ],
  },
  {
    category: "Data Security & Privacy",
    items: [
      {
        q: "Is my shop's data secure?",
        a: "Yes. When a service center is set up on ONRAMP, it runs on dedicated infrastructure with data isolated to your individual service center operations. All data is transmitted over encrypted connections, authentication uses secure password hashing, and your shop's information is completely separated from every other shop on the platform. SOC 2 compliance is a core priority for ONRAMP — we take enterprise-grade data security seriously because we know your shop's information is sensitive.",
      },
      {
        q: "Does ONRAMP record and store my voice?",
        a: "ONRAMP processes your voice in real-time to understand commands and provide guidance. AI transcripts and job notes are saved to your job record for documentation purposes. The focus is on the extracted content — what you said and the work that was done — not permanent audio storage.",
      },
      {
        q: "Are you training your AI on my uploaded documents?",
        a: "No. We have an explicit no-train policy. Documents uploaded to ONRAMP are used strictly and only to help that specific technician on that specific job. We do not use uploaded documents to train our AI models, and we do not share or access that data. In fact, document data is isolated to the individual technician — not even other technicians in the same service center can see each other's uploads. Two techs working the same procedure would each upload their own copy.",
      },
      {
        q: "Who can see my job data?",
        a: "Only you. Job data is isolated to the individual technician. Service center managers have visibility into job status, time tracking, and performance metrics through their dashboard, but the granular work content belongs to the tech who did the work.",
      },
    ],
  },
  {
    category: "Getting Started",
    items: [
      {
        q: "How fast can I get up and running?",
        a: "When you sign up for ONRAMP, you'll choose a start date. This gives us time to ship your Brain Button so you have it in hand when you're ready to go. On your activation date, you'll have the app, your Brain Button, and everything you need to start using ONRAMP on your first job. We want to make sure you have the right hardware from day one so you get the best possible experience.",
      },
      {
        q: "Do I need special training to use it?",
        a: "ONRAMP is conversational — you talk to it like you'd talk to a fellow tech. Say \"next step\" to advance, ask questions naturally, say \"take a note\" to capture something. It's not complicated. That said, for service centers, ONRAMP provides group onboarding training for the whole service department to make sure everyone gets the most out of it. We'll also have training videos available through the app and our knowledge base.",
      },
      {
        q: "What do I need to get started?",
        a: "A mobile device (iPhone or Android), headphones (Bluetooth or wired), and the Brain Button. That's it.",
      },
      {
        q: "What if I've never used AI before — not even typed?",
        a: "Then this is the perfect way to start. ONRAMP is a conversational AI — if you can have a conversation with another person, you can have a conversation with ONRAMP. It's designed to talk back and forth, collaborate, and help you with your work. There's no typing, no prompts to write, no learning curve beyond having a normal conversation. It's as natural as talking to a co-worker (with a big 'ol brain).",
      },
      {
        q: "Is ONRAMP available in languages other than English?",
        a: "Currently, ONRAMP is English only. Developing the app in additional languages is on our roadmap, and we're actively gauging demand from our user base to prioritize which languages to add next. If this is important to your shop, let us know — it helps us plan.",
      },
    ],
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

// Rich answers that need JSX formatting (bullets, links, etc.)
const richAnswers: Record<string, React.ReactNode> = {
  BULLET_REPAIR_PROCEDURES: (
    <div className="text-carbon-200 leading-relaxed space-y-3">
      <p>In some cases, ONRAMP's knowledge base has enough depth to generate reliable repair steps on its own. In other cases — especially complex repairs, newer vehicles, or specialized OEM procedures — it's far better to upload the technical repair manual so ONRAMP can work from the source material.</p>
      <ul className="space-y-4 ml-1">
        <li className="flex gap-3">
          <span className="text-electric-400 mt-1.5 text-xs">&#9679;</span>
          <span><strong className="text-white">AI-Generated Procedures</strong> — When ONRAMP generates repair steps from its knowledge base, it draws on deep automotive expertise to produce a thorough, structured workflow. This includes organized workflow sections, individual repair steps, a tools list, replacement parts with part numbers, torque specifications, fluid capacities, and relevant warnings — all generated with care and accuracy.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-electric-400 mt-1.5 text-xs">&#9679;</span>
          <span><strong className="text-white">Document Upload &amp; AI Extraction</strong> — When you upload an OEM procedure, ONRAMP's AI runs a detailed multi-step extraction process to parse every piece of information from the document. It identifies and organizes workflow sections, individual steps, part numbers, coded values, torque specifications, tool requirements, safety warnings, and technical notes — all structured into a clean, navigable format. Uploading is as simple as dragging and dropping a PDF into the job. And don't worry — uploaded documents are never shared. They are private and specific to the technician only.</span>
        </li>
      </ul>
    </div>
  ),
  PRICING_LINK: (
    <p className="text-carbon-200 leading-relaxed">
      ONRAMP's pricing is structured around the number one operating cost: the always-on voice AI, which is expensive to run. Plans are based on the number of voice AI hours shared across your shop, with volume discounts as you add more technicians. Visit our{' '}
      <Link to="/pricing" className="text-electric-400 hover:text-electric-300 underline underline-offset-2">
        pricing page
      </Link>{' '}
      to map out your costs for an individual technician or a full service center.
    </p>
  ),
  BULLET_GOOGLE_DIFF: (
    <div className="text-carbon-200 leading-relaxed space-y-3">
      <p>Three things:</p>
      <ul className="space-y-2 ml-1">
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">It's hands-free</strong> — you talk, it guides, you never touch a screen mid-repair.</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">It's contextual</strong> — it knows your exact vehicle, procedure, and where you are in the job.</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">It's documenting while you work</strong> — every step, measurement, and note gets captured into a warranty-grade RO report automatically.</span></li>
      </ul>
      <p>Google gives you a forum post. ONRAMP gives you a guided workflow with built-in documentation.</p>
    </div>
  ),
  BULLET_FOUR_PHASES: (
    <div className="text-carbon-200 leading-relaxed space-y-3">
      <p>Every job flows through four phases. You advance through them naturally — ONRAMP handles the transitions.</p>
      <ul className="space-y-2 ml-1">
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">Diagnose</strong> — AI helps you pinpoint the problem, cross-references TSBs and known failures.</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">Prepare</strong> — Reviews the procedure, confirms tools and parts, gives you a detailed overview of what's ahead.</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">Repair</strong> — Step-by-step voice coaching while you work.</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span><strong className="text-white">Close Out</strong> — Auto-generates your RO report with 3C+V documentation.</span></li>
      </ul>
    </div>
  ),
  BULLET_VOICE_CONTROL: (
    <div className="text-carbon-200 leading-relaxed space-y-3">
      <p>Put on your headphones — Bluetooth or wired — and put the app into voice mode from your screen or your Brain Button. From there, you just have a conversation with it. Talk naturally:</p>
      <ul className="space-y-2 ml-1">
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"Next step" / "Go back"</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"What's the torque spec?"</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"What size socket do I need?"</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"Take a note — found corrosion on the connector"</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"What's the pinout for the C210 connector?" / "Which wire goes to the PCM on pin 3?"</span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"I need to take a photo" — <em className="text-carbon-200">ONRAMP will open your camera for you.</em></span></li>
        <li className="flex gap-3"><span className="text-electric-400 mt-1.5 text-xs">&#9679;</span><span>"I need to see the diagram" / "Open the PDF" — <em className="text-carbon-200">ONRAMP will open to the page of the PDF you need.</em></span></li>
      </ul>
      <p>Get stuck on a step? Activate <strong className="text-white">Deep Research Mode</strong> by asking for more information, and ONRAMP's AI will go gather the most in-depth information possible to help you get the job done — without you having to leave the bay and walk to the terminal.</p>
    </div>
  ),
  BULLET_USAGE_IMBALANCE: (
    <div className="text-carbon-200 leading-relaxed space-y-3">
      <p>The pool of AI hours is shared between all technicians in your service center. You're going to have some techs who use it heavily and others who use it less — and that's fine. The shared pool means you're limiting waste because usage naturally balances out across the team.</p>
      <p>For technicians who aren't using it as much, that usually means they're not maximizing the performance they could be getting out of the app. ONRAMP will make proactive efforts to nudge and train those techs to make sure they're getting the full benefit.</p>
      <p>When their performance rate goes up, <strong className="text-white">they take home more money and the dealership makes more money</strong>. It's a win for everyone.</p>
    </div>
  ),
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const renderAnswer = () => {
    if (answer in richAnswers) {
      return richAnswers[answer];
    }
    return <p className="text-carbon-200 leading-relaxed">{answer}</p>;
  };

  return (
    <div className="border-b border-carbon-800/50">
      <button
        onClick={() => { if (!isOpen) trackFAQExpanded({ question: question.substring(0, 80), category: '' }); setIsOpen(!isOpen); }}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-white font-medium group-hover:text-electric-400 transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-carbon-200 group-hover:text-electric-400 transition-colors" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-10">
              {renderAnswer()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQCategory({ category, items }: { category: string; items: { q: string; a: string }[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={mobileViewport}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-1 h-8 bg-electric-500 rounded-full" />
        {category}
      </h2>
      <div className="bg-carbon-900/50 rounded-2xl border border-carbon-800/50 px-6 md:px-8">
        {items.map((item, i) => (
          <FAQItem key={i} question={item.q} answer={item.a} />
        ))}
      </div>
    </motion.section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

// Plain-text versions of rich answers for schema.org structured data
const plainTextAnswers: Record<string, string> = {
  BULLET_REPAIR_PROCEDURES: 'In some cases, ONRAMP\'s knowledge base generates reliable repair steps on its own. For complex repairs or OEM procedures, upload the technical repair manual and ONRAMP\'s AI extracts structured repair steps, parts lists, torque specs, and tool requirements automatically. PDF is the primary format — drag and drop into the job.',
  PRICING_LINK: 'ONRAMP\'s pricing is structured around voice AI hours. Plans are based on the number of voice AI hours shared across your shop, with volume discounts as you add more technicians. Visit our pricing page at getonramp.io/pricing to map out your costs.',
  BULLET_GOOGLE_DIFF: 'Three things: (1) It\'s hands-free — you talk, it guides, you never touch a screen mid-repair. (2) It\'s contextual — it knows your exact vehicle, procedure, and where you are in the job. (3) It\'s documenting while you work — every step, measurement, and note gets captured into a warranty-grade RO report automatically. Google gives you a forum post. ONRAMP gives you a guided workflow with built-in documentation.',
  BULLET_FOUR_PHASES: 'Every job flows through four phases: Diagnose (AI helps pinpoint the problem, cross-references TSBs), Prepare (reviews procedure, confirms tools and parts), Repair (step-by-step voice coaching), and Close Out (auto-generates RO report with 3C+V documentation).',
  BULLET_VOICE_CONTROL: 'Put on your headphones and activate voice mode from your screen or Brain Button. Talk naturally: "Next step", "What\'s the torque spec?", "Take a note — found corrosion on the connector", "I need to take a photo". Get stuck? Ask for more info and ONRAMP\'s Deep Research Mode gathers in-depth information without you leaving the bay.',
  BULLET_USAGE_IMBALANCE: 'The pool of AI hours is shared between all technicians. Some techs use it heavily, others less — the shared pool limits waste as usage naturally balances out. For techs not using it as much, ONRAMP proactively nudges them to maximize performance. When their performance rate goes up, they take home more money and the dealership makes more money.',
};

export default function FAQPage() {
  useSEO({
    title: 'FAQ - Frequently Asked Questions | OnRamp',
    description: 'Everything technicians and service managers need to know about OnRamp — voice AI, pricing, security, integration, and getting started.',
  });

  useEffect(() => {
    const scriptId = 'faq-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqCategories.flatMap((cat) =>
        cat.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: plainTextAnswers[item.a] || item.a,
          },
        }))
      ),
    });
    return () => { script?.remove(); };
  }, []);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/20 rounded-full px-4 py-1.5 mb-6">
            <HelpCircle className="w-4 h-4 text-electric-400" />
            <span className="text-electric-400 text-sm font-medium">Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Got Questions? We've Got Answers.
          </h1>
          <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
            Everything technicians and service managers want to know about ONRAMP — from how the voice AI works in a real shop to pricing, security, and getting started.
          </p>
        </motion.div>

        {/* FAQ Categories */}
        {faqCategories.map((cat, i) => (
          <FAQCategory key={i} category={cat.category} items={cat.items} />
        ))}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={mobileViewport}
          transition={{ duration: 0.5 }}
          className="text-center mt-20 bg-gradient-to-br from-electric-500/10 to-carbon-900/50 rounded-2xl border border-electric-500/20 p-10 md:p-14"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions? <span className="text-safety-500">Let's talk.</span>
          </h2>
          <p className="text-carbon-200 text-lg mb-8 max-w-xl mx-auto">
            We'd love to hear from you. Reach out to our team or check out our pricing to find the right plan for your shop.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3 bg-electric-500 hover:bg-electric-600 text-white font-semibold rounded-xl transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 bg-carbon-800 hover:bg-carbon-700 text-white font-semibold rounded-xl border border-carbon-700 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
