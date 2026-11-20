import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SpecialDeviceId } from "../data/specialDevicesData";

interface DeviceStepAnimatorProps {
  deviceId: SpecialDeviceId;
  stepIndex: number;
  speed?: number; // 0.75 | 1 | 1.5
  isPaused?: boolean;
  replayKey?: number;
}

const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DeviceStepAnimator: React.FC<DeviceStepAnimatorProps> = ({
  deviceId,
  stepIndex,
  speed = 1,
  isPaused = false,
  replayKey = 0,
}) => {
  const prefersReduced = useReducedMotion();
  const [earAgeMode, setEarAgeMode] = useState<"dewasa" | "anak">("dewasa");
  const [insulinSite, setInsulinSite] = useState<"perut" | "paha" | "lengan">("perut");
  const [demoInsulinUnits, setDemoInsulinUnits] = useState<number>(12);

  // Scale duration inversely with speed; freeze or calm down if paused or reduced motion
  const dur = (base: number) => Math.max(0.25, base / speed);
  const loopRepeat = prefersReduced || isPaused ? 0 : Infinity;

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* Subtle clinical blueprint grid backdrop */}
      <svg
        className="w-full h-full"
        viewBox="0 0 560 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Animasi klinis langkah ${stepIndex + 1} untuk ${deviceId}`}
      >
        <defs>
          <pattern id="clinicalGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" strokeWidth="0.6" strokeOpacity="0.65" />
          </pattern>
          <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="warmGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="skinLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE6D4" />
            <stop offset="100%" stopColor="#F5CBB0" />
          </linearGradient>
          <linearGradient id="subcutFat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
          <linearGradient id="mistGrad" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mistUpGrad" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Clean Medical Canvas */}
        <rect width="560" height="320" fill="#F8FAFC" />
        <rect width="560" height="320" fill="url(#clinicalGrid)" />

        {/* Soft radial spotlight center */}
        <circle cx="280" cy="160" r="140" fill="#0D9488" fillOpacity="0.04" />

        <AnimatePresence mode="wait">
          <motion.g
            key={`${deviceId}_${stepIndex}_${replayKey}_${earAgeMode}_${insulinSite}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            style={{ transformOrigin: "280px 160px" }}
          >
            {/* ==================== 1. SUPPOSITORIA ==================== */}
            {deviceId === "suppositoria" && stepIndex === 0 && (
              <HandWashScene dur={dur} loopRepeat={loopRepeat} label="Cuci Tangan Antiseptik · 20 Detik" />
            )}

            {deviceId === "suppositoria" && stepIndex === 1 && (
              <g>
                {/* Foil packaging peeling open */}
                <motion.path
                  d="M270 110 L215 110 L205 225 L270 225 Z"
                  fill="#CBD5E1"
                  stroke="#64748B"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { x: [0, -28, -28, 0], rotate: [0, -14, -14, 0] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "265px 220px" }}
                />
                <motion.path
                  d="M290 110 L345 110 L355 225 L290 225 Z"
                  fill="#E2E8F0"
                  stroke="#64748B"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { x: [0, 28, 28, 0], rotate: [0, 14, 14, 0] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "295px 220px" }}
                />
                {/* Foil ridges */}
                <text x="280" y="255" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
                  Kupas foil perlahan — basahi ujung lancip dengan air bersih
                </text>

                {/* Torpedo Suppository emerging */}
                <motion.g
                  animate={isPaused ? undefined : { y: [18, -16, -16, 18] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <path
                    d="M280 86 C296 105 302 142 302 185 C302 200 293 208 280 208 C267 208 258 200 258 185 C258 142 264 105 280 86 Z"
                    fill="#FFFFFF"
                    stroke="#0D9488"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M276 102 C270 120 268 150 268 180"
                    stroke="#99F6E4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.g>

                {/* Water lubrication droplet landing on tip */}
                <motion.path
                  d="M280 42 C280 42 288 55 288 60 C288 64.5 284.4 68 280 68 C275.6 68 272 64.5 272 60 C272 55 280 42 280 42 Z"
                  fill="url(#skyGrad)"
                  animate={isPaused ? undefined : { y: [-8, 22, 24], opacity: [0, 1, 0] }}
                  transition={{ duration: dur(1.8), repeat: loopRepeat, ease: "easeIn", delay: 0.4 }}
                />
                <motion.circle
                  cx="280"
                  cy="74"
                  r="14"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  fill="none"
                  animate={isPaused ? undefined : { scale: [0.5, 1.4], opacity: [0.8, 0] }}
                  transition={{ duration: dur(1.8), repeat: loopRepeat, delay: 1.1 }}
                  style={{ transformOrigin: "280px 74px" }}
                />

                {/* Label pointer */}
                <line x1="312" y1="86" x2="380" y2="70" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="386" y="74" fill="#0369A1" fontSize="11" fontWeight="700">
                  Ujung lancip (lubrikasi)
                </text>
              </g>
            )}

            {deviceId === "suppositoria" && stepIndex === 2 && (
              <g>
                {/* Clinical mat / bed surface */}
                <rect x="65" y="218" width="430" height="16" rx="8" fill="#E2E8F0" />
                <rect x="78" y="202" width="64" height="16" rx="8" fill="#CBD5E1" />

                {/* Side-lying Sims posture silhouette */}
                {/* Head */}
                <circle cx="122" cy="182" r="22" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                {/* Torso */}
                <path
                  d="M144 176 L266 168 C282 168 292 180 292 194 C292 208 280 216 262 216 L146 212 Z"
                  fill="#CCFBF1"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                />
                {/* Lower leg (straight) */}
                <path
                  d="M286 196 L448 206"
                  stroke="#64748B"
                  strokeWidth="15"
                  strokeLinecap="round"
                />
                <text x="415" y="248" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                  Kaki bawah lurus
                </text>

                {/* Upper leg flexing smoothly toward chest (Sims Position) */}
                <motion.g
                  animate={isPaused ? undefined : { rotate: [16, -2, -2, 16] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "276px 184px" }}
                >
                  {/* Thigh */}
                  <path
                    d="M276 184 L235 126"
                    stroke="#0D9488"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Lower leg bent */}
                  <path
                    d="M235 126 L316 126"
                    stroke="#0F766E"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Knee joint */}
                  <circle cx="235" cy="126" r="6" fill="#FFFFFF" />
                </motion.g>

                {/* Directional flexion arc */}
                <motion.path
                  d="M320 156 Q275 95 224 102"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  fill="none"
                  animate={isPaused ? undefined : { pathLength: [0.2, 1, 1] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                />
                <polygon points="222,102 232,96 230,108" fill="#0284C7" />
                <text x="275" y="84" textAnchor="middle" fill="#0369A1" fontSize="12" fontWeight="700">
                  Tekuk lutut atas ke arah dada (Posisi Sims)
                </text>
              </g>
            )}

            {deviceId === "suppositoria" && stepIndex === 3 && (
              <g>
                {/* Clinical cross-section channel */}
                <rect x="260" y="82" width="215" height="148" rx="18" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
                {/* Canal lumen */}
                <path
                  d="M260 132 L322 132 C345 132 355 112 395 112 L462 112 L462 200 L395 200 C355 200 345 180 322 180 L260 180 Z"
                  fill="#FFE4E6"
                  stroke="#FB7185"
                  strokeWidth="2"
                />
                {/* Sphincter ring markers */}
                <line x1="322" y1="95" x2="322" y2="220" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="322" y="72" textAnchor="middle" fill="#BE123C" fontSize="10.5" fontWeight="700">
                  Sfingter Ani
                </text>

                {/* Depth ruler (2-3 cm) */}
                <line x1="260" y1="248" x2="375" y2="248" stroke="#0D9488" strokeWidth="2" />
                <line x1="260" y1="242" x2="260" y2="254" stroke="#0D9488" strokeWidth="2" />
                <line x1="375" y1="242" x2="375" y2="254" stroke="#0D9488" strokeWidth="2" />
                <text x="317" y="268" textAnchor="middle" fill="#0F766E" fontSize="11.5" fontWeight="700">
                  Kedalaman ± 2–3 cm (1 ruas jari)
                </text>

                {/* Animated suppository + guiding finger */}
                <motion.g
                  animate={isPaused ? undefined : { x: [0, 140, 140, 0] }}
                  transition={{ duration: dur(3.6), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  {/* Finger pushing gently */}
                  <rect x="82" y="143" width="110" height="26" rx="13" fill="url(#skinLight)" stroke="#D97706" strokeWidth="1.8" />
                  <rect x="172" y="148" width="14" height="16" rx="6" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="1" />
                  {/* Torpedo Suppository pointed tip FIRST (right) */}
                  <path
                    d="M250 156 C238 144 218 142 198 142 C192 142 188 147 188 156 C188 165 192 170 198 170 C218 170 238 168 250 156 Z"
                    fill="#FFFFFF"
                    stroke="#0D9488"
                    strokeWidth="2.5"
                  />
                  {/* Direction arrow */}
                  <path d="M210 120 L252 120" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="256,120 246,115 246,125" fill="#0D9488" />
                </motion.g>

                <text x="165" y="106" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="700">
                  Ujung lancip masuk dahulu →
                </text>
              </g>
            )}

            {deviceId === "suppositoria" && stepIndex === 4 && (
              <g>
                {/* Warm body temperature dissolution zone */}
                <circle cx="280" cy="150" r="95" fill="url(#warmGrad)" />
                <circle cx="280" cy="150" r="95" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 5" strokeOpacity="0.6" />

                {/* Dissolving suppository */}
                <motion.path
                  d="M322 150 C306 135 280 132 254 132 C245 132 240 139 240 150 C240 161 245 168 254 168 C280 168 306 165 322 150 Z"
                  fill="#FFFFFF"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                  animate={isPaused ? undefined : { scale: [1, 0.72, 0.55, 1], opacity: [1, 0.7, 0.4, 1] }}
                  transition={{ duration: dur(4), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "280px 150px" }}
                />

                {/* Radiating therapeutic absorption molecules */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const tx = Math.cos(rad) * 72;
                  const ty = Math.sin(rad) * 72;
                  return (
                    <motion.circle
                      key={i}
                      cx="280"
                      cy="150"
                      r="5"
                      fill="#10B981"
                      animate={
                        isPaused
                          ? undefined
                          : { x: [0, tx], y: [0, ty], opacity: [0, 0.9, 0], scale: [0.4, 1.1, 0.6] }
                      }
                      transition={{
                        duration: dur(2.6),
                        repeat: loopRepeat,
                        delay: (i % 4) * 0.35,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

                {/* Temp & Time indicators */}
                <rect x="392" y="76" width="124" height="58" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="454" y="100" textAnchor="middle" fill="#D97706" fontSize="15" fontWeight="800">
                  37°C
                </text>
                <text x="454" y="118" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  Meleleh Alami
                </text>

                <text x="280" y="275" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Rapatkan paha & berbaring miring 5–10 menit untuk absorpsi penuh
                </text>
              </g>
            )}

            {deviceId === "suppositoria" && stepIndex === 5 && (
              <HandWashScene dur={dur} loopRepeat={loopRepeat} label="Cuci Tangan Kembali · Prosedur Selesai" showCheck />
            )}

            {/* ==================== 2. INHALER (MDI) ==================== */}
            {deviceId === "inhaler" && stepIndex === 0 && (
              <g>
                {/* MDI L-Shaped Actuator Body */}
                <rect x="218" y="64" width="44" height="72" rx="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2.2" />
                <path
                  d="M210 104 L270 104 L270 194 L334 194 L334 242 L226 242 C216 242 210 234 210 224 Z"
                  fill="url(#tealGrad)"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                />
                {/* Mouthpiece Opening */}
                <ellipse cx="334" cy="218" rx="6" ry="22" fill="#0F172A" />

                {/* Protective Cap sliding off to the right */}
                <motion.g
                  animate={isPaused ? undefined : { x: [0, 72, 72, 0] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <path
                    d="M332 192 L372 192 C378 192 382 196 382 202 L382 234 C382 240 378 244 372 244 L332 244 Z"
                    fill="#F1F5F9"
                    stroke="#64748B"
                    strokeWidth="2.2"
                  />
                  <line x1="354" y1="202" x2="354" y2="234" stroke="#CBD5E1" strokeWidth="2" />
                </motion.g>

                {/* Magnifying / Inspection scan beam */}
                <motion.circle
                  cx="336"
                  cy="218"
                  r="24"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="#38BDF8"
                  fillOpacity="0.12"
                  animate={isPaused ? undefined : { opacity: [0, 0, 1, 1, 0], scale: [0.85, 0.85, 1.05, 1.05, 0.85] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat }}
                  style={{ transformOrigin: "336px 218px" }}
                />

                <text x="280" y="282" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Lepas penutup & periksa lubang corong bebas debu/benda asing
                </text>
              </g>
            )}

            {deviceId === "inhaler" && stepIndex === 1 && (
              <g>
                {/* Up/Down Shake motion guide arcs */}
                <motion.path
                  d="M178 110 C168 135 168 175 178 200"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={isPaused ? undefined : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: dur(0.6), repeat: loopRepeat }}
                />
                <motion.path
                  d="M382 110 C392 135 392 175 382 200"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={isPaused ? undefined : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: dur(0.6), repeat: loopRepeat }}
                />

                {/* Upright MDI shaking briskly up and down */}
                <motion.g
                  animate={isPaused ? undefined : { y: [-20, 20, -20] }}
                  transition={{ duration: dur(0.55), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  {/* Canister with visible mixing suspension */}
                  <rect x="242" y="64" width="46" height="84" rx="10" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" />
                  {/* Swirling suspension dots inside canister */}
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <motion.circle
                      key={idx}
                      cx={254 + (idx % 3) * 11}
                      cy={84 + Math.floor(idx / 3) * 18}
                      r="3.2"
                      fill="#0D9488"
                      animate={
                        isPaused
                          ? undefined
                          : { y: [idx % 2 === 0 ? -8 : 8, idx % 2 === 0 ? 8 : -8, idx % 2 === 0 ? -8 : 8] }
                      }
                      transition={{ duration: dur(0.45), repeat: loopRepeat }}
                    />
                  ))}
                  {/* Actuator */}
                  <path
                    d="M234 112 L296 112 L296 196 L346 196 L346 238 L248 238 C240 238 234 232 234 222 Z"
                    fill="url(#tealGrad)"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                  />
                </motion.g>

                <rect x="396" y="72" width="112" height="44" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="452" y="99" textAnchor="middle" fill="#0F766E" fontSize="14" fontWeight="800">
                  5 – 10× Kocok
                </text>

                <text x="280" y="286" textAnchor="middle" fill="#475569" fontSize="11.5" fontWeight="600">
                  Pegang tegak dan kocok kuat agar propelan & obat homogen
                </text>
              </g>
            )}

            {deviceId === "inhaler" && stepIndex === 2 && (
              <g>
                {/* Patient head side profile facing right */}
                <path
                  d="M125 90 C168 90 194 115 196 146 L208 164 L196 172 L196 184 C196 198 184 206 170 206 L165 228 L108 228 L108 135 C108 106 115 90 125 90 Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Deflating lungs graphic on left */}
                <motion.g
                  animate={isPaused ? undefined : { scale: [1.12, 0.84, 1.12] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "136px 266px" }}
                >
                  <path d="M132 246 C112 248 104 268 112 286 C118 292 132 290 132 280 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
                  <path d="M140 246 C160 248 168 268 160 286 C154 292 140 290 140 280 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
                </motion.g>

                {/* Exhaled air waves flowing OUT away from inhaler */}
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d={`M214 ${174 + (i - 1) * 14} Q265 ${162 + (i - 1) * 18} 325 ${176 + (i - 1) * 20}`}
                    stroke="#0284C7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    animate={isPaused ? undefined : { pathLength: [0, 1], opacity: [0.9, 0], x: [0, 26] }}
                    transition={{ duration: dur(1.8), repeat: loopRepeat, delay: i * 0.25, ease: "easeOut" }}
                  />
                ))}

                {/* Inhaler kept AWAY on the far right */}
                <g opacity="0.65" transform="translate(390, 130) scale(0.75)">
                  <rect x="18" y="10" width="38" height="60" rx="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
                  <path d="M12 46 L62 46 L62 115 L108 115 L108 150 L24 150 C16 150 12 144 12 136 Z" fill="#94A3B8" />
                </g>
                <text x="430" y="122" textAnchor="middle" fill="#64748B" fontSize="10.5" fontWeight="700">
                  Jauhkan inhaler
                </text>

                <text x="315" y="275" textAnchor="middle" fill="#0369A1" fontSize="12" fontWeight="700">
                  Hembuskan napas perlahan hingga paru-paru kosong
                </text>
              </g>
            )}

            {deviceId === "inhaler" && stepIndex === 3 && (
              <g>
                {/* Synchronized Press + Slow Deep Inhale Diagram */}
                {/* Airway & Lungs on left */}
                <path
                  d="M170 156 L170 218 M170 218 L138 242 M170 218 L202 242"
                  stroke="#0F766E"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Expanding Lungs */}
                <motion.g
                  animate={isPaused ? undefined : { scale: [0.88, 1.12, 1.12, 0.88] }}
                  transition={{ duration: dur(3.4), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "170px 256px" }}
                >
                  <path d="M158 214 C120 218 104 252 114 282 C122 296 154 294 158 278 Z" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
                  <path d="M182 214 C220 218 236 252 226 282 C218 296 186 294 182 278 Z" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
                </motion.g>

                {/* Mouthpiece entry */}
                <path d="M170 156 L268 156" stroke="#CBD5E1" strokeWidth="28" strokeLinecap="round" />

                {/* Inhaler placed at mouth */}
                <g transform="translate(275, 58)">
                  {/* Pressing finger + canister moving DOWN */}
                  <motion.g
                    animate={isPaused ? undefined : { y: [0, 16, 16, 0] }}
                    transition={{ duration: dur(3.4), repeat: loopRepeat, ease: "easeInOut" }}
                  >
                    {/* Finger */}
                    <rect x="48" y="-12" width="46" height="20" rx="10" fill="url(#skinLight)" stroke="#D97706" strokeWidth="1.8" />
                    {/* Down arrow */}
                    <path d="M108 -4 L108 20" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="108,24 103,16 113,16" fill="#E11D48" />
                    <text x="120" y="12" fill="#BE123C" fontSize="11" fontWeight="800">
                      1. TEKAN
                    </text>
                    {/* Canister */}
                    <rect x="48" y="10" width="44" height="72" rx="8" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" />
                  </motion.g>
                  {/* Actuator facing left */}
                  <path
                    d="M40 52 L100 52 L100 116 C100 124 94 130 86 130 L-10 130 L-10 86 L40 86 Z"
                    fill="url(#tealGrad)"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                  />
                </g>

                {/* Synchronized Aerosol Mist Cloud moving LEFT into trachea & lungs */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.circle
                    key={i}
                    cx="265"
                    cy={156 + ((i % 3) - 1) * 7}
                    r={3.5 + (i % 2)}
                    fill="#0D9488"
                    animate={
                      isPaused
                        ? undefined
                        : {
                            x: [0, -95, -95 - (i % 2 === 0 ? 22 : -22)],
                            y: [0, 0, 88],
                            opacity: [0, 1, 0.9, 0],
                          }
                    }
                    transition={{ duration: dur(2.2), repeat: loopRepeat, delay: 0.4 + i * 0.12, ease: "easeInOut" }}
                  />
                ))}

                <text x="170" y="110" textAnchor="middle" fill="#0F766E" fontSize="11.5" fontWeight="800">
                  2. HIRUP PERLAHAN & DALAM
                </text>
              </g>
            )}

            {deviceId === "inhaler" && stepIndex === 4 && (
              <g>
                {/* Calm lungs with 10-second radial retention ring */}
                <circle cx="280" cy="148" r="92" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="6" />
                <motion.circle
                  cx="280"
                  cy="148"
                  r="92"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="578"
                  animate={isPaused ? undefined : { strokeDashoffset: [578, 0] }}
                  transition={{ duration: dur(5), repeat: loopRepeat, ease: "linear" }}
                  style={{ transformOrigin: "280px 148px", rotate: "-90deg" }}
                />

                {/* Lungs inside ring */}
                <path d="M280 96 L280 142" stroke="#0F766E" strokeWidth="7" strokeLinecap="round" />
                <path d="M270 120 C236 126 222 156 232 186 C238 198 266 196 270 182 Z" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.2" />
                <path d="M290 120 C324 126 338 156 328 186 C322 198 294 196 290 182 Z" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.2" />

                {/* Settling medication particles deep in alveoli */}
                {[
                  [248, 152],
                  [258, 174],
                  [244, 178],
                  [312, 152],
                  [302, 174],
                  [316, 178],
                ].map(([cx, cy], idx) => (
                  <motion.circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#0284C7"
                    animate={isPaused ? undefined : { scale: [0.6, 1.35, 0.8], opacity: [0.4, 1, 0.6] }}
                    transition={{ duration: dur(2), repeat: loopRepeat, delay: idx * 0.2 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                ))}

                <rect x="396" y="102" width="126" height="66" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="459" y="130" textAnchor="middle" fill="#0D9488" fontSize="18" fontWeight="800">
                  10 Detik
                </text>
                <text x="459" y="150" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  Tahan Napas Tenang
                </text>

                <text x="280" y="280" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Partikel obat mengendap optimal di alveoli paru-paru
                </text>
              </g>
            )}

            {deviceId === "inhaler" && stepIndex === 5 && (
              <g>
                {/* Glass of warm water on left */}
                <path d="M128 122 L176 122 L168 202 L136 202 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.2" />
                <path d="M132 148 Q152 142 172 148 L168 200 L136 200 Z" fill="#38BDF8" fillOpacity="0.6" />
                <text x="152" y="226" textAnchor="middle" fill="#0369A1" fontSize="11" fontWeight="700">
                  Air Hangat
                </text>

                {/* Gargling water wave symbol */}
                <motion.g
                  animate={isPaused ? undefined : { x: [-6, 6, -6] }}
                  transition={{ duration: dur(0.8), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <circle cx="280" cy="148" r="46" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                  <path d="M248 152 Q264 136 280 152 T312 152" stroke="#0284C7" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M254 166 Q267 154 280 166 T306 166" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
                </motion.g>
                <text x="280" y="218" textAnchor="middle" fill="#0F766E" fontSize="11.5" fontWeight="700">
                  Kumur Merata
                </text>

                {/* Spitting out arc into basin (Do NOT swallow) */}
                <motion.path
                  d="M332 150 Q382 144 408 192"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  fill="none"
                  animate={isPaused ? undefined : { pathLength: [0, 1] }}
                  transition={{ duration: dur(1.8), repeat: loopRepeat }}
                />
                {/* Basin */}
                <path d="M372 204 L452 204 C446 226 378 226 372 204 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
                <text x="412" y="242" textAnchor="middle" fill="#BE123C" fontSize="11" fontWeight="800">
                  Buang (Jangan Ditelan)
                </text>
              </g>
            )}

            {/* ==================== 3. TETES MATA ==================== */}
            {deviceId === "tetes_mata" && stepIndex === 0 && (
              <g>
                <HandWashScene dur={dur} loopRepeat={loopRepeat} label="Cuci Tangan & Jaga Ujung Penetes Tetap Steril" compact />
                {/* Sterile Dropper Bottle on right with sterile protective ring */}
                <g transform="translate(365, 68)">
                  <rect x="26" y="76" width="58" height="92" rx="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                  <rect x="44" y="54" width="22" height="22" rx="4" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
                  <path d="M49 54 L55 28 L61 54 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
                  <motion.circle
                    cx="55"
                    cy="30"
                    r="20"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="#10B981"
                    fillOpacity="0.1"
                    animate={isPaused ? undefined : { scale: [0.9, 1.15, 0.9] }}
                    transition={{ duration: dur(2), repeat: loopRepeat }}
                    style={{ transformOrigin: "55px 30px" }}
                  />
                  <text x="55" y="190" textAnchor="middle" fill="#0F766E" fontSize="10.5" fontWeight="700">
                    Ujung Steril (Jangan Sentuh)
                  </text>
                </g>
              </g>
            )}

            {deviceId === "tetes_mata" && stepIndex === 1 && (
              <g>
                {/* Close-up Eye forming lower conjunctival pocket */}
                {/* Upper brow & lid */}
                <path d="M168 110 Q280 72 392 110" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Eye white (sclera) */}
                <path d="M180 154 Q280 96 380 154 Q280 202 180 154 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                {/* Iris looking upward */}
                <motion.g
                  animate={isPaused ? undefined : { y: [0, -10, -10, 0] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <circle cx="280" cy="146" r="24" fill="#0F766E" />
                  <circle cx="280" cy="146" r="10" fill="#0F172A" />
                  <circle cx="288" cy="138" r="4" fill="#FFFFFF" />
                </motion.g>

                {/* Lower eyelid gently pulled down to form red-pink conjunctival pocket */}
                <motion.path
                  d="M182 154 Q280 228 378 154 Q280 194 182 154 Z"
                  fill="#FECDD3"
                  stroke="#E11D48"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { scaleY: [0.25, 1, 1, 0.25] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "280px 168px" }}
                />

                {/* Clean finger pulling down */}
                <motion.g
                  animate={isPaused ? undefined : { y: [-8, 16, 16, -8] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <rect x="266" y="196" width="28" height="72" rx="14" fill="url(#skinLight)" stroke="#D97706" strokeWidth="1.8" />
                  <path d="M280 225 L280 252" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="280,256 275,248 285,248" fill="#0284C7" />
                </motion.g>

                <text x="280" y="290" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Dongakkan kepala & tarik kelopak bawah membentuk kantung konjungtiva
                </text>
              </g>
            )}

            {deviceId === "tetes_mata" && stepIndex === 2 && (
              <g>
                {/* Dropper poised 2 cm above lower conjunctival pocket */}
                <motion.g
                  animate={isPaused ? undefined : { scaleX: [1, 0.94, 1] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "280px 68px" }}
                >
                  <rect x="256" y="22" width="48" height="70" rx="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                  <path d="M272 92 L280 118 L288 92 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
                </motion.g>

                {/* Distance measurement bracket (±2 cm) */}
                <line x1="330" y1="118" x2="330" y2="180" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="322" y1="118" x2="338" y2="118" stroke="#0284C7" strokeWidth="2" />
                <line x1="322" y1="180" x2="338" y2="180" stroke="#0284C7" strokeWidth="2" />
                <text x="348" y="153" fill="#0369A1" fontSize="12" fontWeight="800">
                  Jarak ± 2 cm
                </text>
                <text x="348" y="168" fill="#64748B" fontSize="10" fontWeight="600">
                  (Jangan sentuh mata)
                </text>

                {/* Falling sterile droplet */}
                <motion.path
                  d="M280 120 C280 120 287 132 287 137 C287 141 283.8 144 280 144 C276.2 144 273 141 273 137 C273 132 280 120 280 120 Z"
                  fill="url(#skyGrad)"
                  animate={isPaused ? undefined : { y: [0, 74], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, ease: "easeIn" }}
                />

                {/* Open eye & conjunctival pocket below */}
                <path d="M190 194 Q280 152 370 194 Q280 232 190 194 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                <circle cx="280" cy="186" r="18" fill="#0F766E" />
                <circle cx="280" cy="186" r="7" fill="#0F172A" />
                <path d="M196 196 Q280 242 364 196 Q280 220 196 196 Z" fill="#FECDD3" stroke="#E11D48" strokeWidth="1.8" />

                {/* Impact ripple in pocket */}
                <motion.ellipse
                  cx="280"
                  cy="214"
                  rx="22"
                  ry="6"
                  stroke="#0284C7"
                  strokeWidth="2"
                  fill="none"
                  animate={isPaused ? undefined : { scale: [0.3, 1.4], opacity: [0.9, 0] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, delay: 1.3 }}
                  style={{ transformOrigin: "280px 214px" }}
                />

                <text x="280" y="282" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Teteskan 1 tetes tepat di dalam kantung kelopak bawah
                </text>
              </g>
            )}

            {deviceId === "tetes_mata" && stepIndex === 3 && (
              <g>
                {/* Gently closed eye with smooth liquid absorption waves */}
                <path d="M170 148 Q280 202 390 148" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Eyelashes */}
                {[205, 240, 280, 320, 355].map((x, idx) => (
                  <line key={idx} x1={x} y1={164 + (idx === 2 ? 12 : idx === 1 || idx === 3 ? 8 : 0)} x2={x + (idx - 2) * 3} y2={180 + (idx === 2 ? 12 : idx === 1 || idx === 3 ? 8 : 0)} stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
                ))}

                {/* Soothing radial absorption waves */}
                {[0, 1, 2].map((i) => (
                  <motion.ellipse
                    key={i}
                    cx="280"
                    cy="154"
                    rx="75"
                    ry="34"
                    stroke="#0D9488"
                    strokeWidth="2"
                    fill="none"
                    animate={isPaused ? undefined : { scale: [0.6, 1.4], opacity: [0.7, 0] }}
                    transition={{ duration: dur(2.6), repeat: loopRepeat, delay: i * 0.8 }}
                    style={{ transformOrigin: "280px 154px" }}
                  />
                ))}

                <text x="280" y="256" textAnchor="middle" fill="#0F766E" fontSize="12.5" fontWeight="700">
                  Pejamkan mata perlahan 2–3 menit · Jangan berkedip kencang
                </text>
              </g>
            )}

            {deviceId === "tetes_mata" && stepIndex === 4 && (
              <g>
                {/* Nasolacrimal Occlusion Diagram */}
                {/* Closed eye */}
                <path d="M210 132 Q302 182 394 132" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Nose bridge outline on left */}
                <path d="M188 86 L168 186 L204 196" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Nasolacrimal duct (blocked by gentle finger pressure) */}
                <path d="M210 138 L202 228" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" strokeDasharray="6 4" />
                <text x="132" y="216" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  Saluran air mata
                </text>
                <text x="132" y="230" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  (teroklusi aman)
                </text>

                {/* Pressing finger on medial canthus */}
                <motion.g
                  animate={isPaused ? undefined : { scale: [1, 0.94, 1] }}
                  transition={{ duration: dur(1.8), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "208px 146px" }}
                >
                  <circle cx="208" cy="146" r="18" fill="#0D9488" fillOpacity="0.18" stroke="#0D9488" strokeWidth="2.5" />
                  <rect x="195" y="150" width="26" height="82" rx="13" fill="url(#skinLight)" stroke="#D97706" strokeWidth="1.8" />
                </motion.g>

                <text x="310" y="268" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Tekan lembut sudut dalam mata 1–2 menit (Oklusi Lakrimalis)
                </text>
              </g>
            )}

            {deviceId === "tetes_mata" && stepIndex === 5 && (
              <g>
                {/* Tissue wiping cheek + Cap closing cleanly */}
                <motion.path
                  d="M115 162 C135 128 190 128 212 166 L194 214 L122 204 Z"
                  fill="#FFFFFF"
                  stroke="#94A3B8"
                  strokeWidth="2.2"
                  animate={isPaused ? undefined : { x: [-8, 12, -8] }}
                  transition={{ duration: dur(2.4), repeat: loopRepeat, ease: "easeInOut" }}
                />
                <text x="164" y="242" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">
                  Seka sisa cairan di pipi
                </text>

                {/* Bottle + Cap screwing down */}
                <g transform="translate(335, 96)">
                  <rect x="20" y="56" width="56" height="88" rx="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                  <path d="M40 56 L48 30 L56 56 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
                  <motion.path
                    d="M30 20 L66 20 L62 54 L34 54 Z"
                    fill="#0D9488"
                    stroke="#0F766E"
                    strokeWidth="2"
                    animate={isPaused ? undefined : { y: [-24, 4, 4, -24] }}
                    transition={{ duration: dur(2.8), repeat: loopRepeat, ease: "easeInOut" }}
                  />
                </g>
                <text x="383" y="266" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="700">
                  Tutup rapat tanpa menyentuh ujung
                </text>
              </g>
            )}

            {/* ==================== 4. TETES TELINGA ==================== */}
            {deviceId === "tetes_telinga" && stepIndex === 0 && (
              <g>
                {/* Rising amber warmth waves */}
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d={`M${246 + i * 34} 200 Q${236 + i * 34} 160 ${246 + i * 34} 120 T${246 + i * 34} 68`}
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    animate={isPaused ? undefined : { y: [10, -14], opacity: [0, 0.85, 0] }}
                    transition={{ duration: dur(2), repeat: loopRepeat, delay: i * 0.45 }}
                  />
                ))}

                {/* Two palms gently warming the bottle */}
                <motion.path
                  d="M175 130 C192 110 232 114 246 146 L246 218 L184 218 Z"
                  fill="url(#skinLight)"
                  stroke="#D97706"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { x: [-4, 4, -4] }}
                  transition={{ duration: dur(2.2), repeat: loopRepeat, ease: "easeInOut" }}
                />
                <motion.path
                  d="M385 130 C368 110 328 114 314 146 L314 218 L376 218 Z"
                  fill="url(#skinLight)"
                  stroke="#D97706"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { x: [4, -4, 4] }}
                  transition={{ duration: dur(2.2), repeat: loopRepeat, ease: "easeInOut" }}
                />

                {/* Ear drop bottle warming up */}
                <rect x="252" y="128" width="56" height="92" rx="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                <motion.rect
                  x="258"
                  y="152"
                  width="44"
                  height="60"
                  rx="8"
                  animate={isPaused ? undefined : { fill: ["#38BDF8", "#F59E0B", "#F59E0B"] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat }}
                />
                <path d="M272 128 L280 98 L288 128 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />

                <text x="280" y="266" textAnchor="middle" fill="#B45309" fontSize="12" fontWeight="700">
                  Hangatkan botol di genggaman tangan 1–2 menit (cegah vertigo)
                </text>
              </g>
            )}

            {deviceId === "tetes_telinga" && stepIndex === 1 && (
              <g>
                {/* Head tilting sideways so affected ear faces UP */}
                <motion.g
                  animate={isPaused ? undefined : { rotate: [0, 72, 72, 0] }}
                  transition={{ duration: dur(3.4), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "280px 180px" }}
                >
                  <circle cx="280" cy="148" r="56" fill="#FFFFFF" stroke="#334155" strokeWidth="2.8" />
                  {/* Ear on left side rotates to top */}
                  <ellipse cx="224" cy="148" rx="12" ry="22" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
                  <circle cx="264" cy="140" r="3.5" fill="#334155" />
                  <circle cx="296" cy="140" r="3.5" fill="#334155" />
                  <path d="M268 168 Q280 176 292 168" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </motion.g>

                {/* Upward orientation arrow */}
                <path d="M280 62 L280 34" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="280,28 275,38 285,38" fill="#0D9488" />
                <text x="355" y="48" fill="#0F766E" fontSize="11.5" fontWeight="700">
                  Telinga menghadap atas
                </text>

                <text x="280" y="278" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">
                  Miringkan kepala atau berbaring menyamping
                </text>
              </g>
            )}

            {deviceId === "tetes_telinga" && stepIndex === 2 && (
              <g>
                {/* Interactive Dewasa vs Anak Pinna Pull */}
                {/* Ear canal straightening */}
                <path
                  d="M170 156 Q240 160 305 156"
                  stroke="#FDA4AF"
                  strokeWidth="26"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Eardrum */}
                <ellipse cx="168" cy="156" rx="6" ry="18" fill="#F43F5E" fillOpacity="0.45" stroke="#E11D48" strokeWidth="2" />
                <text x="148" y="198" textAnchor="middle" fill="#BE123C" fontSize="10" fontWeight="700">
                  Gendang Telinga
                </text>

                {/* Pinna (daun telinga) pulled Up-Back for Adult OR Down-Back for Child */}
                <motion.g
                  animate={
                    isPaused
                      ? undefined
                      : earAgeMode === "dewasa"
                      ? { x: [0, 22, 22, 0], y: [0, -24, -24, 0] }
                      : { x: [0, 22, 22, 0], y: [0, 24, 24, 0] }
                  }
                  transition={{ duration: dur(2.8), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <path
                    d="M306 106 C352 94 374 134 360 176 C348 206 320 214 306 196 C296 184 302 152 306 106 Z"
                    fill="url(#skinLight)"
                    stroke="#D97706"
                    strokeWidth="2.5"
                  />
                  {/* Directional pull vector */}
                  {earAgeMode === "dewasa" ? (
                    <g>
                      <line x1="362" y1="118" x2="410" y2="74" stroke="#0D9488" strokeWidth="3.5" strokeLinecap="round" />
                      <polygon points="416,68 403,72 411,81" fill="#0D9488" />
                    </g>
                  ) : (
                    <g>
                      <line x1="362" y1="194" x2="410" y2="236" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                      <polygon points="416,242 411,229 403,238" fill="#0284C7" />
                    </g>
                  )}
                </motion.g>

                <text x="280" y="280" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  {earAgeMode === "dewasa"
                    ? "DEWASA: Tarik daun telinga ke ATAS & BELAKANG"
                    : "ANAK (< 3 Thn): Tarik daun telinga ke BAWAH & BELAKANG"}
                </text>
              </g>
            )}

            {deviceId === "tetes_telinga" && stepIndex === 3 && (
              <g>
                {/* Dropper above straightened vertical ear canal */}
                <rect x="258" y="26" width="44" height="62" rx="10" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                <path d="M273 88 L280 112 L287 88 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />

                {/* Sequential droplets falling cleanly */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx="280"
                    cy="118"
                    r="5.5"
                    fill="#0284C7"
                    animate={isPaused ? undefined : { y: [0, 118], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: dur(1.8), repeat: loopRepeat, delay: i * 0.55, ease: "easeIn" }}
                  />
                ))}

                {/* Vertical Ear Canal receiving drops */}
                <path d="M220 156 C236 156 254 166 256 186 L256 256 L304 256 L304 186 C306 166 324 156 340 156" stroke="#D97706" strokeWidth="3" fill="#FFF7ED" />
                <ellipse cx="280" cy="256" rx="24" ry="7" fill="#FDA4AF" stroke="#E11D48" strokeWidth="2" />

                <text x="280" y="290" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Teteskan sesuai dosis tanpa ujung penetes menyentuh telinga
                </text>
              </g>
            )}

            {deviceId === "tetes_telinga" && stepIndex === 4 && (
              <g>
                {/* Ear canal liquid pool diffusing calmly */}
                <path d="M210 110 C232 110 248 124 252 146 L252 238 L308 238 L308 146 C312 124 328 110 350 110" stroke="#D97706" strokeWidth="3" fill="#FFF7ED" />
                <motion.rect
                  x="254"
                  y="170"
                  width="52"
                  height="66"
                  rx="4"
                  fill="#38BDF8"
                  fillOpacity="0.45"
                  animate={isPaused ? undefined : { scaleY: [0.3, 1, 1], opacity: [0.4, 0.85, 0.85] }}
                  transition={{ duration: dur(3.4), repeat: loopRepeat, ease: "easeOut" }}
                  style={{ transformOrigin: "280px 236px" }}
                />
                <ellipse cx="280" cy="238" rx="28" ry="8" fill="#FDA4AF" stroke="#E11D48" strokeWidth="2" />

                <rect x="376" y="128" width="132" height="62" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="442" y="156" textAnchor="middle" fill="#0284C7" fontSize="16" fontWeight="800">
                  3 – 5 Menit
                </text>
                <text x="442" y="176" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  Tetap Miring Tenang
                </text>

                <text x="280" y="280" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Biarkan cairan mengalir & meresap ke dinding saluran telinga
                </text>
              </g>
            )}

            {deviceId === "tetes_telinga" && stepIndex === 5 && (
              <g>
                {/* Tragus gentle massage & air bubbles escaping */}
                <path d="M250 100 C295 82 340 120 330 185 C322 224 275 236 250 212" fill="url(#skinLight)" stroke="#D97706" strokeWidth="2.5" />
                {/* Tragus cartilage bump */}
                <motion.path
                  d="M252 146 C268 148 272 162 270 174 C266 184 252 184 248 176"
                  fill="#FDE68A"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  animate={isPaused ? undefined : { x: [0, 8, 0] }}
                  transition={{ duration: dur(1.1), repeat: loopRepeat, ease: "easeInOut" }}
                />

                {/* Pressing finger pulsing gently */}
                <motion.rect
                  x="156"
                  y="150"
                  width="88"
                  height="26"
                  rx="13"
                  fill="url(#skinLight)"
                  stroke="#D97706"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { x: [0, 12, 0] }}
                  transition={{ duration: dur(1.1), repeat: loopRepeat, ease: "easeInOut" }}
                />

                {/* Trapped air bubbles rising out */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={276 + i * 8}
                    cy="158"
                    r={4 - i * 0.6}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                    animate={isPaused ? undefined : { y: [0, -56], opacity: [0, 1, 0] }}
                    transition={{ duration: dur(1.6), repeat: loopRepeat, delay: i * 0.35 }}
                  />
                ))}

                <text x="280" y="274" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Pijat lembut tragus untuk mengeluarkan gelembung udara
                </text>
              </g>
            )}

            {/* ==================== 5. SEMPROT HIDUNG ==================== */}
            {deviceId === "semprot_hidung" && stepIndex === 0 && (
              <g>
                {/* Gentle nasal clearing with tissue */}
                <path
                  d="M210 80 C252 80 278 106 280 142 L298 164 L278 174 L278 212 L195 212 Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Soft tissue */}
                <motion.path
                  d="M294 156 L362 140 L376 206 L300 198 Z"
                  fill="#F1F5F9"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { rotate: [-4, 4, -4] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "300px 175px" }}
                />
                {/* Gentle air clearing streams */}
                {[0, 1].map((i) => (
                  <motion.path
                    key={i}
                    d={`M292 ${168 + i * 10} Q325 ${166 + i * 12} 352 ${176 + i * 12}`}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={isPaused ? undefined : { pathLength: [0, 1], opacity: [1, 0] }}
                    transition={{ duration: dur(1.5), repeat: loopRepeat, delay: i * 0.3 }}
                  />
                ))}

                <text x="280" y="272" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Hembuskan napas perlahan lewat hidung agar rongga bersih
                </text>
              </g>
            )}

            {deviceId === "semprot_hidung" && stepIndex === 1 && (
              <g>
                {/* Priming Nasal Spray upward into open air */}
                <g transform="translate(245, 118)">
                  {/* Bottle body */}
                  <rect x="10" y="54" width="50" height="84" rx="10" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
                  {/* Pumping collar + nozzle */}
                  <motion.g
                    animate={isPaused ? undefined : { y: [0, 12, 0] }}
                    transition={{ duration: dur(1.4), repeat: loopRepeat, ease: "easeInOut" }}
                  >
                    <rect x="-4" y="42" width="78" height="14" rx="6" fill="#0D9488" />
                    <path d="M27 42 L31 4 L39 4 L43 42 Z" fill="#CCFBF1" stroke="#0F766E" strokeWidth="2" />
                  </motion.g>
                </g>

                {/* Fine uniform mist plume spraying UPWARD */}
                <motion.path
                  d="M280 120 L234 46 L326 46 Z"
                  fill="url(#mistUpGrad)"
                  animate={isPaused ? undefined : { opacity: [0, 0.9, 0], scaleY: [0.3, 1.05, 1.15] }}
                  transition={{ duration: dur(1.4), repeat: loopRepeat, ease: "easeOut" }}
                  style={{ transformOrigin: "280px 120px" }}
                />
                {[-26, -12, 0, 14, 28].map((dx, i) => (
                  <motion.circle
                    key={i}
                    cx={280 + dx}
                    cy={92 - (i % 3) * 14}
                    r="2.8"
                    fill="#0D9488"
                    animate={isPaused ? undefined : { y: [18, -32], opacity: [0, 1, 0] }}
                    transition={{ duration: dur(1.4), repeat: loopRepeat, delay: 0.15 }}
                  />
                ))}

                <text x="280" y="284" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Kocok & semprot uji (priming) ke udara hingga keluar kabut halus
                </text>
              </g>
            )}

            {deviceId === "semprot_hidung" && stepIndex === 2 && (
              <g>
                {/* Side profile head tilting slightly FORWARD (toward toes) */}
                <motion.g
                  animate={isPaused ? undefined : { rotate: [0, 22, 22, 0] }}
                  transition={{ duration: dur(3), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "260px 210px" }}
                >
                  <path
                    d="M220 76 C268 76 296 106 298 142 L314 166 L296 176 L296 196 C296 208 282 216 266 216 L216 216 Z"
                    fill="#FFFFFF"
                    stroke="#334155"
                    strokeWidth="2.6"
                  />
                  {/* Gaze line looking down toward toes */}
                  <line x1="294" y1="138" x2="364" y2="196" stroke="#0284C7" strokeWidth="2" strokeDasharray="5 4" />
                  <circle cx="282" cy="134" r="4" fill="#0F172A" />
                </motion.g>

                <text x="396" y="196" fill="#0369A1" fontSize="11.5" fontWeight="700">
                  Pandangan ke ujung kaki
                </text>
                <text x="280" y="278" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Tundukkan kepala sedikit ke depan (jangan mendongak)
                </text>
              </g>
            )}

            {deviceId === "semprot_hidung" && stepIndex === 3 && (
              <g>
                {/* Frontal Nasal Diagram showing Septum vs Lateral Wall targeting */}
                {/* Outer nose outline */}
                <path
                  d="M280 56 L220 176 C210 198 228 214 252 210 L280 202 L308 210 C332 214 350 198 340 176 Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Central Septum (DO NOT AIM HERE) */}
                <rect x="275" y="96" width="10" height="106" rx="5" fill="#FECDD3" stroke="#E11D48" strokeWidth="2" />
                <text x="280" y="42" textAnchor="middle" fill="#BE123C" fontSize="11" fontWeight="800">
                  ✗ Hindari Septum (Sekat Tengah)
                </text>

                {/* Outer Eye Corner target on right */}
                <circle cx="386" cy="94" r="10" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
                <text x="412" y="98" fill="#0F766E" fontSize="11" fontWeight="700">
                  Sudut luar mata
                </text>

                {/* Nozzle angled LATERALLY (away from septum toward outer eye) */}
                <motion.g
                  animate={isPaused ? undefined : { rotate: [0, 26, 26, 0] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                  style={{ transformOrigin: "312px 212px" }}
                >
                  <path d="M304 244 L308 182 L316 182 L320 244 Z" fill="#0D9488" />
                  <line x1="312" y1="180" x2="312" y2="112" stroke="#0D9488" strokeWidth="2.5" strokeDasharray="5 4" />
                  <polygon points="312,106 307,116 317,116" fill="#0D9488" />
                </motion.g>

                <text x="280" y="280" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Arahkan nosel ke dinding luar (lateral), menjauhi septum hidung
                </text>
              </g>
            )}

            {deviceId === "semprot_hidung" && stepIndex === 4 && (
              <g>
                {/* Close opposite nostril + press pump + gentle inhale */}
                <path
                  d="M280 56 L220 176 C210 198 228 214 252 210 L280 202 L308 210 C332 214 350 198 340 176 Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Finger closing left nostril */}
                <rect x="166" y="176" width="70" height="24" rx="12" fill="url(#skinLight)" stroke="#D97706" strokeWidth="2" />
                <text x="150" y="164" textAnchor="middle" fill="#B45309" fontSize="10.5" fontWeight="700">
                  Tutup sisi lain
                </text>

                {/* Nozzle spraying laterally inside right nostril */}
                <g transform="rotate(22, 312, 210)">
                  <motion.g
                    animate={isPaused ? undefined : { y: [0, -8, 0] }}
                    transition={{ duration: dur(1.8), repeat: loopRepeat, ease: "easeInOut" }}
                  >
                    <path d="M304 252 L308 180 L316 180 L320 252 Z" fill="#0D9488" />
                  </motion.g>
                  {/* Mist fan */}
                  <motion.path
                    d="M312 180 L286 116 L338 116 Z"
                    fill="url(#mistUpGrad)"
                    animate={isPaused ? undefined : { opacity: [0, 0.9, 0], scaleY: [0.3, 1.1] }}
                    transition={{ duration: dur(1.8), repeat: loopRepeat }}
                    style={{ transformOrigin: "312px 180px" }}
                  />
                </g>

                <text x="430" y="148" textAnchor="middle" fill="#0F766E" fontSize="11.5" fontWeight="800">
                  Semprot + Hirup Lembut
                </text>
                <text x="280" y="286" textAnchor="middle" fill="#475569" fontSize="11.5" fontWeight="600">
                  Tekan pompa cepat sambil menghirup napas perlahan
                </text>
              </g>
            )}

            {deviceId === "semprot_hidung" && stepIndex === 5 && (
              <g>
                {/* Oral exhalation after withdrawing spray */}
                <path
                  d="M175 82 C220 82 248 110 250 144 L264 166 L248 176 L248 196 C248 210 234 218 218 218 L175 218 Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Exhale smoothly through MOUTH */}
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d={`M262 ${186 + (i - 1) * 10} Q318 ${180 + (i - 1) * 14} 382 ${190 + (i - 1) * 14}`}
                    stroke="#0D9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    animate={isPaused ? undefined : { pathLength: [0, 1], opacity: [0.95, 0], x: [0, 22] }}
                    transition={{ duration: dur(1.8), repeat: loopRepeat, delay: i * 0.25 }}
                  />
                ))}
                <text x="348" y="160" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="800">
                  Hembus Napas Lewat Mulut
                </text>
                <text x="280" y="274" textAnchor="middle" fill="#64748B" fontSize="11.5" fontWeight="600">
                  Jangan membuang ingus atau mendongak selama 10–15 menit
                </text>
              </g>
            )}

            {/* ==================== 6. PENA INSULIN ==================== */}
            {deviceId === "pena_insulin" && stepIndex === 0 && (
              <g>
                {/* Anatomical Rotation Site Map + Alcohol Swab Wipe */}
                {/* Torso + Upper Arms + Thighs schematic */}
                <path
                  d="M236 62 L324 62 L346 154 L322 156 L312 108 L312 178 L322 252 L288 252 L280 198 L272 252 L238 252 L248 178 L248 108 L238 156 L214 154 Z"
                  fill="#FFFFFF"
                  stroke="#475569"
                  strokeWidth="2.2"
                />
                {/* Navel center marker */}
                <circle cx="280" cy="150" r="3" fill="#94A3B8" />
                <circle cx="280" cy="150" r="14" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 3" fill="#FFE4E6" fillOpacity="0.4" />

                {/* Highlighted active injection site */}
                {insulinSite === "perut" && (
                  <motion.g>
                    <circle cx="258" cy="150" r="10" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                    <circle cx="302" cy="150" r="10" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                  </motion.g>
                )}
                {insulinSite === "paha" && (
                  <motion.g>
                    <ellipse cx="254" cy="222" rx="10" ry="20" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                    <ellipse cx="306" cy="222" rx="10" ry="20" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                  </motion.g>
                )}
                {insulinSite === "lengan" && (
                  <motion.g>
                    <ellipse cx="228" cy="112" rx="8" ry="18" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                    <ellipse cx="332" cy="112" rx="8" ry="18" fill="#0D9488" fillOpacity="0.28" stroke="#0D9488" strokeWidth="2" />
                  </motion.g>
                )}

                {/* Alcohol Swab wiping in circular motion */}
                <motion.g
                  animate={
                    isPaused
                      ? undefined
                      : {
                          x: [0, 8, 0, -8, 0],
                          y: [-6, 0, 6, 0, -6],
                        }
                  }
                  transition={{ duration: dur(2), repeat: loopRepeat, ease: "linear" }}
                >
                  <rect
                    x={insulinSite === "perut" ? 290 : insulinSite === "paha" ? 294 : 320}
                    y={insulinSite === "perut" ? 138 : insulinSite === "paha" ? 208 : 98}
                    width="24"
                    height="24"
                    rx="4"
                    fill="#E0F2FE"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                </motion.g>

                <text x="112" y="136" textAnchor="middle" fill="#BE123C" fontSize="10.5" fontWeight="700">
                  Jarak ≥ 5 cm
                </text>
                <text x="112" y="150" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  dari pusat pusar
                </text>
                <text x="444" y="144" textAnchor="middle" fill="#0369A1" fontSize="10.5" fontWeight="700">
                  Usap Alcohol Swab
                </text>
                <text x="444" y="158" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  & tunggu kering alami
                </text>
              </g>
            )}

            {deviceId === "pena_insulin" && stepIndex === 1 && (
              <g>
                {/* Insulin Pen Barrel on left */}
                <rect x="108" y="138" width="212" height="36" rx="8" fill="url(#tealGrad)" stroke="#0F766E" strokeWidth="2.5" />
                <rect x="280" y="142" width="44" height="28" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.8" />
                {/* Screw thread */}
                <rect x="324" y="146" width="14" height="20" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />

                {/* Sterile Needle Hub sliding LEFT and screwing clockwise onto pen */}
                <motion.g
                  animate={isPaused ? undefined : { x: [68, 0, 0, 68] }}
                  transition={{ duration: dur(3.2), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <path d="M338 142 L368 146 L368 166 L338 170 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.2" />
                  <line x1="368" y1="156" x2="396" y2="156" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
                </motion.g>

                {/* Clockwise rotation arrow */}
                <motion.path
                  d="M352 108 A28 28 0 0 1 380 132"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  fill="none"
                  animate={isPaused ? undefined : { opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: dur(1.4), repeat: loopRepeat }}
                />
                <polygon points="382,136 375,128 386,127" fill="#0284C7" />
                <text x="394" y="114" fill="#0369A1" fontSize="11" fontWeight="700">
                  Putar searah jarum jam
                </text>

                <text x="280" y="256" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Pasang jarum steril baru setiap kali penyuntikan
                </text>
              </g>
            )}

            {deviceId === "pena_insulin" && stepIndex === 2 && (
              <g>
                {/* Upright Insulin Pen Priming (Air-Shot 2 Units) */}
                <rect x="260" y="102" width="40" height="148" rx="8" fill="url(#tealGrad)" stroke="#0F766E" strokeWidth="2.5" />
                {/* Transparent cartridge with tiny rising air bubbles */}
                <rect x="266" y="108" width="28" height="46" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={274 + i * 6}
                    cy="144"
                    r="2.5"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="1.2"
                    animate={isPaused ? undefined : { y: [0, -30], opacity: [1, 0] }}
                    transition={{ duration: dur(1.4), repeat: loopRepeat, delay: i * 0.25 }}
                  />
                ))}

                {/* Needle pointing UP */}
                <path d="M270 102 L276 80 L284 80 L290 102 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
                <line x1="280" y1="80" x2="280" y2="52" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />

                {/* Primed insulin droplet appearing at needle tip */}
                <motion.circle
                  cx="280"
                  cy="44"
                  r="6"
                  fill="#0284C7"
                  animate={isPaused ? undefined : { scale: [0, 1.15, 0], y: [6, -6, -14], opacity: [0, 1, 0] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, delay: 0.6 }}
                  style={{ transformOrigin: "280px 44px" }}
                />

                {/* Plunger button pressing UP at bottom */}
                <motion.rect
                  x="266"
                  y="250"
                  width="28"
                  height="22"
                  rx="6"
                  fill="#F59E0B"
                  stroke="#B45309"
                  strokeWidth="2"
                  animate={isPaused ? undefined : { y: [10, -2, 10] }}
                  transition={{ duration: dur(2), repeat: loopRepeat, ease: "easeInOut" }}
                />

                <rect x="348" y="96" width="142" height="62" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="419" y="122" textAnchor="middle" fill="#0F766E" fontSize="14" fontWeight="800">
                  Priming: 2 Unit
                </text>
                <text x="419" y="142" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                  Pastikan tetesan keluar
                </text>
              </g>
            )}

            {deviceId === "pena_insulin" && stepIndex === 3 && (
              <g>
                {/* Close-up Dose Selector Window */}
                <rect x="112" y="106" width="336" height="86" rx="18" fill="url(#tealGrad)" stroke="#0F766E" strokeWidth="3" />
                {/* Magnified dose window */}
                <rect x="206" y="122" width="108" height="54" rx="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
                {/* Pointer triangle */}
                <polygon points="326,149 338,142 338,156" fill="#FDE047" />

                {/* Animated dose value */}
                <motion.text
                  key={demoInsulinUnits}
                  x="260"
                  y="159"
                  textAnchor="middle"
                  fill="#0F172A"
                  fontSize="30"
                  fontWeight="800"
                  fontFamily="monospace"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {demoInsulinUnits} U
                </motion.text>

                {/* Rotating textured dial knob on right */}
                <motion.g
                  animate={isPaused ? undefined : { y: [-3, 3, -3] }}
                  transition={{ duration: dur(1.2), repeat: loopRepeat }}
                >
                  <rect x="386" y="114" width="54" height="70" rx="10" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" />
                  {[126, 138, 150, 162, 174].map((y) => (
                    <line key={y} x1="394" y1={y} x2="432" y2={y} stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  ))}
                </motion.g>

                <text x="280" y="236" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Putar kenop dosis hingga jendela menunjukkan unit sesuai resep
                </text>
              </g>
            )}

            {deviceId === "pena_insulin" && stepIndex === 4 && (
              <g>
                {/* Skin Cross-Section: Epidermis -> Subcutaneous Fat -> Muscle */}
                {/* Muscle Layer */}
                <rect x="65" y="242" width="430" height="44" rx="8" fill="#FECDD3" stroke="#FB7185" strokeWidth="1.5" />
                <text x="482" y="268" textAnchor="end" fill="#9F1239" fontSize="10" fontWeight="700">
                  Otot (Hindari)
                </text>
                {/* Subcutaneous Fat Layer (TARGET) */}
                <rect x="65" y="182" width="430" height="60" fill="url(#subcutFat)" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="482" y="216" textAnchor="end" fill="#B45309" fontSize="10.5" fontWeight="800">
                  Lapisan Subkutan (Target)
                </text>
                {/* Epidermis / Skin Surface */}
                <rect x="65" y="164" width="430" height="18" fill="url(#skinLight)" stroke="#D97706" strokeWidth="1.5" />

                {/* 90-degree Perpendicular Angle Guide */}
                <path d="M294 164 L294 146 L280 146" stroke="#0284C7" strokeWidth="2" fill="none" />
                <text x="310" y="154" fill="#0369A1" fontSize="12" fontWeight="800">
                  90° Tegak Lurus
                </text>

                {/* Insulin Pen descending cleanly at 90 degrees */}
                <motion.g
                  animate={isPaused ? undefined : { y: [-38, 0, 0, -38] }}
                  transition={{ duration: dur(3.6), repeat: loopRepeat, ease: "easeInOut" }}
                >
                  <rect x="262" y="26" width="36" height="106" rx="8" fill="url(#tealGrad)" stroke="#0F766E" strokeWidth="2.5" />
                  <path d="M272 132 L277 154 L283 154 L288 132 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
                  {/* Fine needle penetrating into subcutaneous fat */}
                  <line x1="280" y1="154" x2="280" y2="210" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
                </motion.g>

                {/* Insulin bolus expanding gently in subcutaneous fat */}
                <motion.circle
                  cx="280"
                  cy="214"
                  r="18"
                  fill="#0D9488"
                  fillOpacity="0.45"
                  animate={isPaused ? undefined : { scale: [0, 0.2, 1.15, 0], opacity: [0, 0.2, 0.85, 0] }}
                  transition={{ duration: dur(3.6), repeat: loopRepeat, ease: "easeOut" }}
                  style={{ transformOrigin: "280px 214px" }}
                />
              </g>
            )}

            {deviceId === "pena_insulin" && stepIndex === 5 && (
              <g>
                {/* Left: 10-second needle retention ring */}
                <g transform="translate(168, 146)">
                  <circle cx="0" cy="0" r="64" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="6" />
                  <motion.circle
                    cx="0"
                    cy="0"
                    r="64"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="402"
                    animate={isPaused ? undefined : { strokeDashoffset: [402, 0] }}
                    transition={{ duration: dur(4.5), repeat: loopRepeat, ease: "linear" }}
                    style={{ rotate: "-90deg" }}
                  />
                  <text x="0" y="-4" textAnchor="middle" fill="#0F766E" fontSize="22" fontWeight="800">
                    10 dtk
                  </text>
                  <text x="0" y="18" textAnchor="middle" fill="#64748B" fontSize="10.5" fontWeight="700">
                    Tahan di Kulit
                  </text>
                </g>

                {/* Arrow to sharp container */}
                <path d="M254 146 L312 146" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="5 4" />
                <polygon points="318,146 308,141 308,151" fill="#94A3B8" />

                {/* Right: Yellow Sharp Container receiving detached needle */}
                <g transform="translate(344, 114)">
                  <motion.g
                    animate={isPaused ? undefined : { y: [-40, 12], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: dur(2.4), repeat: loopRepeat, ease: "easeIn" }}
                  >
                    <rect x="44" y="-8" width="16" height="22" rx="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
                    <line x1="52" y1="14" x2="52" y2="30" stroke="#334155" strokeWidth="2" />
                  </motion.g>
                  {/* Container body */}
                  <path d="M12 28 L92 28 L84 114 L20 114 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
                  <rect x="6" y="18" width="92" height="12" rx="4" fill="#DC2626" />
                  <text x="52" y="74" textAnchor="middle" fill="#854D0E" fontSize="10" fontWeight="800">
                    SHARP
                  </text>
                  <text x="52" y="88" textAnchor="middle" fill="#854D0E" fontSize="9.5" fontWeight="700">
                    CONTAINER
                  </text>
                </g>

                <text x="280" y="276" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
                  Tahan jarum 10 detik, lalu lepas & buang ke wadah benda tajam
                </text>
              </g>
            )}
          </motion.g>
        </AnimatePresence>
      </svg>

      {/* Contextual Interactive Mini-Controls right on the Stage (only on interactive steps) */}
      {deviceId === "tetes_telinga" && stepIndex === 2 && (
        <div className="absolute top-3 left-3 flex items-center gap-1 p-1 bg-white/95 border border-slate-200 rounded-lg shadow-xs">
          <button
            type="button"
            onClick={() => setEarAgeMode("dewasa")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              earAgeMode === "dewasa"
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dewasa (Atas-Belakang)
          </button>
          <button
            type="button"
            onClick={() => setEarAgeMode("anak")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              earAgeMode === "anak"
                ? "bg-sky-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Anak &lt;3 Thn (Bawah-Belakang)
          </button>
        </div>
      )}

      {deviceId === "pena_insulin" && stepIndex === 0 && (
        <div className="absolute top-3 left-3 flex items-center gap-1 p-1 bg-white/95 border border-slate-200 rounded-lg shadow-xs">
          {(
            [
              { id: "perut", label: "Perut" },
              { id: "paha", label: "Paha" },
              { id: "lengan", label: "Lengan" },
            ] as const
          ).map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => setInsulinSite(site.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                insulinSite === site.id
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {site.label}
            </button>
          ))}
        </div>
      )}

      {deviceId === "pena_insulin" && stepIndex === 3 && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-white/95 border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600">Simulasi Dosis:</span>
          <button
            type="button"
            onClick={() => setDemoInsulinUnits((u) => Math.max(2, u - 2))}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
            aria-label="Kurangi dosis simulasi"
          >
            −
          </button>
          <span className="text-xs font-mono font-bold text-teal-700 tabular-nums min-w-[34px] text-center">
            {demoInsulinUnits} U
          </span>
          <button
            type="button"
            onClick={() => setDemoInsulinUnits((u) => Math.min(40, u + 2))}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
            aria-label="Tambah dosis simulasi"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

/* Reusable Clinical Handwashing Vector Animation */
const HandWashScene: React.FC<{
  dur: (base: number) => number;
  loopRepeat: number;
  label: string;
  compact?: boolean;
  showCheck?: boolean;
}> = ({ dur, loopRepeat, label, compact = false, showCheck = false }) => {
  const offsetX = compact ? -95 : 0;
  return (
    <g transform={`translate(${offsetX}, 0)`}>
      {/* Faucet */}
      <path d="M240 42 L292 42 C304 42 312 50 312 62 L312 72 L288 72 L288 62 L240 62 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />

      {/* Flowing Water Stream */}
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1={294 + i * 6}
          y1="74"
          x2={294 + i * 6}
          y2="162"
          stroke="#38BDF8"
          strokeWidth="2.8"
          strokeDasharray="10 8"
          strokeLinecap="round"
          animate={loopRepeat === 0 ? undefined : { strokeDashoffset: [0, -36] }}
          transition={{ duration: dur(0.8), repeat: loopRepeat, ease: "linear" }}
        />
      ))}

      {/* Two hands rubbing smoothly */}
      <motion.g
        animate={loopRepeat === 0 ? undefined : { x: [-8, 8, -8] }}
        transition={{ duration: dur(1.2), repeat: loopRepeat, ease: "easeInOut" }}
      >
        <rect x="234" y="156" width="88" height="32" rx="16" fill="url(#skinLight)" stroke="#D97706" strokeWidth="2" />
      </motion.g>
      <motion.g
        animate={loopRepeat === 0 ? undefined : { x: [8, -8, 8] }}
        transition={{ duration: dur(1.2), repeat: loopRepeat, ease: "easeInOut" }}
      >
        <rect x="276" y="176" width="88" height="32" rx="16" fill="url(#skinLight)" stroke="#D97706" strokeWidth="2" />
      </motion.g>

      {/* Rising soap bubbles */}
      {[
        [264, 160, 7],
        [292, 152, 9],
        [318, 166, 6],
        [278, 186, 8],
        [308, 192, 6.5],
      ].map(([cx, cy, r], idx) => (
        <motion.circle
          key={idx}
          cx={cx}
          cy={cy}
          r={r}
          fill="#FFFFFF"
          fillOpacity="0.85"
          stroke="#38BDF8"
          strokeWidth="1.8"
          animate={loopRepeat === 0 ? undefined : { y: [6, -24], opacity: [0, 1, 0], scale: [0.6, 1.15, 0.8] }}
          transition={{ duration: dur(1.8), repeat: loopRepeat, delay: idx * 0.25 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}

      {showCheck && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
          style={{ transformOrigin: "396px 128px" }}
        >
          <circle cx="396" cy="128" r="24" fill="#10B981" />
          <path d="M385 128 L393 136 L409 120" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.g>
      )}

      {!compact && (
        <text x="280" y="266" textAnchor="middle" fill="#0F766E" fontSize="12" fontWeight="700">
          {label}
        </text>
      )}
    </g>
  );
};

export default DeviceStepAnimator;
