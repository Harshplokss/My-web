import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, Sparkles, Trophy, Compass } from "lucide-react";
import { SoundManager } from "../utils/SoundManager";

export default function QuestMap({ levels = [], currentLevel = 1 }) {
  const navigate = useNavigate();

  return (
    <div className="glass rounded-2xl p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] my-8">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] font-accent text-xs tracking-[0.3em] uppercase">
            <Compass size={16} /> Interactive Quest Path
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-white mt-1">The Realm Map</h2>
        </div>
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10 text-xs text-gray-300">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" /> Current Chamber</span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
        </div>
      </div>

      {/* Quest Path Container */}
      <div className="relative py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-4xl mx-auto">
        {/* Background Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-[#B87333] via-[#D4AF37] to-gray-800 -translate-y-1/2 z-0 rounded-full opacity-40" />

        {levels.map((lvl, idx) => {
          const isUnlocked = lvl.unlocked;
          const isCompleted = lvl.completed;
          const isCurrent = lvl.number === currentLevel && isUnlocked && !isCompleted;

          return (
            <motion.div
              key={lvl.level_id || idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => {
                if (isUnlocked) {
                  SoundManager.playClick();
                  navigate(`/level/${lvl.number}`);
                }
              }}
              data-testid={`quest-node-${lvl.number}`}
            >
              {/* Pulsing Aura for Current Level */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-[#D4AF37]/30 blur-xl animate-ping" />
              )}

              {/* Node Circle */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 border-2 shadow-lg relative ${
                  isCompleted
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-110"
                    : isCurrent
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:scale-110"
                    : isUnlocked
                    ? "bg-gray-900 border-[#D4AF37]/50 text-gray-200 hover:border-[#D4AF37] hover:scale-105"
                    : "bg-gray-900/60 border-gray-800 text-gray-600 cursor-not-allowed opacity-60"
                }`}
              >
                {isCompleted ? (
                  <Check size={28} className="stroke-[2.5]" />
                ) : isCurrent ? (
                  <Sparkles size={28} className="animate-spin-slow" />
                ) : isUnlocked ? (
                  <span className="font-display text-2xl font-bold">{lvl.number}</span>
                ) : (
                  <Lock size={22} />
                )}

                {/* Level Badge Number */}
                <div className="absolute -bottom-2 bg-black/80 border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-accent text-gray-300 tracking-wider">
                  LVL {lvl.number}
                </div>
              </div>

              {/* Title & Subtitle Info Box */}
              <div className="mt-4 text-center max-w-[140px]">
                <h4 className={`font-display text-sm font-semibold truncate ${isCurrent ? "text-[#D4AF37]" : isUnlocked ? "text-white" : "text-gray-500"}`}>
                  {lvl.title}
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                  {isCompleted ? "Conquered" : isUnlocked ? `${lvl.total_questions || 1} Riddle` : "Locked"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
