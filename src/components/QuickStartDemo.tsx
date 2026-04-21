import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Menu, User, Camera, Mic, Car } from 'lucide-react';

// Total timeline: ~14s
// Phase 0 (RO typing):     0 – 2s
// Phase 1 (VIN scan):      2 – 6.5s
// Phase 2 (button press):  6.5 – 9s
// Phase 3 (voice active):  9 – 14s
// Then reset

const TOTAL_CYCLE_MS = 14000;

// ─── Fake iOS Status Bar ────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 py-1" style={{ fontSize: '9px', color: '#8E8E93' }}>
      <span style={{ fontWeight: 600 }}>9:41</span>
      <div className="flex items-center gap-1">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
          <rect x="0" y="4" width="2" height="4" rx="0.5" />
          <rect x="3" y="2.5" width="2" height="5.5" rx="0.5" />
          <rect x="6" y="1" width="2" height="7" rx="0.5" />
          <rect x="9" y="0" width="2" height="8" rx="0.5" opacity="0.3" />
        </svg>
        <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
          <rect x="0" y="0.5" width="13" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <rect x="1" y="1.5" width="9" height="5" rx="0.8" fill="currentColor" />
          <rect x="14" y="2.5" width="1.5" height="3" rx="0.5" />
        </svg>
      </div>
    </div>
  );
}

// ─── App Header (matches real ONRAMP app) ───────────────────────────
function AppHeader() {
  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{ backgroundColor: '#141410', borderBottom: '1px solid #2A2A28' }}
    >
      <Menu size={14} color="#A0A0A0" />
      <img src="/onramp-logo-white-sm.png" alt="ONRAMP" style={{ height: '18px' }} />
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 20, height: 20, backgroundColor: '#2A2A28' }}
      >
        <User size={10} color="#707070" />
      </div>
    </div>
  );
}

