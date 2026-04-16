import { motion, AnimatePresence } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Brain, FileText, Volume2, ArrowRight, Camera,
  CheckCircle2, Wrench, FileCheck, Radio, Smartphone, CircleDot, Search,
  Play, Pause, AlertCircle, ListChecks, Zap, AudioLines, Gauge, UserCog,
  MessageCircle, SlidersHorizontal, Sparkles, X, Headphones,
} from 'lucide-react';
import QuickStartDemo from '../components/QuickStartDemo';
import { trackAudioPlayed, trackVoiceExplorerOpened, trackVoiceSamplePlayed } from '../lib/analytics';
import { useSEO } from '../hooks/useSEO';
import { getCurrentAudio, setCurrentAudio, notifyAudioChanged, subscribeToAudioChanges } from '../lib/audioBus';

const workflowSteps = [
  {
    id: 'input',
    icon: Mic,
    label: 'Voice Input',
    description: 'Speak conversationally with the AI while you work — your AI wingman helps you get the job done.',
  },
  {
    id: 'process',
    icon: Brain,
    label: 'Purpose-Built AI Processing',
    description: 'Hyper-focused, automotive-trained, real-time understanding and context awareness. Rapidly processes diagnosis and procedural information.',
  },
  {
    id: 'output',
    icon: Volume2,
    label: 'AI Voice Response',
    description: 'The AI generates natural, conversational dialogue back directly into the technician\'s headphones so they can continue to work hands-free.',
  },
  {
    id: 'document',
    icon: FileText,
    label: 'Auto Documentation',
    description: 'The AI collects notes from the diagnosis and repair phases to document everything relevant, then automatically generates pertinent reports.',
  },
];

const phases = [
  {
    name: 'DIAGNOSE',
    icon: Search,
    color: 'electric',
    title: 'Pinpoint the Problem',
    titleAccent: 'AI FAST!',
    bgImage: '/technician-diagnosing.webp',
    description: 'Describe the symptoms and ONRAMP helps you work through a structured diagnostic process. The AI cross-references TSBs, known failures, and common causes for your specific vehicle — narrowing the problem before you start tearing anything apart.',
    details: [
      "References TSBs & Recalls ('95 - Today), and known failures",
      'Symptom-driven diagnostic flow that works at the speed of AI',
      "Leverages AI's deep understanding of automotive systems",
      'Prioritizes most likely causes - guides technician to ID root cause',
      'Documents thorough diagnostic notes as technician tests',
      'Gets you to the root cause fast!',
    ],
    audio: '/audio/diagnose-audio-sample.wav',
    buttonLabel: 'Hear ONRAMP Diagnose Fast',
  },
  {
    name: 'PREPARE',
    icon: ListChecks,
    color: 'amber',
    title: 'Prepare to Perform.',
    description: "ONRAMP's AI organizes all the complex details of the job and briefs technicians so they know exactly what they're getting into. Never again get caught off guard by specialty tools or replacement parts mid-job.",
    details: [
      'Ingests OEM procedure documents for complex jobs',
      'OR... AI generates procedures in many simpler cases',
      'ONRAMP AI clearly organizes all the steps, and adds detail',
      'AI extracts and summarizes project warnings and technical notes',
      'Generates a tools list and a replacement parts list',
      "ONRAMP briefs tech's with pertinent info while they get ready",
    ],
    audio: '/audio/prepare-audio-sample.wav',
    buttonLabel: 'Listen as ONRAMP Briefs the Tech',
  },
  {
    name: 'REPAIR',
    icon: Wrench,
    color: 'green',
    title: 'Voice-Guided Repairs',
    bgImage: '/technician-working.webp',
    description: 'Work with your hands while ONRAMP coaches you through each step. Ask questions, report findings, and document your work—all by voice. The AI tracks your progress and adjusts guidance in real-time.',
    details: [
      "AI delivers step details, torque specs and 'heads-up' guidance live as you need it!",
      'Hands-free — Voice AI conversation flow while you work',
      'Start/Stop sessions with Bluetooth Brain Button',
      'Integrated timeclock to track time worked',
      'ONRAMP tracks progress and keeps perfect notes',
      'Capture photos & videos with phone or Meta glasses',
      'Open PDFs to the exact page/diagram you need - using voice',
      'No more time-wasting trips to the terminal!',
    ],
    audio: '/audio/perform-audio-sample.wav',
    buttonLabel: 'Hear ONRAMP Guide the Procedure',
  },
  {
    name: 'CLOSE OUT',
    icon: FileCheck,
    color: 'orange',
    title: 'AI-Generated RO Reports — Instantly.',
    description: 'When the job is done, ONRAMP compiles everything you said and did into a perfect, professional, warranty-worthy RO report. Complaint, Cause, Correction and Validation — structured automatically from your natural speech.',
    details: [
      'Complete 3C+V reports — written perfectly, instantly',
      'Capture final photos and videos',
      'Pre-submission validation catches missing fields',
      'Ready for DMS upload or print',
      'No wasted time at the keyboard!',
    ],
    audio: '/audio/close-out-audio-sample.wav',
    buttonLabel: 'Listen as ONRAMP Writes the RO Report',
  },
];

