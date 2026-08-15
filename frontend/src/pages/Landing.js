import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Compass, Map, Shield, Zap, Users } from "lucide-react";
import OceanBackground from "../components/OceanBackground";
import { SoundManager } from "../utils/SoundManager";
import { useAuth } from "../context/AuthContext";

// Compass Rose SVG
const CompassRose = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="compass-spin" style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }}>
    <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.5"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.3"/>
    {/* N */}
    <polygon points="50,10 44,40 56,40" fill="#C0392B"/>
    {/* S */}
    <polygon points="50,90 44,60 56,60" fill="#F5E6C8"/>
    {/* E */}
    <polygon points="90,50 60,44 60,56" fill="#F5E6C8"/>
    {/* W */}
    <polygon points="10,50 40,44 40,56" fill="#F5E6C8"/>
    {/* Center */}
    <circle cx="50" cy="50" r="6" fill="#D4AF37"/>
    <circle cx="50" cy="50" r="3" fill="#0A1E35"/>
    {/* Tick marks */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const x1 = 50 + 38 * Math.cos(angle - Math.PI / 2);
      const y1 = 50 + 38 * Math.sin(angle - Math.PI / 2);
      const x2 = 50 + 43 * Math.cos(angle - Math.PI / 2);
      const y2 = 50 + 43 * Math.sin(angle - Math.PI / 2);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="1.5" opacity="0.6"/>;
    })}
    {/* N label */}
    <text x="46" y="8" fontSize="8" fill="#C0392B" fontFamily="Cinzel,serif" fontWeight="700">N</text>
  </svg>
);

// Floating wanted poster effect for hero
const WantedSplash = () => (
  <motion.div
    initial={{ rotate: -5, opacity: 0, y: 20 }}
    animate={{ rotate: [-5, -3, -5], opacity: 1, y: 0 }}
    transition={{ delay: 1, duration: 0.8, rotate: { repeat: Infinity, duration: 4 } }}
    style={{
      position: 'absolute',
      right: '5%',
      top: '15%',
      width: '160px',
      display: 'none',
    }}
    className="hidden lg:block"
  >
    <div className="wanted-poster rounded-lg p-4 text-center">
      <p style={{ fontFamily: 'Cinzel,serif', fontSize: '11px', letterSpacing: '0.2em', color: '#2C1810', marginBottom: '6px' }}>WANTED</p>
      <p style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '0.15em', color: '#5C3A1E' }}>DEAD OR ALIVE</p>
      {/* Placeholder pirate silhouette */}
      <div style={{ width: '100%', height: '90px', background: 'linear-gradient(135deg, #C4A46B, #A08040)', borderRadius: '4px', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
        ☠️
      </div>
      <p style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', color: '#2C1810', letterSpacing: '0.1em' }}>THE GRAND LINE</p>
      <p style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: '700', color: '#5C3A1E', marginTop: '4px' }}>TREASURE HUNT</p>
      <div style={{ borderTop: '1px solid #8B5E3C', marginTop: '8px', paddingTop: '6px' }}>
        <p style={{ fontFamily: 'Cinzel,serif', fontSize: '8px', color: '#5C3A1E' }}>BOUNTY:</p>
        <p style={{ fontFamily: 'Cinzel,serif', fontSize: '14px', fontWeight: '700', color: '#C0392B' }}>∞ BERRY</p>
      </div>
    </div>
  </motion.div>
);