// ─── Form Input (reusable styled input look) ────────────────────────
function MockInput({
  label,
  value,
  placeholder,
  showCursor,
  rightIcon,
}: {
  label: string;
  value: string;
  placeholder: string;
  showCursor?: boolean;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div style={{ fontSize: '9px', fontWeight: 500, color: '#8B8B8B', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
      <div
        className="flex items-center rounded-md px-2 py-1.5"
        style={{
          backgroundColor: '#1A1A18',
          border: '1px solid #3A3A38',
          minHeight: '28px',
        }}
      >
        <div className="flex-1 flex items-center" style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>
          {value ? (
            <span style={{ color: '#E8E8E6' }}>{value}</span>
          ) : (
            <span style={{ color: '#555' }}>{placeholder}</span>
          )}
          {showCursor && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
              style={{ color: '#4A90D9', marginLeft: '1px', fontWeight: 300 }}
            >
              |
            </motion.span>
          )}
        </div>
        {rightIcon && <div className="ml-1 flex-shrink-0">{rightIcon}</div>}
      </div>
    </div>
  );
}

// ─── Form Screen (phases 0-2: single persistent form that evolves) ──
function FormScreen({ elapsedMs }: { elapsedMs: number }) {
  // Phase 0: RO typing (0 – 2000ms)
  const roText = '12345';
  const roTypingStart = 300;
  const roTypingInterval = 250; // faster typing
  const roChars = Math.min(
    roText.length,
    Math.max(0, Math.floor((elapsedMs - roTypingStart) / roTypingInterval))
  );
  const roTypingDone = roChars >= roText.length;

  // Phase 1: VIN scan (2000 – 6500ms)
  const vinScanStart = 2000;
  const vinTapTime = vinScanStart + 400;        // small camera icon tapped
  const vinScanningStart = vinScanStart + 800;  // scanner overlay opens
  const vinCaptureGlow = vinScanStart + 2200;   // capture button glows
  const vinScanningEnd = vinScanStart + 2600;   // flash
  const vinFlashTime = vinScanningEnd;
  const vinDecodeStart = vinScanStart + 2800;
  const vin = '1HGBH41JXMN109186';
  const vinCharsInterval = 35;

  const isTapping = elapsedMs >= vinTapTime && elapsedMs < vinScanningStart;
  const isScanning = elapsedMs >= vinScanningStart && elapsedMs < vinFlashTime + 200;
  const isFlashing = elapsedMs >= vinFlashTime && elapsedMs < vinFlashTime + 200;
  const isDecoded = elapsedMs >= vinDecodeStart;

  const vinChars = isDecoded
    ? Math.min(vin.length, Math.floor((elapsedMs - vinDecodeStart) / vinCharsInterval))
    : 0;
  const vinDecodeDone = vinChars >= vin.length;
  const showVehicleCard = vinDecodeDone;

  // Phase 2: Button press (6500 – 9000ms)
  const buttonPressTime = 7500;
  const isButtonPressed = elapsedMs >= buttonPressTime;

  // Button is always visible but muted until VIN is decoded
  const buttonActive = vinDecodeDone;

  return (
    <div className="h-full flex flex-col justify-center relative" style={{ backgroundColor: '#1E1E1C' }}>
      {/* Viewfinder overlay */}
      <AnimatePresence>
        {isScanning && !isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.90)' }}
          >
            {/* Scanner strip */}
            <div className="relative" style={{ width: '85%', height: 28 }}>
              {/* Corner brackets */}
              {[
                { top: 0, left: 0, borderTop: '2px solid #4A90D9', borderLeft: '2px solid #4A90D9' },
                { top: 0, right: 0, borderTop: '2px solid #4A90D9', borderRight: '2px solid #4A90D9' },
                { bottom: 0, left: 0, borderBottom: '2px solid #4A90D9', borderLeft: '2px solid #4A90D9' },
                { bottom: 0, right: 0, borderBottom: '2px solid #4A90D9', borderRight: '2px solid #4A90D9' },
              ].map((style, i) => (
                <div key={i} className="absolute" style={{ width: 10, height: 10, ...style }} />
              ))}
              {/* Paper strip with VIN */}
              <div
                className="absolute inset-0 flex items-center justify-center mx-1.5 my-0.5 rounded-sm"
                style={{ backgroundColor: '#F5F0E8', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              >
                <div style={{ fontSize: '11.5px', color: '#1A1A1A', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.3px' }}>
                  1HGBH41JXMN109186
                </div>
              </div>
              {/* Scanning line */}
              <motion.div
                animate={{ top: ['5%', '90%'] }}
                transition={{ duration: 1.0, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                className="absolute left-1 right-1 z-10"
                style={{ height: '1px', backgroundColor: '#4A90D9', opacity: 0.7 }}
              />
            </div>

            {/* Capture button */}
            <motion.div
              animate={
                elapsedMs >= vinCaptureGlow
                  ? { scale: [1, 1.15, 1], boxShadow: ['0 0 0px rgba(74,144,217,0)', '0 0 20px rgba(74,144,217,0.8)', '0 0 6px rgba(74,144,217,0.4)'] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                background: elapsedMs >= vinCaptureGlow
                  ? 'radial-gradient(circle, #4A90D9 0%, #2A6AB5 100%)'
                  : 'radial-gradient(circle, #3A7AC0 0%, #1E5090 100%)',
                border: '3px solid rgba(255,255,255,0.3)',
                transition: 'background 0.3s',
              }}
            >
              <Camera size={20} color="#FFF" />
            </motion.div>

            <div style={{ fontSize: '7px', color: '#4A90D9', opacity: 0.7, marginTop: -4 }}>
              {elapsedMs >= vinCaptureGlow ? 'VIN captured!' : 'Tap to capture'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash effect */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-30"
            style={{ backgroundColor: '#FFFFFF' }}
          />
        )}
      </AnimatePresence>

      {/* Form content */}
      <div className="px-3 pt-3 pb-2">
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
          Create New Job
        </div>
      </div>
      <div className="px-3 space-y-2.5 flex-1">
        {/* RO Field */}
        <MockInput
          label="Repair Order #"
          value={roText.slice(0, roChars)}
          placeholder="e.g., RO-2025-001"
          showCursor={!roTypingDone && elapsedMs >= roTypingStart}
        />

        {/* VIN Field */}
        <MockInput
          label="VIN"
          value={isDecoded ? vin.slice(0, vinChars) : ''}
          placeholder="17-character VIN"
          showCursor={isDecoded && !vinDecodeDone}
          rightIcon={
            <motion.div
              animate={isTapping ? { scale: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center rounded"
              style={{
                width: 20,
                height: 20,
                backgroundColor: isTapping ? '#4A90D9' : '#2A2A28',
                transition: 'background-color 0.2s',
              }}
            >
              <Camera size={10} color={isTapping ? '#FFF' : '#666'} />
            </motion.div>
          }
        />

        {/* Vehicle decode card */}
        <AnimatePresence>
          {showVehicleCard && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-md px-2 py-1.5"
              style={{ backgroundColor: '#252523', border: '1px solid #3A3A38' }}
            >
              <div className="flex items-center gap-1.5">
                <Car size={10} color="#4A90D9" />
                <span style={{ fontSize: '9px', color: '#C0C0C0', fontFamily: 'Inter, sans-serif' }}>
                  <span style={{ fontWeight: 600, color: '#E8E8E6' }}>2019 Honda Accord</span>
                  {' · '}1.5L Turbo
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launch button — always visible, muted until VIN decoded */}
        <motion.div
          animate={
            isButtonPressed
              ? { scale: [1, 0.95, 1], boxShadow: ['0 0 0px #4A90D9', '0 0 16px #4A90D9', '0 0 4px #4A90D9'] }
              : {}
          }
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-1.5 rounded-md py-2"
          style={{
            backgroundColor: buttonActive ? '#0A3A7D' : '#1A2A3D',
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            color: buttonActive ? '#FFFFFF' : '#556070',
            transition: 'background-color 0.4s, color 0.4s',
          }}
        >
          <Mic size={12} />
          Diagnose with Voice AI
        </motion.div>
      </div>
    </div>
  );
}

// ─── Voice Active Screen (phase 3 only) ─────────────────────────────
function VoiceActiveScreen() {
  return (
    <motion.div
      key="voice-active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D2847 100%)' }}
    >
      {/* Voice status bar */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ backgroundColor: 'rgba(74, 144, 217, 0.15)', borderBottom: '1px solid rgba(74, 144, 217, 0.3)' }}
      >
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="rounded-full"
          style={{ width: 5, height: 5, backgroundColor: '#4A90D9' }}
        />
        <span style={{ fontSize: '8px', fontWeight: 600, color: '#4A90D9', fontFamily: 'Inter, sans-serif' }}>
          AI Speaking
        </span>
      </div>

      {/* Pulsating mic area + speech bubble */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Radiating rings */}
        {[0, 0.7, 1.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              width: 50,
              height: 50,
              border: '1px solid rgba(74, 144, 217, 0.4)',
            }}
          />
        ))}

        {/* Mic circle */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 50,
            height: 50,
            background: 'radial-gradient(circle, rgba(74, 144, 217, 0.3) 0%, rgba(74, 144, 217, 0.1) 100%)',
            border: '2px solid rgba(74, 144, 217, 0.5)',
          }}
        >
          <Mic size={22} color="#4A90D9" />
        </motion.div>

        <span
          className="mt-2 relative z-10"
          style={{ fontSize: '8px', fontWeight: 600, color: '#4A90D9', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}
        >
          AI SPEAKING
        </span>

        {/* Audio waveform bars */}
        <div className="flex gap-0.5 mt-2 relative z-10">
          {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [1, 2.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay }}
              className="rounded-full"
              style={{ width: 2, height: 8, backgroundColor: '#4A90D9', opacity: 0.7 }}
            />
          ))}
        </div>

        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 mt-4"
          style={{ width: '80%' }}
        >
          <div
            className="rounded-xl px-4 py-3 relative"
            style={{
              backgroundColor: 'rgba(74, 144, 217, 0.15)',
              border: '1px solid rgba(74, 144, 217, 0.3)',
            }}
          >
            {/* Tail */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '8px solid rgba(74, 144, 217, 0.3)',
              }}
            />
            <p style={{ fontSize: '16px', color: '#C8DEFF', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4 }}>
              "Hey Alex,<br />how can I help?"
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function QuickStartDemo() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Use requestAnimationFrame for smooth, continuous timeline
  const tick = useCallback((now: number) => {
    if (startTimeRef.current === null) startTimeRef.current = now;
    const elapsed = now - startTimeRef.current;
    setElapsedMs(elapsed % TOTAL_CYCLE_MS);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!isInView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
      setElapsedMs(0);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, tick]);

  // Determine if we're in voice phase (phase 3: 9000-14000ms)
  const isVoicePhase = elapsedMs >= 9000;

  return (
    <div ref={containerRef} className="relative mx-auto w-[260px] md:w-[300px]">
      {/* Outer glow on voice active phase */}
      <AnimatePresence>
        {isVoicePhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -inset-4 rounded-[3rem] z-0"
            style={{
              background: 'radial-gradient(ellipse, rgba(74, 144, 217, 0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen content clipped inside the frame */}
      <div
        className="absolute overflow-hidden z-0"
        style={{
          left: '5.5%',
          right: '5.5%',
          top: '3%',
          bottom: '3%',
          borderRadius: '2rem',
          backgroundColor: '#141410',
        }}
      >
        <div className="h-full flex flex-col">
          <StatusBar />
          <AppHeader />
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {isVoicePhase ? (
                <VoiceActiveScreen key="voice" />
              ) : (
                <motion.div
                  key="form"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <FormScreen elapsedMs={elapsedMs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