const hardware = [
  {
    icon: CircleDot,
    name: 'Brain Button',
    description: "ONRAMP's Brain Button is a wireless Bluetooth button that clips to your shirt or belt. Tap-to-talk activates your AI voice wingman. Tap-to-pause. All hands-free and voice controlled. No greasy phone screens!",
    image: '/BrainButton.png',
  },
  {
    icon: Smartphone,
    name: 'Mobile App',
    description: 'The ONRAMP app runs on iOS and Android. It connects to the Brain Button and streams AI voice conversationally through your headphones.',
  },
  {
    icon: Radio,
    name: 'Your Headphones',
    description: 'Use your existing Bluetooth or wired headphones! ONRAMP works with any headphones as long as they have an integrated microphone.',
    image: '/airpods.png',
  },
];

function useAudioPlayer(src: string, onPlay?: () => void) {
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  // Listen for other instances taking over playback
  useEffect(() => {
    const onAudioChange = () => {
      if (getCurrentAudio() !== audioRef.current && state === 'playing') {
        setState('idle');
        setProgress(0);
        stopTracking();
      }
    };
    return subscribeToAudioChanges(onAudioChange);
  }, [state, stopTracking]);

  const toggle = useCallback(() => {
    if (state === 'error') return;

    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause();
      setState('idle');
      stopTracking();
      setCurrentAudio(null);
      return;
    }

    // Stop any other playing audio
    const existing = getCurrentAudio();
    if (existing && existing !== audioRef.current) {
      existing.pause();
      existing.currentTime = 0;
      setCurrentAudio(null);
      notifyAudioChanged();
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.addEventListener('ended', () => {
          setState('idle');
          setProgress(0);
          stopTracking();
          setCurrentAudio(null);
        });
        audioRef.current.addEventListener('error', () => {
          setState('error');
          stopTracking();
        });
      }

      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = 1.1;
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.then(() => {
          setState('playing');
          setCurrentAudio(audioRef.current);
          notifyAudioChanged();
          rafRef.current = requestAnimationFrame(updateProgress);
          onPlay?.();
        }).catch(() => {
          setState('error');
        });
      }
    } catch {
      setState('error');
    }
  }, [state, src, updateProgress, stopTracking, onPlay]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (getCurrentAudio() === audioRef.current) setCurrentAudio(null);
      }
      stopTracking();
    };
  }, [stopTracking]);

  return { state, progress, toggle };
}

function AudioSamplePlayer({ accentColor, state, progress, toggle, label }: {
  accentColor: string;
  state: 'idle' | 'playing' | 'error';
  progress: number;
  toggle: () => void;
  label: string;
}) {
  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 mt-6 p-3 rounded-lg bg-carbon-800/60 border border-carbon-700/50">
        <AlertCircle className="w-4 h-4 text-carbon-200 flex-shrink-0" />
        <span className="text-carbon-200 text-sm">
          Your browser doesn't support audio playback.{' '}
          <Link to="/contact" className="underline hover:text-white transition-colors">Request a live demo</Link> instead!
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      className="group flex items-center gap-3 mt-6 px-4 py-2.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        backgroundColor: state === 'playing' ? `${accentColor}15` : 'transparent',
        borderColor: state === 'playing' ? `${accentColor}50` : '#3A3A38',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 32,
          height: 32,
          backgroundColor: state === 'playing' ? `${accentColor}25` : `${accentColor}15`,
        }}
      >
        {state === 'playing' ? (
          <Pause size={14} style={{ color: accentColor }} />
        ) : (
          <Play size={14} style={{ color: accentColor, marginLeft: '2px' }} />
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-medium text-carbon-200">
          {state === 'playing' ? 'Playing sample...' : label}
        </span>
        <div className="w-48 h-1 rounded-full bg-carbon-700/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </button>
  );
}

