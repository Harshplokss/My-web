import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Anchor, Star } from "lucide-react";
import { SoundManager } from "../utils/SoundManager";
import { useNavigate } from "react-router-dom";

// Arc data with colors and emblems
const ARC_THEMES = {
  1: { sea: "East Blue", color: "#4A90D9", glow: "rgba(74,144,217,0.4)", icon: "⛵", bg: "#0A1E35" },
  2: { sea: "East Blue", color: "#E74C3C", glow: "rgba(231,76,60,0.4)", icon: "🐟", bg: "#1A0A0A" },
  3: { sea: "Grand Line", color: "#D4AF37", glow: "rgba(212,175,55,0.4)", icon: "🏜️", bg: "#1A1200" },
  4: { sea: "Marineford", color: "#FF4500", glow: "rgba(255,69,0,0.5)", icon: "⚔️", bg: "#1A0500" },
  5: { sea: "God Valley", color: "#8B00FF", glow: "rgba(139,0,255,0.6)", icon: "☠️", bg: "#0D0015" },
};

const ISLAND_EMOJIS = ["🏝️", "🌴", "⛰️", "🏔️", "💎"];

// Individual island node for the map
function IslandNode({ lvl, index, currentLevel, onSelect }) {
  const isUnlocked = lvl.unlocked;
  const isCompleted = lvl.completed;
  const isCurrent = lvl.number === currentLevel && isUnlocked && !isCompleted;
  const theme = ARC_THEMES[lvl.number] || ARC_THEMES[1];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 200 }}
      className={`island-node flex flex-col items-center gap-2 relative z-10 ${isUnlocked ? '' : 'opacity-50'}`}
      onClick={() => isUnlocked && onSelect(lvl.number)}
      data-testid={`island-node-${lvl.number}`}
    >
      {/* Pulsing aura for current island */}
      {isCurrent && (
        <>
          <div style={{
            position: 'absolute',
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
            animation: 'pulse 1.5s ease-in-out infinite',
            top: '0px', left: '50%', transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute',
            width: '100px', height: '100px',
            borderRadius: '50%',
            border: `2px solid ${theme.color}`,
            opacity: 0.4,
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            top: '-10px', left: '50%', transform: 'translateX(-50%)',
          }} />
        </>
      )}

      {/* Island circle */}
      <div
        className="island-circle relative flex items-center justify-center rounded-full text-2xl"
        style={{
          width: '64px', height: '64px',
          background: isCompleted
            ? `linear-gradient(135deg, #059669, #10B981)`
            : isCurrent
            ? `linear-gradient(135deg, ${theme.color}, ${theme.glow})`
            : isUnlocked
            ? `linear-gradient(135deg, #0D2847, #1A4A7A)`
            : `linear-gradient(135deg, #1a1a2e, #0d0d1a)`,
          border: `3px solid ${isCompleted ? '#10B981' : isCurrent ? theme.color : isUnlocked ? 'rgba(74,144,217,0.4)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isCurrent ? `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}` : 'none',
          animation: isCurrent ? 'float-island 3s ease-in-out infinite' : 'none',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 size={26} className="text-emerald-400" />
        ) : isUnlocked ? (
          <span>{ISLAND_EMOJIS[(lvl.number - 1) % ISLAND_EMOJIS.length]}</span>
        ) : (
          <Lock size={20} className="text-gray-500" />
        )}
      </div>

      {/* Level number label */}
      <div style={{
        background: 'rgba(4,13,26,0.9)',
        border: `1px solid ${isCompleted ? '#10B981' : isCurrent ? theme.color : 'rgba(74,144,217,0.3)'}`,
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: '10px',
        fontFamily: 'Cinzel, serif',
        letterSpacing: '0.1em',
        color: isCompleted ? '#10B981' : isCurrent ? theme.color : '#9CA3AF',
        whiteSpace: 'nowrap',
        maxWidth: '90px',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {lvl.number === 5 ? '⚠️ FINAL' : `ARC ${lvl.number}`}
      </div>

      {/* Arc name tooltip */}
      <div style={{
        fontSize: '9px',
        color: '#6B7280',
        fontFamily: 'Cabin, sans-serif',
        textAlign: 'center',
        maxWidth: '80px',
        lineHeight: 1.2,
      }}>
        {lvl.title}
      </div>
    </motion.div>
  );
}

// Connecting path between islands
function IslandPath({ fromCompleted }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      width: '50px',
      marginBottom: '30px',
      flexShrink: 0,
    }}>
      <div style={{
        height: '2px',
        flex: 1,
        background: fromCompleted
          ? 'linear-gradient(90deg, #10B981, #D4AF37)'
          : 'repeating-linear-gradient(90deg, rgba(212,175,55,0.3) 0px, rgba(212,175,55,0.3) 6px, transparent 6px, transparent 12px)',
        boxShadow: fromCompleted ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
        transition: 'all 0.5s ease',
      }} />
      {fromCompleted && (
        <div style={{ fontSize: '10px', margin: '0 2px', color: '#D4AF37' }}>⚓</div>
      )}
    </div>
  );
}

export default function GrandLineMap({ levels = [], currentLevel = 1 }) {
  const navigate = useNavigate();

  const handleSelect = (num) => {
    SoundManager.playClick();
    navigate(`/level/${num}`);
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(7,21,37,0.9) 0%, rgba(4,13,26,0.95) 100%)',
      borderRadius: '1rem',
      border: '1px solid rgba(74,144,217,0.2)',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', fontSize: '10px', fontFamily: 'Cinzel,serif', letterSpacing: '0.2em' }}>
            <Anchor size={14} />
            THE GRAND LINE JOURNEY
          </div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '1.4rem', color: '#F3F4F6', marginTop: '2px' }}>
            Your Route
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontFamily: 'Cabin,sans-serif', color: '#9CA3AF' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            Cleared
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D4AF37', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            Current
          </span>
        </div>
      </div>

      {/* Map scroll area */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: `${levels.length * 130}px`, gap: 0, paddingTop: '10px' }}>
          {levels.map((lvl, idx) => (
            <React.Fragment key={lvl.level_id || idx}>
              <IslandNode
                lvl={lvl}
                index={idx}
                currentLevel={currentLevel}
                onSelect={handleSelect}
              />
              {idx < levels.length - 1 && (
                <IslandPath fromCompleted={lvl.completed} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sea depth gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(74,144,217,0.5), rgba(212,175,55,0.3), rgba(74,144,217,0.5), transparent)',
      }} />
    </div>
  );
}