const FEATURES = [
  { icon: Map, title: "26 Grand Line Arcs", desc: "Journey from East Blue to God Valley through iconic One Piece story arcs." },
  { icon: Shield, title: "Anti-Cheat Enforced", desc: "Server-side answer validation. No shortcuts to the One Piece." },
  { icon: Zap, title: "Bounty System", desc: "Earn Berry for every correct answer. Climb the pirate ranks." },
  { icon: Users, title: "Crew vs Marine", desc: "Join the Pirates or Marines. Compete for crew dominance." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowSplash(true), 800);
  }, []);

  const handleSignIn = () => {
    SoundManager.playClick();
    if (user) {
      navigate("/dashboard");
      return;
    }
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden vignette">
      {/* Animated Ocean Background */}
      <OceanBackground showShip />

      {/* Wanted Poster */}
      <WantedSplash />

      {/* Nav */}
      <div className="relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Anchor size={22} className="text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.6))' }} />
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.75rem', letterSpacing: '0.35em', color: '#D4AF37' }}>
            GRAND LINE HUNT
          </span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleSignIn}
          className="btn-ghost hidden sm:inline-flex"
          data-testid="landing-signin-top"
        >
          Sign In
        </motion.button>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-20 pb-32">
        {/* Compass + tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mb-8"
        >
          <CompassRose size={60} />
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.4em', color: '#D4AF37', opacity: 0.8 }}>
            ◆ THE GRAND LINE AWAITS — FIND THE ONE PIECE ◆
          </p>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontFamily: 'Cinzel,serif',
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            lineHeight: 1.05,
            maxWidth: '800px',
            textShadow: '0 0 40px rgba(212,175,55,0.3)',
            color: '#F3F4F6',
          }}
        >
          Sail the <span style={{ color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.6)' }}>Grand Line.</span>
          <br />Solve every <span style={{ color: '#C0392B', textShadow: '0 0 20px rgba(192,57,43,0.6)' }}>mystery.</span>
          <br />Find the <span style={{ color: '#D4AF37', textShadow: '0 0 30px rgba(212,175,55,0.8)' }}>One Piece.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ color: '#9CA3AF', marginTop: '1.5rem', maxWidth: '600px', fontSize: '1.05rem', lineHeight: 1.7, fontFamily: 'Cabin,sans-serif' }}
        >
          Answer questions from every arc — Romance Dawn to the legendary{" "}
          <strong style={{ color: '#8B00FF' }}>God Valley Incident</strong>.
          Earn bounty, climb pirate ranks, and race your crew to become the next{" "}
          <strong style={{ color: '#D4AF37' }}>King of Pirates</strong>.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          {["5 Epic Arcs", "Pirate Ranks", "Bounty System", "Final Boss: God Valley"].map((pill) => (
            <span key={pill} style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#D4AF37',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: 'Cinzel,serif',
              letterSpacing: '0.05em',
            }}>
              {pill}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap gap-4 mt-10"
        >
          <button
            onClick={handleSignIn}
            className="btn-gold"
            style={{ fontSize: '0.95rem', padding: '0.9rem 2.5rem' }}
            data-testid="landing-signin-cta"
          >
            ⛵ Set Sail Now
          </button>
          <a href="#features" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} /> How It Works
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          style={{ marginTop: '3rem', color: 'rgba(212,175,55,0.4)', fontSize: '1.5rem', textAlign: 'left' }}
        >
          ↓
        </motion.div>

        {/* Features */}
        <div id="features" className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.12 }}
              style={{
                background: 'rgba(10,30,53,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(74,144,217,0.2)',
                borderRadius: '1rem',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
              }}
              className="glass-hover"
            >
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '10px',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <f.icon size={22} color="#D4AF37" />
              </div>
              <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1rem', color: '#F3F4F6', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6, fontFamily: 'Cabin,sans-serif' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Grand Line decoration bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{
            marginTop: '4rem',
            padding: '2rem',
            background: 'rgba(4,13,26,0.8)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '1rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#D4AF37', marginBottom: '0.75rem' }}>
            ☠ THE JOURNEY AHEAD ☠
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: '#6B7280', fontSize: '0.8rem', fontFamily: 'Cabin,sans-serif' }}>
            {["Romance Dawn", "→", "Baratie", "→", "Alabasta", "→", "Marineford", "→", "⚠️ God Valley"].map((item, i) => (
              <span key={i} style={{ color: item.includes("God") ? '#8B00FF' : item === "→" ? '#D4AF37' : '#9CA3AF' }}>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