function PhonePlayButton({ accentColor, state, progress, toggle }: {
  accentColor: string;
  state: 'idle' | 'playing' | 'error';
  progress: number;
  toggle: () => void;
}) {
  if (state === 'error') return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      className="flex flex-col items-center gap-2 group"
    >
      {/* Play/Pause circle — 20% bigger (44→53) */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 53,
          height: 53,
          backgroundColor: state === 'playing' ? `${accentColor}30` : `${accentColor}20`,
          border: `2px solid ${accentColor}`,
        }}
      >
        {state === 'playing' ? (
          <Pause size={22} style={{ color: accentColor }} />
        ) : (
          <Play size={22} style={{ color: accentColor, marginLeft: '2px' }} />
        )}
      </motion.div>
      {/* Label — doubled (9→18px) */}
      <span style={{
        color: state === 'playing' ? accentColor : '#888',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
      }}>
        {state === 'playing' ? 'PLAYING' : 'SAMPLE'}
      </span>
      {/* Progress bar — much wider */}
      <div
        className="overflow-hidden rounded-full"
        style={{
          width: '80%',
          minWidth: 120,
          height: 4,
          backgroundColor: state === 'playing' ? `${accentColor}20` : '#333',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </button>
  );
}

const colorMap: Record<string, { badge: string; check: string; text: string; border: string; phoneBg: string; phoneAccent: string }> = {
  electric: { badge: 'bg-electric-500/10 text-electric-400 border-electric-500/30', check: 'text-electric-400', text: 'text-electric-400', border: 'border-electric-500/30', phoneBg: 'bg-electric-500/20', phoneAccent: '#4A90D9' },
  amber: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', check: 'text-yellow-400', text: 'text-yellow-400', border: 'border-yellow-500/30', phoneBg: 'bg-yellow-500/20', phoneAccent: '#EAB308' },
  green: { badge: 'bg-green-500/10 text-green-400 border-green-500/30', check: 'text-green-400', text: 'text-green-400', border: 'border-green-500/30', phoneBg: 'bg-green-500/20', phoneAccent: '#22C55E' },
  orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', check: 'text-orange-400', text: 'text-orange-400', border: 'border-orange-500/30', phoneBg: 'bg-orange-500/20', phoneAccent: '#F97316' },
};

