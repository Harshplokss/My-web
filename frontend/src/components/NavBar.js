import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Anchor, LogOut, Trophy, Volume2, VolumeX, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SoundManager } from "../utils/SoundManager";

const PIRATE_RANKS = [
  { min: 0, label: "Pirate Apprentice", color: "#9CA3AF" },
  { min: 100, label: "Pirate", color: "#60A5FA" },
  { min: 300, label: "Pirate Captain", color: "#34D399" },
  { min: 600, label: "Warlord", color: "#F59E0B" },
  { min: 1000, label: "Yonko", color: "#C0392B" },
  { min: 2000, label: "King of Pirates", color: "#D4AF37" },
];

function getPirateRank(score = 0) {
  let rank = PIRATE_RANKS[0];
  for (const r of PIRATE_RANKS) {
    if (score >= r.min) rank = r;
  }
  return rank;
}

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(SoundManager.getMuted());
  const rank = user ? getPirateRank(user.score || 0) : null;

  const handleToggleMute = () => {
    const newMuted = SoundManager.toggleMute();
    setMuted(newMuted);
    if (!newMuted) SoundManager.playClick();
  };

  return (
    <nav
      className="relative z-20 flex items-center justify-between px-5 sm:px-10 py-4"
      style={{
        background: 'rgba(4,13,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(74,144,217,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => { SoundManager.playClick(); navigate("/dashboard"); }}
        className="flex items-center gap-3 group"
        data-testid="nav-logo"
      >
        <Anchor
          size={20}
          style={{
            color: '#D4AF37',
            filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))',
            transition: 'transform 0.5s ease',
          }}
          className="group-hover:rotate-45"
        />
        <div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#D4AF37', lineHeight: 1 }}>
            GRAND LINE
          </div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.6)', lineHeight: 1.2 }}>
            TREASURE HUNT
          </div>
        </div>
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Sound toggle */}
        <button
          onClick={handleToggleMute}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${muted ? 'rgba(255,255,255,0.1)' : 'rgba(212,175,55,0.4)'}`,
            background: muted ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.1)',
            color: muted ? '#6B7280' : '#D4AF37',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={muted ? "Unmute" : "Mute"}
          data-testid="nav-sound-toggle"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Leaderboard */}
        <Link
          to="/leaderboard"
          onClick={() => SoundManager.playClick()}
          style={{ color: '#9CA3AF', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s', fontFamily: 'Cinzel,serif', letterSpacing: '0.05em', fontSize: '0.7rem' }}
          className="hover:text-yellow-400"
          data-testid="nav-leaderboard"
        >
          <Trophy size={15} />
          <span className="hidden sm:inline">BOUNTY</span>
        </Link>

        {/* Admin */}
        {user?.is_admin && (
          <Link
            to="/admin"
            onClick={() => SoundManager.playClick()}
            style={{ color: '#D4AF37', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Cinzel,serif', letterSpacing: '0.05em' }}
            data-testid="nav-admin"
          >
            <Crown size={15} />
            <span className="hidden sm:inline">ADMIN</span>
          </Link>
        )}

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            {user.picture && (
              <div style={{ position: 'relative' }}>
                <img
                  src={user.picture}
                  alt=""
                  style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%',
                    border: `2px solid ${rank?.color || '#D4AF37'}`,
                    boxShadow: `0 0 10px ${rank?.color || '#D4AF37'}40`,
                  }}
                />
              </div>
            )}
            <div className="hidden md:block">
              <div style={{ fontSize: '0.8rem', color: '#E5E7EB', fontFamily: 'Cabin,sans-serif', lineHeight: 1 }} data-testid="nav-user-name">
                {user.name?.split(' ')[0]}
              </div>
              {rank && (
                <div style={{ fontSize: '0.6rem', fontFamily: 'Cinzel,serif', letterSpacing: '0.08em', color: rank.color, lineHeight: 1.4 }}>
                  {rank.label.toUpperCase()}
                </div>
              )}
            </div>
            {user.team && (
              <span
                data-testid="nav-team-badge"
                style={{
                  fontFamily: 'Cinzel,serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.2em',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${user.team === 'red' ? 'rgba(239,68,68,0.5)' : 'rgba(96,165,250,0.5)'}`,
                  color: user.team === 'red' ? '#FCA5A5' : '#93C5FD',
                  background: user.team === 'red' ? 'rgba(239,68,68,0.1)' : 'rgba(96,165,250,0.1)',
                }}
              >
                {user.team === 'red' ? '🏴‍☠️ PIRATE' : '⚓ MARINE'}
              </span>
            )}
            <button
              onClick={() => { SoundManager.playClick(); logout(); }}
              style={{ color: '#6B7280', cursor: 'pointer', transition: 'color 0.2s', background: 'none', border: 'none', padding: '4px' }}
              className="hover:text-red-400"
              title="Sign out"
              data-testid="nav-logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
