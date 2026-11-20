import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  Volume2,
  Eye,
  Info,
  Droplets,
  Heart,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Image as ImageIcon,
  Timer,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ThermometerSnowflake,
} from "lucide-react";
import {
  SPECIAL_DEVICE_GUIDES,
  SpecialDeviceId,
} from "../data/specialDevicesData";
import { DeviceStepAnimator } from "./DeviceStepAnimator";

interface DeviceGuideAnimatedProps {
  activeDeviceId: string;
  onSelectDevice: (id: string) => void;
  activeStep: number;
  onSelectStep: React.Dispatch<React.SetStateAction<number>>;
  practiceChecked: Record<string, boolean>;
  onTogglePractice: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const DEVICE_ICONS: Record<SpecialDeviceId, React.ReactNode> = {
  suppositoria: <Activity className="w-4 h-4" />,
  inhaler: <Volume2 className="w-4 h-4" />,
  tetes_mata: <Eye className="w-4 h-4" />,
  tetes_telinga: <Info className="w-4 h-4" />,
  semprot_hidung: <Droplets className="w-4 h-4" />,
  pena_insulin: <Heart className="w-4 h-4" />,
};

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} dtk`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const DeviceGuideAnimated: React.FC<DeviceGuideAnimatedProps> = ({
  activeDeviceId,
  onSelectDevice,
  activeStep,
  onSelectStep,
  practiceChecked,
  onTogglePractice,
}) => {
  const prefersReduced = useReducedMotion();

  const currentItem =
    SPECIAL_DEVICE_GUIDES.find((x) => x.id === activeDeviceId) ||
    SPECIAL_DEVICE_GUIDES[0];
  const totalSteps = currentItem.steps.length;
  const safeStep = Math.min(Math.max(activeStep, 0), totalSteps - 1);
  const currentStepData = currentItem.steps[safeStep];

  const [stageMode, setStageMode] = useState<"animasi" | "foto">("animasi");
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isAnimPaused, setIsAnimPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [stepDirection, setStepDirection] = useState<number>(1);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  // Built-in interactive clinical countdown timer for timed steps
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);

  // Progress for auto-play step dwell (0..100)
  const [autoProgress, setAutoProgress] = useState<number>(0);
  const autoStartRef = useRef<number>(0);

  // Reset per-step interactive states when device or step changes
  useEffect(() => {
    setTimerRunning(false);
    setTimerCompleted(false);
    setTimerRemaining(currentStepData.timerSeconds ?? 0);
  }, [currentItem.id, safeStep, currentStepData.timerSeconds]);

  useEffect(() => {
    setImgFailed(false);
    setIsAutoPlaying(false);
    setAutoProgress(0);
  }, [currentItem.id]);

  // Real clinical countdown timer interval
  useEffect(() => {
    if (!timerRunning) return;
    if (timerRemaining <= 0) {
      setTimerRunning(false);
      setTimerCompleted(true);
      return;
    }
    const id = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerRemaining]);

  // Smooth auto-play walkthrough loop
  useEffect(() => {
    if (!isAutoPlaying) {
      setAutoProgress(0);
      return;
    }
    setStageMode("animasi");
    setIsAnimPaused(false);
    const dwellMs = Math.max(2200, Math.round(currentStepData.autoPlayMs / speed));
    autoStartRef.current = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - autoStartRef.current;
      const pct = Math.min(100, (elapsed / dwellMs) * 100);
      setAutoProgress(pct);
      if (elapsed >= dwellMs) {
        if (safeStep < totalSteps - 1) {
          setStepDirection(1);
          onSelectStep((prev) => Math.min(totalSteps - 1, prev + 1));
        } else {
          setIsAutoPlaying(false);
          setAutoProgress(0);
        }
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoPlaying, safeStep, totalSteps, speed, currentStepData.autoPlayMs, onSelectStep]);

  const goToStep = useCallback(
    (targetIdx: number) => {
      const clamped = Math.min(Math.max(targetIdx, 0), totalSteps - 1);
      setStepDirection(clamped >= safeStep ? 1 : -1);
      onSelectStep(clamped);
    },
    [safeStep, totalSteps, onSelectStep]
  );

  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      if (safeStep === totalSteps - 1) {
        setStepDirection(-1);
        onSelectStep(0);
      }
      setStageMode("animasi");
      setIsAnimPaused(false);
      setIsAutoPlaying(true);
    }
  };

  const handleReplayStep = () => {
    setStageMode("animasi");
    setIsAnimPaused(false);
    setReplayKey((k) => k + 1);
  };

  const handleToggleTimer = () => {
    if (!currentStepData.timerSeconds) return;
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      if (timerRemaining <= 0) {
        setTimerRemaining(currentStepData.timerSeconds);
      }
      setTimerCompleted(false);
      setTimerRunning(true);
    }
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerCompleted(false);
    setTimerRemaining(currentStepData.timerSeconds ?? 0);
  };

  const checkedCount = currentItem.steps.filter(
    (_, idx) => practiceChecked[`${currentItem.id}_${idx}`]
  ).length;
  const isAllChecked = checkedCount === totalSteps;
  const progressPercentage = Math.round((checkedCount / totalSteps) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Device Selector & Clinical Standard */}
      <section className="lg:col-span-3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Jenis Obat Khusus</h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {SPECIAL_DEVICE_GUIDES.length} alat
            </span>
          </div>

          <nav aria-label="Pilih panduan alat khusus" className="space-y-1.5">
            {SPECIAL_DEVICE_GUIDES.map((item) => {
              const isSelected = currentItem.id === item.id;
              const itemChecked = item.steps.filter(
                (_, idx) => practiceChecked[`${item.id}_${idx}`]
              ).length;
              const itemDone = itemChecked === item.steps.length;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectDevice(item.id);
                    onSelectStep(0);
                    setStepDirection(1);
                  }}
                  className={`relative w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    isSelected
                      ? "text-teal-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeDeviceHighlight"
                      transition={{ duration: prefersReduced ? 0 : 0.25, ease: EASE_OUT_EXPO }}
                      className="absolute inset-0 bg-teal-50 border border-teal-200/80 rounded-xl"
                    />
                  )}
                  <div
                    className={`relative z-10 p-2 rounded-lg shrink-0 transition-colors ${
                      isSelected
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {DEVICE_ICONS[item.id]}
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{item.shortTitle}</div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                      <span className="truncate">{item.device}</span>
                    </div>
                  </div>
                  <span
                    className={`relative z-10 text-[11px] font-mono tabular-nums shrink-0 ${
                      itemDone ? "text-emerald-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    {itemDone ? "✓" : `${itemChecked}/${item.steps.length}`}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Standar Klinik Aseptis */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Standar Klinik Aseptis
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed tracking-[0.01em]">
            Sebelum mempraktikkan teknik pemberian obat khusus ini, selalu pastikan Anda mencuci tangan menggunakan sabun antiseptik selama minimal 20 detik atau menggunakan hand sanitizer berbasis alkohol. Jaga agar ujung aplikator tidak terkontaminasi oleh kuman luar.
          </p>
        </div>
      </section>

      {/* Right Column: Interactive Animated Learning Stage & Controls */}
      <section className="lg:col-span-9 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="space-y-6"
          >
            {/* Header Info Card (Zero-Pill Clean Metadata) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-teal-700 font-semibold">{currentItem.device}</span>
                <span aria-hidden="true">·</span>
                <span>{currentItem.routeLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Terverifikasi Klinis Kemenkes &amp; FDA</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight [text-wrap:balance]">
                    {currentItem.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentItem.subtitle}
                  </p>
                </div>

                {/* Primary Auto-Demo CTA */}
                <button
                  type="button"
                  onClick={handleToggleAutoPlay}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    isAutoPlaying
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda Demo Otomatis</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Putar Panduan Otomatis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Two-Zone Educational Sandbox: Visual Stage (Left) + Stepper & Practice Deck (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {/* Interactive Stage */}
              <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
                {/* Stage Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStageMode("animasi")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        stageMode === "animasi"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 text-teal-600" />
                      <span>Animasi Langkah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setStageMode("foto");
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        stageMode === "foto"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Foto Alat</span>
                    </button>
                  </div>

                  {/* Animation Playback Controls */}
                  {stageMode === "animasi" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAnimPaused((p) => !p)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                        title={isAnimPaused ? "Lanjutkan animasi" : "Jeda animasi"}
                      >
                        {isAnimPaused ? (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Gerak</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Bekukan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleReplayStep}
                        className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Ulangi animasi langkah ini"
                        aria-label="Ulangi animasi langkah ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Speed Control */}
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        {[0.75, 1, 1.5].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setSpeed(spd)}
                            className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors cursor-pointer tabular-nums ${
                              speed === spd
                                ? "bg-white text-teal-700 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {spd}×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Canvas Viewport */}
                <div className="relative aspect-[7/4] w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                  <AnimatePresence mode="wait">
                    {stageMode === "animasi" ? (
                      <motion.div
                        key="stage-anim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                      >
                        <DeviceStepAnimator
                          deviceId={currentItem.id}
                          stepIndex={safeStep}
                          speed={speed}
                          isPaused={isAnimPaused}
                          replayKey={replayKey}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="stage-photo"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full h-full bg-slate-100"
                      >
                        {!imgFailed ? (
                          <img
                            src={currentItem.imageUrl}
                            alt={`Ilustrasi alat medis ${currentItem.device}`}
                            referrerPolicy="no-referrer"
                            onError={() => setImgFailed(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 p-6 text-center">
                            <ImageIcon className="w-8 h-8 text-teal-600" />
                            <p className="text-xs font-semibold">{currentItem.device}</p>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-4">
                          <p className="text-white text-xs font-semibold">
                            Foto Ilustrasi · {currentItem.device}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Auto-play bottom progress rail */}
                  {isAutoPlaying && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 origin-left transition-transform duration-75"
                        style={{ transform: `scaleX(${autoProgress / 100})` }}
                      />
                    </div>
                  )}
                </div>

                {/* Live Motion Cue Strip */}
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-teal-50/70 border border-teal-200/60 rounded-xl text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-teal-800 tabular-nums shrink-0">
                      0{safeStep + 1}.
                    </span>
                    <span className="font-semibold text-teal-950 truncate">
                      {currentStepData.cue}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 whitespace-nowrap shrink-0">
                    {currentStepData.keyAction}
                  </span>
                </div>

                {/* Storage Conditions */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Kondisi Penyimpanan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentItem.storage}
                  </p>
                </div>
              </div>

              {/* Right Deck: Synchronized Step Guide, Live Timer & Practice Checklist */}
              <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Panduan Langkah Interaktif
                    </h3>
                    <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
                      Langkah {safeStep + 1} / {totalSteps}
                    </span>
                  </div>

                  {/* Animated Active Step Content */}
                  <div className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200/80 p-5 min-h-[172px] flex flex-col justify-center">
                    <AnimatePresence mode="wait" custom={stepDirection}>
                      <motion.div
                        key={`${currentItem.id}_step_${safeStep}`}
                        custom={stepDirection}
                        initial={
                          prefersReduced
                            ? { opacity: 1 }
                            : { opacity: 0, x: stepDirection > 0 ? 18 : -18 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                          prefersReduced
                            ? { opacity: 1 }
                            : { opacity: 0, x: stepDirection > 0 ? -18 : 18 }
                        }
                        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                        className="space-y-2.5"
                      >
                        <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold">
                          <span className="font-mono tabular-nums">
                            Langkah 0{safeStep + 1}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{currentStepData.keyAction}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-950 tracking-tight">
                          {currentStepData.title}
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {currentStepData.desc}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Built-In Interactive Clinical Countdown Timer (shown on timed steps) */}
                  {currentStepData.timerSeconds && (
                    <div className="bg-teal-50/60 border border-teal-200/70 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                          <Timer className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{currentStepData.timerLabel || "Timer Klinis"}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-teal-800 tabular-nums">
                          {timerCompleted ? "Selesai ✓" : formatCountdown(timerRemaining)}
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 origin-left transition-transform duration-300"
                          style={{
                            transform: `scaleX(${
                              currentStepData.timerSeconds
                                ? (currentStepData.timerSeconds - timerRemaining) /
                                  currentStepData.timerSeconds
                                : 0
                            })`,
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleTimer}
                          className="flex-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          {timerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Jeda Timer</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>{timerCompleted ? "Ulangi Timer" : "Mulai Timer"}</span>
                            </>
                          )}
                        </button>
                        {(timerRunning || timerRemaining !== currentStepData.timerSeconds) && (
                          <button
                            type="button"
                            onClick={handleResetTimer}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stepper Navigation Buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={safeStep === 0}
                      onClick={() => {
                        setIsAutoPlaying(false);
                        goToStep(safeStep - 1);
                      }}
                      className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      disabled={safeStep === totalSteps - 1}
                      onClick={() => {
                        setIsAutoPlaying(false);
                        goToStep(safeStep + 1);
                      }}
                      className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Selanjutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Direct 6-Step Quick Jump Timeline */}
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {currentItem.steps.map((step, idx) => {
                      const isCurrent = idx === safeStep;
                      const isChecked = !!practiceChecked[`${currentItem.id}_${idx}`];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setIsAutoPlaying(false);
                            goToStep(idx);
                          }}
                          title={`Langkah ${idx + 1}: ${step.title}`}
                          className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border tabular-nums ${
                            isCurrent
                              ? "bg-teal-600 text-white border-teal-600"
                              : isChecked
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isChecked && !isCurrent ? "✓" : idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Practice Checklist Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Praktek Mandiri</span>
                    <span className="font-mono font-semibold text-slate-600 tabular-nums">
                      {checkedCount}/{totalSteps} ({progressPercentage}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-teal-600 origin-left"
                      initial={false}
                      animate={{ scaleX: progressPercentage / 100 }}
                      transition={{ duration: prefersReduced ? 0 : 0.35, ease: EASE_OUT_EXPO }}
                    />
                  </div>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-teal-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!practiceChecked[`${currentItem.id}_${safeStep}`]}
                      onChange={(e) => {
                        onTogglePractice((prev) => ({
                          ...prev,
                          [`${currentItem.id}_${safeStep}`]: e.target.checked,
                        }));
                      }}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                    />
                    <div className="text-xs leading-snug">
                      <span className="font-bold text-slate-900 block">
                        Saya sudah mempraktikkan Langkah {safeStep + 1}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Tandai langkah ini sebagai selesai dalam simulasi latihan Anda.
                      </span>
                    </div>
                  </label>

                  <AnimatePresence>
                    {isAllChecked && (
                      <motion.div
                        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-lg flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong className="font-bold block">Latihan Selesai</strong>
                          Seluruh {totalSteps} langkah penggunaan {currentItem.device} telah ditinjau dan dicentang dengan benar.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Full Interactive Step Sequence Strip (Zero-Latency Access to All 6 Steps) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Ringkasan Alur 6 Langkah ({currentItem.shortTitle})
                </h3>
                <span className="text-xs text-slate-500">
                  Klik langkah mana saja untuk memutar animasinya
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentItem.steps.map((step, idx) => {
                  const isActive = idx === safeStep;
                  const isDone = !!practiceChecked[`${currentItem.id}_${idx}`];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setStageMode("animasi");
                        goToStep(idx);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                        isActive
                          ? "bg-teal-50/70 border-teal-300"
                          : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            isActive ? "text-teal-700" : "text-slate-500"
                          }`}
                        >
                          0{idx + 1}. {step.keyAction}
                        </span>
                        {isDone && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {step.title}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {step.cue}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DOs & DONTs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="text-sm font-bold text-emerald-950">
                    Anjuran / Boleh Dilakukan (DOs)
                  </h3>
                </div>
                <ul className="space-y-3 text-xs leading-relaxed text-slate-700">
                  {currentItem.dos.map((doItem, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-emerald-600 shrink-0 font-bold mt-0.5">✓</span>
                      <span>{doItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-rose-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <h3 className="text-sm font-bold text-rose-950">
                    Pantangan / Hindari (DONTs)
                  </h3>
                </div>
                <ul className="space-y-3 text-xs leading-relaxed text-slate-700">
                  {currentItem.donts.map((dontItem, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-rose-600 shrink-0 font-bold mt-0.5">✗</span>
                      <span>{dontItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Clinical Counseling Pearls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Mutiara Klinis &amp; Panduan Konseling Pasien
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
                {currentItem.counseling.map((counselItem, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl flex items-start gap-3"
                  >
                    <span className="font-mono font-bold text-amber-700 tabular-nums shrink-0">
                      0{idx + 1}.
                    </span>
                    <p>{counselItem}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default DeviceGuideAnimated;