function AIStackCard() {
  const { state, toggle } = useAudioPlayer('/audio/diagnose-audio-sample.wav', () => trackAudioPlayed({ sample: 'ai-stack-demo', page: 'how-it-works' }));

  const items = [
    { icon: Zap, title: 'Low-Latency Voice AI', desc: 'Real-time conversational responses with no awkward pauses. It feels like talking to a person, not waiting for a computer.' },
    { icon: Wrench, title: 'Purpose-Built for Automotive', desc: 'Deep knowledge of vehicle systems, repair procedures, TSBs, and diagnostic patterns — not a generic chatbot.' },
    { icon: Sparkles, title: 'Cutting-Edge AI Models', desc: 'Advanced thinking and voice models working together — the same technology powering the most sophisticated AI systems in the world.' },
    { icon: AudioLines, title: 'Natural, Clean Audio', desc: 'Studio-quality voice that sounds like a real person. Clear, conversational, and easy to understand in a noisy shop.', audioSample: true as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={mobileViewport}
      className="p-6 md:p-8 rounded-2xl bg-carbon-800/50 border border-electric-500/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-electric-500/10">
          <Brain className="w-6 h-6 text-electric-400" />
        </div>
        <h3 className="text-white font-bold text-xl">Best-in-Class AI Stack</h3>
      </div>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-electric-500/10 mt-0.5">
              <item.icon className="w-4 h-4 text-electric-400" />
            </div>
            <div>
              <div className="text-white font-semibold mb-1">{item.title}</div>
              <p className="text-carbon-200 text-sm leading-relaxed">{item.desc}</p>
              {'audioSample' in item && item.audioSample && (
                <button
                  onClick={toggle}
                  className="inline-flex items-center gap-1.5 mt-2 text-electric-400 hover:text-electric-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  {state === 'playing' ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
                  {state === 'playing' ? 'Pause sample' : 'Play sample'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Voice Sample Data ──────────────────────────────────────────────────────
const voiceSamples: { name: string; gender: 'male' | 'female'; label: string; file: string }[] = [
  // Male voices (15)
  { name: 'Apollo', gender: 'male', label: 'Apollo', file: '/audio/voices/apollo-job.wav' },
  { name: 'Arcas', gender: 'male', label: 'Arcas', file: '/audio/voices/arcas-job.wav' },
  { name: 'Aries', gender: 'male', label: 'Aries', file: '/audio/voices/aries-job.wav' },
  { name: 'Atlas', gender: 'male', label: 'Atlas', file: '/audio/voices/atlas-job.wav' },
  { name: 'Draco', gender: 'male', label: 'Draco', file: '/audio/voices/draco-job.wav' },
  { name: 'Hermes', gender: 'male', label: 'Hermes', file: '/audio/voices/hermes-job.wav' },
  { name: 'Hyperion', gender: 'male', label: 'Hyperion', file: '/audio/voices/hyperion-job.wav' },
  { name: 'Jupiter', gender: 'male', label: 'Jupiter', file: '/audio/voices/jupiter-job.wav' },
  { name: 'Mars', gender: 'male', label: 'Mars', file: '/audio/voices/mars-job.wav' },
  { name: 'Neptune', gender: 'male', label: 'Neptune', file: '/audio/voices/neptune-job.wav' },
  { name: 'Odysseus', gender: 'male', label: 'Odysseus', file: '/audio/voices/odysseus-job.wav' },
  { name: 'Orion', gender: 'male', label: 'Orion', file: '/audio/voices/orion-job.wav' },
  { name: 'Orpheus', gender: 'male', label: 'Orpheus', file: '/audio/voices/orpheus-job.wav' },
  { name: 'Pluto', gender: 'male', label: 'Pluto', file: '/audio/voices/pluto-job.wav' },
  { name: 'Saturn', gender: 'male', label: 'Saturn', file: '/audio/voices/saturn-job.wav' },
  { name: 'Zeus', gender: 'male', label: 'Zeus', file: '/audio/voices/zeus-job.wav' },
  // Female voices (25)
  { name: 'Amalthea', gender: 'female', label: 'Amalthea', file: '/audio/voices/amalthea-job.wav' },
  { name: 'Andromeda', gender: 'female', label: 'Andromeda', file: '/audio/voices/andromeda-job.wav' },
  { name: 'Asteria', gender: 'female', label: 'Asteria', file: '/audio/voices/asteria-job.wav' },
  { name: 'Athena', gender: 'female', label: 'Athena', file: '/audio/voices/athena-job.wav' },
  { name: 'Aurora', gender: 'female', label: 'Aurora', file: '/audio/voices/aurora-job.wav' },
  { name: 'Callista', gender: 'female', label: 'Callista', file: '/audio/voices/callista-job.wav' },
  { name: 'Cora', gender: 'female', label: 'Cora', file: '/audio/voices/cora-job.wav' },
  { name: 'Cordelia', gender: 'female', label: 'Cordelia', file: '/audio/voices/cordelia-job.wav' },
  { name: 'Delia', gender: 'female', label: 'Delia', file: '/audio/voices/delia-job.wav' },
  { name: 'Electra', gender: 'female', label: 'Electra', file: '/audio/voices/electra-job.wav' },
  { name: 'Harmonia', gender: 'female', label: 'Harmonia', file: '/audio/voices/harmonia-job.wav' },
  { name: 'Helena', gender: 'female', label: 'Helena', file: '/audio/voices/helena-job.wav' },
  { name: 'Hera', gender: 'female', label: 'Hera', file: '/audio/voices/hera-job.wav' },
  { name: 'Iris', gender: 'female', label: 'Iris', file: '/audio/voices/iris-job.wav' },
  { name: 'Janus', gender: 'female', label: 'Janus', file: '/audio/voices/janus-job.wav' },
  { name: 'Juno', gender: 'female', label: 'Juno', file: '/audio/voices/juno-job.wav' },
  { name: 'Luna', gender: 'female', label: 'Luna', file: '/audio/voices/luna-job.wav' },
  { name: 'Minerva', gender: 'female', label: 'Minerva', file: '/audio/voices/minerva-job.wav' },
  { name: 'Ophelia', gender: 'female', label: 'Ophelia', file: '/audio/voices/ophelia-job.wav' },
  { name: 'Pandora', gender: 'female', label: 'Pandora', file: '/audio/voices/pandora-job.wav' },
  { name: 'Phoebe', gender: 'female', label: 'Phoebe', file: '/audio/voices/phoebe-job.wav' },
  { name: 'Selene', gender: 'female', label: 'Selene', file: '/audio/voices/selene-job.wav' },
  { name: 'Thalia', gender: 'female', label: 'Thalia', file: '/audio/voices/thalia-job.wav' },
  { name: 'Theia', gender: 'female', label: 'Theia', file: '/audio/voices/theia-job.wav' },
  { name: 'Vesta', gender: 'female', label: 'Vesta', file: '/audio/voices/vesta-job.wav' },
];

// ─── Voice Explorer Modal ───────────────────────────────────────────────────
function VoiceExplorerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (file: string) => {
    if (playingFile === file) {
      audioRef.current?.pause();
      setPlayingFile(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(file);
    audio.playbackRate = 1.1;
    audio.onended = () => setPlayingFile(null);
    audio.play();
    audioRef.current = audio;
    setPlayingFile(file);
    const voice = voiceSamples.find(v => v.file === file);
    if (voice) trackVoiceSamplePlayed({ voice: voice.name, gender: voice.gender });
  };

  // Cleanup on close
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      setPlayingFile(null);
    }
  }, [open]);

  if (!open) return null;

  const filtered = filter === 'all' ? voiceSamples : voiceSamples.filter(v => v.gender === filter);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[80vh] rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-carbon-700/50 flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-safety-500/10">
                <Headphones className="w-5 h-5 text-safety-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Explore Voice Options</h3>
                <p className="text-carbon-200 text-sm">Tap play to hear each voice style</p>
              </div>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['all', 'male', 'female'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-safety-500/20 text-safety-400 border border-safety-500/30'
                      : 'text-carbon-200 hover:text-white hover:bg-carbon-700/50'
                  }`}
                >
                  {f === 'all' ? `All (${voiceSamples.length})` : f === 'male' ? `Male (${voiceSamples.filter(v => v.gender === 'male').length})` : `Female (${voiceSamples.filter(v => v.gender === 'female').length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Voice list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.map((voice) => {
              const isPlaying = playingFile === voice.file;
              return (
                <button
                  key={voice.name}
                  onClick={() => togglePlay(voice.file)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-safety-500/10 border-safety-500/30'
                      : 'bg-carbon-900/40 border-carbon-700/30 hover:border-carbon-600/50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isPlaying ? 'bg-safety-500/20' : 'bg-carbon-700/50'
                  }`}>
                    {isPlaying ? (
                      <Pause size={16} className="text-safety-400" />
                    ) : (
                      <Play size={16} className="text-carbon-200 ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white text-sm font-medium">{voice.label}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    voice.gender === 'male'
                      ? 'bg-electric-500/10 text-electric-400'
                      : 'bg-pink-500/10 text-pink-400'
                  }`}>
                    {voice.gender}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Personalization Card ───────────────────────────────────────────────────
function PersonalizationCard() {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={mobileViewport}
        className="p-6 md:p-8 rounded-2xl bg-carbon-800/50 border border-safety-500/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-safety-500/10">
            <UserCog className="w-6 h-6 text-safety-400" />
          </div>
          <h3 className="text-white font-bold text-xl">Make It Yours</h3>
        </div>
        <div className="space-y-5">
          {/* 40+ Voice Options — with explore button */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-safety-500/10 mt-0.5">
              <MessageCircle className="w-4 h-4 text-safety-400" />
            </div>
            <div>
              <div className="text-white font-semibold mb-1">40+ Voice Options</div>
              <p className="text-carbon-200 text-sm leading-relaxed">Choose from over 40 voices — male, female, different styles and accents. Find the one that feels right for you.</p>
              <button
                onClick={() => { setVoiceModalOpen(true); trackVoiceExplorerOpened(); }}
                className="inline-flex items-center gap-1.5 mt-2 text-safety-400 hover:text-safety-300 text-sm font-medium transition-colors cursor-pointer"
              >
                <Headphones size={14} />
                Explore Voice Options
              </button>
            </div>
          </div>

          {/* Other personalization items */}
          {[
            { icon: UserCog, title: 'Name Your AI', desc: 'Give your wingman a name. It\'s your AI — make it feel personal. It\'ll respond to whatever you name it.' },
            { icon: SlidersHorizontal, title: 'Adjustable Speech Speed', desc: 'Speed it up when you\'re experienced with a procedure. Slow it down for complex, unfamiliar work. You\'re in control.' },
            { icon: Gauge, title: 'Your AI Adapts to You', desc: 'ONRAMP learns your preferences and adapts to how you work. The more you use it, the better it gets.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-safety-500/10 mt-0.5">
                <item.icon className="w-4 h-4 text-safety-400" />
              </div>
              <div>
                <div className="text-white font-semibold mb-1">{item.title}</div>
                <p className="text-carbon-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <VoiceExplorerModal open={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </>
  );
}

// ─── "No App Screenshot?" Modal ──────────────────────────────────────────────
const phoneScreenshots = [
  '/diagnose-screen.webp',
  '/prepare-screen.webp',
  '/workflow-screen.webp',
  '/step-screen-1.webp',
  '/step-screen-2.webp',
];

function NoScreenshotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(0);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phoneScreenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl rounded-2xl bg-carbon-800 border border-carbon-700/50 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-carbon-700/50 hover:bg-carbon-600/50 text-carbon-200 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Phone with cycling screenshots */}
              <div className="flex-shrink-0">
                <div className="relative mx-auto w-[180px]">
                  <div
                    className="absolute overflow-hidden z-0"
                    style={{ left: '3.5%', right: '3.5%', top: '1.5%', bottom: '1.5%', borderRadius: '1.5rem' }}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={currentIndex}
                        src={phoneScreenshots[currentIndex]}
                        alt="ONRAMP app"
                        className="w-full h-full object-cover object-top absolute inset-0"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-30%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </AnimatePresence>
                  </div>
                  <img
                    src="/apple-iphone-17-pro-max-2025-medium.png"
                    alt=""
                    className="relative z-10 w-full h-auto drop-shadow-2xl"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-4">Why no app screenshot?</h3>
                <div className="space-y-3 text-carbon-200 text-sm leading-relaxed">
                  <p>
                    The whole point of ONRAMP is to work <strong className="text-white">completely hands-free</strong>. Your phone stays locked and in your pocket while you work.
                  </p>
                  <p>
                    The AI voice assistant is in your ear through your headphones — coaching you, answering questions, and documenting everything as you go. No screen needed.
                  </p>
                  <p>
                    Behind the scenes, the app is building a detailed repository of your diagnostic findings, repair notes, measurements, and photos — all accessible anytime you want to review it.
                  </p>
                  <p className="text-carbon-200 text-xs italic">
                    That's what hands-free really means.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PhaseSection({ phase, index }: { phase: typeof phases[number]; index: number }) {
  const colors = colorMap[phase.color];
  const textOnRight = index % 2 === 1 || index === 3;
  const { state, progress, toggle } = useAudioPlayer(phase.audio, () => trackAudioPlayed({ sample: phase.name, page: 'how-it-works' }));
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

  return (
    <div
      className={`flex flex-col ${textOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-16`}
    >
      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, x: textOnRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={mobileViewport}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2"
      >
        <div className="flex justify-center lg:justify-start">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold tracking-wider mb-4 ${colors.badge}`}>
            <phase.icon className="w-4 h-4" />
            {phase.name}
          </div>
        </div>
        <h3 className="text-white font-bold text-2xl md:text-3xl mb-4 text-center lg:text-left">
          {phase.title}
          {phase.titleAccent && (
            <><span className="hidden md:inline"> — </span><br className="md:hidden" /><span className={`${colors.text}`}>{phase.titleAccent}</span></>
          )}
        </h3>
        <p className="text-carbon-200 text-lg mb-6">{phase.description}</p>
        <div className="space-y-3">
          {phase.details.map((detail) => (
            <div key={detail} className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.check}`} />
              <span className="text-carbon-200">{detail}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center lg:justify-start">
          <AudioSamplePlayer accentColor={colors.phoneAccent} state={state} progress={progress} toggle={toggle} label={phase.buttonLabel} />
        </div>
      </motion.div>

      {/* Phone mockup with play button */}
      <motion.div
        initial={{ opacity: 0, x: textOnRight ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={mobileViewport}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full lg:w-1/2 flex flex-col items-center"
      >
        <div className="relative mx-auto w-[220px] md:w-[260px]">
          <div className={`absolute inset-0 ${colors.phoneBg} rounded-full blur-[80px] scale-75 opacity-50`} />
          {/* Screen content inside frame — z-20 so it's clickable above the frame image */}
          <div
            className="absolute overflow-hidden z-20 flex flex-col"
            style={{
              left: '5.5%',
              right: '5.5%',
              top: '3%',
              bottom: '3%',
              borderRadius: '2rem',
              backgroundColor: '#141410',
            }}
          >
            {/* Top third: icon + phase name */}
            <div className="flex flex-col items-center justify-center" style={{ flex: '1 1 0%', paddingTop: '25%' }}>
              <phase.icon className="w-12 h-12 mb-3" style={{ color: colors.phoneAccent }} />
              <span style={{
                color: colors.phoneAccent,
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.08em',
              }}>
                {phase.name}
              </span>
            </div>

            {/* Bottom third: play button + "Listen" */}
            <div className="flex flex-col items-center justify-center" style={{ flex: '1 1 0%', paddingBottom: '15%' }}>
              <PhonePlayButton
                accentColor={colors.phoneAccent}
                state={state}
                progress={progress}
                toggle={toggle}
              />
            </div>
          </div>
          {/* Frame image — pointer-events-none so clicks pass through to screen content */}
          <img
            src="/apple-iphone-17-pro-max-2025-medium.png"
            alt=""
            className="relative z-10 w-full h-auto drop-shadow-2xl pointer-events-none"
            loading="lazy"
          />
        </div>
        <button
          onClick={() => setScreenshotModalOpen(true)}
          className="mt-3 text-carbon-200 text-xs hover:text-white transition-colors cursor-pointer underline underline-offset-2"
        >
          No app screenshot?
        </button>
      </motion.div>
      <NoScreenshotModal open={screenshotModalOpen} onClose={() => setScreenshotModalOpen(false)} />
    </div>
  );
}

export default function HowItWorksPage() {
  useSEO({
    title: 'How It Works - Voice AI Repair Workflow | OnRamp',
    description: 'See how OnRamp\'s voice AI guides technicians from diagnosis through repair with step-by-step instructions and automatic documentation.',
  });
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-safety-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 font-black tracking-tight">
              ONRAMP
            </span>{' '}
            Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-carbon-200 max-w-3xl mx-auto"
          >
            A voice-first AI assistant that accelerates technician performance on every repair.
            Here's what happens from the moment you start a repair order.
          </motion.p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">Quick Start</span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-8 leading-tight">
                15 Seconds to<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">Start a Repair.</span>
              </h1>

              <ol className="space-y-4 text-left max-w-lg mx-auto lg:mx-0 mb-8">
                {[
                  { num: '1', text: <>Enter the RO Number</> },
                  { num: '2', text: <>Snap the VIN <Camera className="w-5 h-5 inline-block ml-1 align-text-bottom text-carbon-200" /></> },
                  { num: '3', text: <>Launch the Voice Session</> },
                ].map((step, i) => (
                  <motion.li
                    key={step.num}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={mobileViewport}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-electric-500/15 border border-electric-500/30 flex items-center justify-center">
                      <span className="text-electric-400 text-sm font-bold">{step.num}</span>
                    </div>
                    <span className="text-carbon-200 text-lg">{step.text}</span>
                  </motion.li>
                ))}
              </ol>

              {/* "Put your headphones on" + accessories row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 max-w-lg mx-auto lg:mx-0"
              >
                <div className="leading-relaxed flex-shrink-0">
                  <span className="text-carbon-200 text-lg">Put on your headphones<br /> and Brain Button!</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 font-semibold text-xl md:text-2xl">
                    ...you're hands-free from here!
                  </span>
                </div>
                {/* Flic + AirPods centered together */}
                <div className="flex items-center gap-1 lg:translate-x-8">
                  <img
                    src="/BrainButton.png"
                    alt="Brain Button"
                    className="w-22 md:w-28 h-auto"
                    loading="lazy"
                    style={{ filter: "drop-shadow(0 0 10px rgba(26,160,255,0.2))" }}
                  />
                  <img
                    src="/airpods.png"
                    alt="AirPods"
                    className="w-32 md:w-40 h-auto drop-shadow-xl"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Animated Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-electric-500/20 rounded-full blur-[80px] scale-75 opacity-50" />
                <div className="relative">
                  <QuickStartDemo />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Four Phases */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Four Phases.<br className="md:hidden" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">One Seamless Flow.</span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              ONRAMP adapts its behavior as you move through each phase of the repair—from diagnosis to close out.
            </p>
          </motion.div>

          <div className="space-y-20 md:space-y-28">
            {phases.map((phase, index) => (
              phase.bgImage ? (
                <div
                  key={phase.name}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(${phase.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 50%',
                    width: '100vw',
                    marginLeft: 'calc(-50vw + 50%)',
                    borderRadius: 0,
                  }}
                >
                  <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <PhaseSection phase={phase} index={index} />
                  </div>
                </div>
              ) : (
                <PhaseSection key={phase.name} phase={phase} index={index} />
              )
            ))}
          </div>
        </div>
      </section>

      {/* The Voice Loop */}
      <section
        className="py-20 px-4 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.75), rgba(6,6,13,0.75)), url(/ElectricLandscape.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              No More Typing.<br className="md:hidden" />{' '}
              Just Tap-to-Talk.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400 mt-2 inline-block">ONRAMP Documents Everything.</span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-3xl mx-auto">
              ONRAMP listens, understands context, and writes your repair orders while you work.<br className="hidden md:block" /> No typing. No terminal trips.
            </p>
          </motion.div>

          {/* Step Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                onClick={() => { setActiveStep(index); setIsPlaying(false); }}
                className={`relative cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-carbon-800/80 border-electric-500/50 glow-electric'
                    : 'bg-carbon-800/40 border-carbon-700/50 hover:border-carbon-600/50'
                }`}
              >
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                  activeStep === index ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/50' : 'bg-carbon-700 text-carbon-200'
                }`}>
                  {index + 1}
                </div>
                <div className={`inline-flex p-3 rounded-xl mb-4 ${activeStep === index ? 'bg-electric-500/20 text-electric-400' : 'bg-carbon-700/50 text-carbon-200'}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold mb-2">{step.label}</h3>
                <p className="text-carbon-200 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Your AI, Your Way */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport} className="text-center mb-16">
            <span className="text-electric-400 text-sm font-semibold tracking-wider uppercase">
              Built Different
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
              Your AI,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">Your Way.</span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              Best-in-class AI voice technology, personalized to each technician.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Tech Stack */}
            <AIStackCard />

            {/* Personalization */}
            <PersonalizationCard />
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section
        className="py-20 px-4 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(6,6,13,0.85), rgba(6,6,13,0.8)), url(/3-bay-close-up.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              What You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">Need</span>
            </h2>
            <p className="text-carbon-200 text-lg max-w-2xl mx-auto">
              ONRAMP runs on hardware you already own.<br />The Brain Button is the only new piece.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {hardware.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={mobileViewport}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700/50"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`absolute right-4 object-contain ${item.image.includes('airpods') ? 'w-[86px] h-[86px]' : 'w-18 h-18'}`}
                    loading="lazy"
                    style={{ top: 48, transform: 'translateY(-50%)', filter: 'drop-shadow(0 0 8px rgba(74,144,217,0.2))' }}
                  />
                ) : item.name === 'Mobile App' && (
                  <div className="absolute right-4 flex items-center gap-2" style={{ top: 48, transform: 'translateY(-50%)' }}>
                    {/* Android in orange circle */}
                    <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, backgroundColor: 'rgba(249, 115, 22, 0.7)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: 46, height: 46 }} fill="white">
                        <path d="M17.523 15.341a.96.96 0 0 0 .96-.96V8.075a.96.96 0 1 0-1.92 0v6.306a.96.96 0 0 0 .96.96zM6.477 15.341a.96.96 0 0 0 .96-.96V8.075a.96.96 0 0 0-1.92 0v6.306a.96.96 0 0 0 .96.96zM8.59 17.921v2.64a1.08 1.08 0 0 0 2.16 0v-2.64h2.5v2.64a1.08 1.08 0 0 0 2.16 0v-2.64h.27a1.2 1.2 0 0 0 1.2-1.2V7.681H7.12v9.04a1.2 1.2 0 0 0 1.2 1.2h.27zM15.61 3.561l1.22-1.78a.3.3 0 0 0-.09-.42.3.3 0 0 0-.42.09l-1.27 1.85a6.47 6.47 0 0 0-6.1 0L7.68 1.451a.3.3 0 0 0-.42-.09.3.3 0 0 0-.09.42l1.22 1.78A5.28 5.28 0 0 0 5.2 7.281h13.6a5.28 5.28 0 0 0-3.19-3.72zM9.8 5.881a.6.6 0 1 1 .6-.6.6.6 0 0 1-.6.6zm4.4 0a.6.6 0 1 1 .6-.6.6.6 0 0 1-.6.6z"/>
                      </svg>
                    </div>
                    {/* Apple in blue circle */}
                    <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, backgroundColor: 'rgba(74, 144, 217, 0.7)' }}>
                      <svg viewBox="0 0 384 512" style={{ width: 38, height: 38 }} fill="white">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                      </svg>
                    </div>
                  </div>
                )}
                <div className="inline-flex p-3 rounded-xl bg-electric-500/10 text-electric-400 mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{item.name}</h3>
                <p className="text-carbon-200 pr-14">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 carbon-fiber-bg">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={mobileViewport}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">What's your role?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/technicians" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric">
                I'm a Technician
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/managers" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-400 hover:to-safety-500 text-white font-semibold rounded-xl transition-all duration-300 glow-safety">
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
