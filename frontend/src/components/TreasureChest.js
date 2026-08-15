import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COIN_COLORS = ["#D4AF37", "#F5D05C", "#FFE87A", "#D4AF37", "#E5C158"];

export default function TreasureChest({ open = false, onComplete }) {
  const [showRays, setShowRays] = useState(false);
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowRays(true), 800);
      setTimeout(() => {
        const newCoins = Array.from({ length: 18 }).map((_, i) => ({
          id: i,
          angle: (i / 18) * 360,
          dist: 60 + Math.random() * 80,
          color: COIN_COLORS[i % COIN_COLORS.length],
          size: 10 + Math.random() * 8,
          delay: Math.random() * 0.4,
        }));
        setCoins(newCoins);
      }, 600);
      if (onComplete) setTimeout(onComplete, 2000);
    }
  }, [open, onComplete]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Gold light burst */}
      <AnimatePresence>
        {showRays && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '100px', height: '100px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,232,122,0.9) 0%, rgba(212,175,55,0.4) 50%, transparent 70%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Scattered coins */}
      <AnimatePresence>
        {open && coins.map((coin) => {
          const rad = (coin.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * coin.dist;
          const ty = Math.sin(rad) * coin.dist - 30;
          return (
            <motion.div
              key={coin.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: tx, y: ty, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
              transition={{ duration: 0.9, delay: coin.delay, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: coin.size, height: coin.size,
                borderRadius: '50%',
                background: coin.color,
                border: `1px solid rgba(255,255,255,0.4)`,
                boxShadow: `0 0 ${coin.size}px ${coin.color}`,
                zIndex: 20,
                pointerEvents: 'none',
                marginLeft: `-${coin.size / 2}px`,
                marginTop: `-${coin.size / 2}px`,
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Chest SVG */}
      <div className={`treasure-chest-wrapper relative ${open ? 'chest-glow' : ''}`}
        style={{ width: '180px', height: '160px' }}
      >
        <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="180" height="160">
          {/* Chest bottom */}
          <rect x="20" y="90" width="140" height="65" rx="6" fill="#6B3A2A" stroke="#8B5E3C" strokeWidth="2"/>
          <rect x="25" y="95" width="130" height="55" rx="4" fill="#8B5E3C"/>
          {/* Straps / bands */}
          <rect x="20" y="104" width="140" height="10" fill="#5C3020" stroke="#4A2010" strokeWidth="1"/>
          <rect x="20" y="128" width="140" height="10" fill="#5C3020" stroke="#4A2010" strokeWidth="1"/>
          {/* Lock */}
          <rect x="78" y="96" width="24" height="22" rx="3" fill="#D4AF37" stroke="#A0780A" strokeWidth="2"/>
          <circle cx="90" cy="106" r="6" fill="#A0780A"/>
          <rect x="87" y="107" width="6" height="8" rx="1" fill="#A0780A"/>

          {/* Lid - animated */}
          <motion.g
            style={{ transformOrigin: '90px 90px' }}
            animate={open ? { rotateX: -130 } : { rotateX: 0 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <rect x="20" y="50" width="140" height="45" rx="6 6 0 0" fill="#6B3A2A" stroke="#8B5E3C" strokeWidth="2"/>
            <rect x="25" y="55" width="130" height="37" rx="4" fill="#8B5E3C"/>
            {/* Lid band */}
            <rect x="20" y="68" width="140" height="8" fill="#5C3020" stroke="#4A2010" strokeWidth="1"/>
            {/* Lid decoration */}
            <circle cx="90" cy="62" r="8" fill="#D4AF37" stroke="#A0780A" strokeWidth="2"/>
            <text x="87" y="67" fontSize="10" fill="#5C3020">★</text>
          </motion.g>

          {/* Gold glow inside when open */}
          <AnimatePresence>
            {open && (
              <motion.ellipse
                cx="90" cy="90" rx="50" ry="10"
                fill="rgba(255,232,122,0.6)"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, 0.8, 0], scaleX: [0, 1, 2] }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
