import React, { useMemo } from "react";

// SVG wave shape for ocean layers
const WaveSVG = ({ color = "#0A1E35", opacity = 0.8 }) => (
  <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path
      d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1380,30 1440,60 L1440,120 L0,120 Z"
      fill={color}
      fillOpacity={opacity}
    />
  </svg>
);

const CloudSVG = ({ size = 80, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" className={className}>
    <ellipse cx="50" cy="40" rx="45" ry="22" fill="white" fillOpacity="0.12" />
    <ellipse cx="30" cy="34" rx="28" ry="18" fill="white" fillOpacity="0.1" />
    <ellipse cx="70" cy="36" rx="25" ry="16" fill="white" fillOpacity="0.1" />
    <ellipse cx="50" cy="24" rx="20" ry="16" fill="white" fillOpacity="0.15" />
  </svg>
);

// Pirate ship SVG silhouette
const ShipSVG = ({ size = 120 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hull */}
    <path d="M20,90 Q40,85 100,85 Q160,85 180,90 L170,115 Q100,120 30,115 Z" fill="#4A2010" stroke="#6B3A2A" strokeWidth="2"/>
    <path d="M20,90 L30,115 Q100,120 170,115 L180,90" fill="none" stroke="#8B5E3C" strokeWidth="1.5"/>
    {/* Waterline */}
    <path d="M15,110 Q100,105 185,110" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6"/>
    {/* Mast 1 */}
    <line x1="80" y1="15" x2="80" y2="90" stroke="#5C3A1E" strokeWidth="4"/>
    {/* Mast 2 */}
    <line x1="120" y1="25" x2="120" y2="90" stroke="#5C3A1E" strokeWidth="3.5"/>
    {/* Sail 1 - Main */}
    <path d="M80,20 Q110,30 110,60 Q95,62 80,60 Z" fill="#F5E6C8" opacity="0.9" stroke="#C4A46B" strokeWidth="1"/>
    {/* Sail 2 */}
    <path d="M120,30 Q145,38 145,65 Q135,67 120,65 Z" fill="#F5E6C8" opacity="0.85" stroke="#C4A46B" strokeWidth="1"/>
    {/* Jolly Roger on top sail */}
    <circle cx="80" cy="15" r="6" fill="#1A1A1A" stroke="#D4AF37" strokeWidth="1"/>
    <text x="77" y="19" fontSize="7" fill="white">☠</text>
    {/* Flag */}
    <path d="M120,25 L135,29 L120,33 Z" fill="#C0392B"/>
    {/* Ropes */}
    <line x1="80" y1="20" x2="120" y2="30" stroke="#8B5E3C" strokeWidth="1" opacity="0.6"/>
    {/* Porthole */}
    <circle cx="60" cy="100" r="7" fill="#0A1E35" stroke="#8B5E3C" strokeWidth="2"/>
    <circle cx="100" cy="100" r="7" fill="#0A1E35" stroke="#8B5E3C" strokeWidth="2"/>
    <circle cx="140" cy="100" r="7" fill="#0A1E35" stroke="#8B5E3C" strokeWidth="2"/>
    {/* Waves at waterline */}
    <path d="M0,125 C20,120 40,130 60,125 C80,120 100,130 120,125 C140,120 160,130 180,125 C190,122 195,123 200,125" stroke="#4A90D9" strokeWidth="2" fill="none" opacity="0.5"/>
    <path d="M0,130 C25,125 50,135 75,130 C100,125 125,135 150,130 C175,125 190,132 200,130" stroke="#4A90D9" strokeWidth="1.5" fill="none" opacity="0.3"/>
  </svg>
);

// Stars in sky
const Stars = () => {
  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 45}%`,
    size: Math.random() > 0.8 ? 2 : 1,
    opacity: 0.3 + Math.random() * 0.7,
    delay: Math.random() * 3,
    id: i,
  })), []);

  return (
    <>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.size > 1.5 ? 'rgba(245,208,92,0.8)' : 'rgba(255,255,255,0.7)',
            opacity: s.opacity,
            animation: `pulse-glow ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
};

// Animated clouds
const Clouds = () => {
  const clouds = useMemo(() => [
    { top: '8%', size: 120, speed: '35s', delay: '0s' },
    { top: '14%', size: 80, speed: '50s', delay: '10s' },
    { top: '5%', size: 160, speed: '45s', delay: '22s' },
    { top: '20%', size: 100, speed: '60s', delay: '5s' },
  ], []);

  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: c.top,
            left: '-200px',
            animation: `cloud-drift ${c.speed} linear ${c.delay} infinite`,
            pointerEvents: 'none',
          }}
        >
          <CloudSVG size={c.size} />
        </div>
      ))}
    </>
  );
};

export default function OceanBackground({ showShip = true, variant = "night" }) {
  return (
    <div className="ocean-bg" aria-hidden="true">
      {/* Stars */}
      <div className="ocean-stars" />
      <Stars />

      {/* Moon */}
      <div className="ocean-moon" />

      {/* Clouds */}
      <Clouds />

      {/* Fog layer */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(transparent, rgba(74,144,217,0.05))',
        animation: 'fog-drift 8s ease-in-out infinite',
      }} />

      {/* Pirate ship */}
      {showShip && (
        <div className="pirate-ship" style={{ left: '15%' }}>
          <ShipSVG size={160} />
        </div>
      )}

      {/* Wave layers */}
      <div className="wave-layer wave-layer-1">
        <WaveSVG color="#0D2847" opacity={0.7} />
      </div>
      <div className="wave-layer wave-layer-2">
        <WaveSVG color="#0A1E35" opacity={0.5} />
      </div>
      <div className="wave-layer wave-layer-3">
        <WaveSVG color="#071525" opacity={0.4} />
      </div>

      {/* Deep water gradient at very bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(transparent, rgba(4,13,26,0.95))',
      }} />
    </div>
  );
}
