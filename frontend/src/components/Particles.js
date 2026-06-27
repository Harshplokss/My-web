import React, { useMemo } from "react";

export default function Particles({ count = 40 }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 18 + Math.random() * 20,
        delay: -Math.random() * 30,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    [count]
  );
  return (
    <div className="particles" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote"
          style={{
            left: `${m.left}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            opacity: m.opacity,
          }}
        />
      ))}
    </div>
  );
}
