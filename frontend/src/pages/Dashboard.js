import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock, Check, ChevronRight, Award, Flame, Trophy, Shield, Swords, Anchor, Star, Map
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import OceanBackground from "../components/OceanBackground";
import GrandLineMap from "../components/GrandLineMap";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { SoundManager } from "../utils/SoundManager";

// Arc themes for each level
const ARC_THEMES = {
  1: { name: "Romance Dawn", sea: "East Blue", emoji: "⛵", color: "#4A90D9", glow: "rgba(74,144,217,0.3)", desc: "Where dreams of becoming Pirate King begin." },
  2: { name: "Baratie & Arlong Park", sea: "East Blue", emoji: "🐟", color: "#E74C3C", glow: "rgba(231,76,60,0.3)", desc: "The Straw Hats face Arlong's iron grip on the seas." },
  3: { name: "Alabasta", sea: "Grand Line", emoji: "🏜️", color: "#D4AF37", glow: "rgba(212,175,55,0.3)", desc: "Desert sands hide Baroque Works' sinister plot." },
  4: { name: "Marineford", sea: "New World Gate", emoji: "⚔️", color: "#FF4500", glow: "rgba(255,69,0,0.35)", desc: "The war that shook the entire world." },
  5: { name: "God Valley Incident", sea: "Final Challenge", emoji: "☠️", color: "#8B00FF", glow: "rgba(139,0,255,0.5)", desc: "The legendary battle. The forbidden truth. 10 minutes." },
};

const PIRATE_RANKS = [
  { min: 0, label: "Pirate Apprentice", icon: "⚓" },
  { min: 100, label: "Pirate", icon: "🏴‍☠️" },
  { min: 300, label: "Pirate Captain", icon: "⚔️" },
  { min: 600, label: "Warlord of the Sea", icon: "🗡️" },
  { min: 1000, label: "Emperor (Yonko)", icon: "👑" },
  { min: 2000, label: "King of Pirates", icon: "☀️" },
];

function getPirateRank(score = 0) {
  let rank = PIRATE_RANKS[0];
  for (const r of PIRATE_RANKS) {
    if (score >= r.min) rank = r;
  }
  const next = PIRATE_RANKS[PIRATE_RANKS.indexOf(rank) + 1];
  return { rank, next };
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [teamStandings, setTeamStandings] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const load = async () => {
    setError(null);
    try {
      const [pRes, lRes, tRes] = await Promise.all([
        api.get("/progress"),
        api.get("/levels"),
        api.get("/teams/standings").catch(() => null),
      ]);
      setData(pRes.data);
      setLevels(lRes.data?.levels || []);
      if (tRes) setTeamStandings(tRes.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || e.message || "Could not connect to backend server");
    }
  };

  useEffect(() => { load(); }, []);

  const pickTeam = async (team) => {
    try {
      SoundManager.playSuccess();
      await api.post("/me/team", { team });
      toast.success(`⛵ Welcome, ${team === 'red' ? 'Pirate' : 'Marine'}!`);
      await checkAuth();
      await load();
    } catch {
      toast.error("Could not set team");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#040D1A] p-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-4">
          <div className="text-4xl text-amber-500">⚓</div>
          <h2 className="font-accent text-[#D4AF37] text-lg tracking-widest">SERVER UNREACHABLE</h2>
          <p className="text-gray-400 text-sm">{error}</p>
          <button 
            onClick={load}
            className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: '#040D1A' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2.5rem', animation: 'jolly-spin 4s ease-in-out infinite' }}>☠️</div>
          <div style={{ fontFamily: 'Cinzel,serif', color: '#D4AF37', letterSpacing: '0.3em', fontSize: '0.75rem', animation: 'pulse-glow 2s ease-in-out infinite' }}>
            CHARTING THE GRAND LINE…
          </div>
        </div>
      </div>
    );
  }

  const score = data.score || 0;
  const { rank, next } = getPirateRank(score);
  const rankProgress = next ? Math.min(100, ((score - rank.min) / (next.min - rank.min)) * 100) : 100;
  const progressPct = data.total_questions > 0 ? (data.questions_answered / data.total_questions) * 100 : 0;

  const redScore = teamStandings?.red?.score || 0;
  const blueScore = teamStandings?.blue?.score || 0;
  const totalTeamScore = redScore + blueScore;
  const redPct = totalTeamScore > 0 ? Math.round((redScore / totalTeamScore) * 100) : 50;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <OceanBackground showShip={false} />
      <div className="relative z-10 min-h-screen">
        <NavBar />
        {!data.team && <TeamPicker onPick={pickTeam} />}

        <main className="max-w-6xl mx-auto px-5 sm:px-10 py-8">

          {/* ── Hero Header ─────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            {/* WANTED poster banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(139,94,60,0.05))',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '1rem',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Anchor watermark */}
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '6rem', opacity: 0.04 }}>⚓</div>

              <div>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.35em', color: '#D4AF37', opacity: 0.8 }}>
                  ◆ WELCOME BACK, HUNTER ◆
                </p>
                <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F3F4F6', marginTop: '4px' }} data-testid="dashboard-welcome">
                  {data.user.name?.split(" ")[0] || "Pirate"}
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px', fontFamily: 'Cabin,sans-serif' }}>
                  Your log pose is set. The Grand Line awaits.
                </p>
              </div>

              {/* Pirate rank card */}
              <div style={{
                background: 'rgba(4,13,26,0.7)',
                border: `1px solid rgba(${rank.icon === '☀️' ? '212,175,55' : '74,144,217'},0.3)`,
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                minWidth: '160px',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{rank.icon}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#D4AF37', marginBottom: '4px' }}>PIRATE RANK</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '0.75rem', color: '#F3F4F6' }}>{rank.label}</div>
                {next && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', background: 'rgba(74,144,217,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${rankProgress}%`, background: 'linear-gradient(90deg, #D4AF37, #FFE87A)', borderRadius: '2px', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '4px', fontFamily: 'Cabin,sans-serif' }}>
                      {score} / {next.min} → {next.label.split(' ')[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Stats Row ─────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Current Arc" value={`${data.current_level}/${data.total_levels}`} icon="🗺️" sub={ARC_THEMES[data.current_level]?.name || ''} testId="stat-current-level" />
            <StatCard label="Arcs Cleared" value={data.completed_levels.length} icon="✅" sub="islands conquered" testId="stat-levels-completed" />
            <StatCard label="Bounty" value={`${score.toLocaleString()} 💰`} icon="⚡" sub="berry earned" testId="stat-score" />
            <StatCard label="Badges" value={data.badges.length} icon="🏆" sub="achievements" testId="stat-badges" />
          </div>

          {/* ── Team Battle Meter ─────────────────────── */}
          {teamStandings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'rgba(4,13,26,0.7)',
                border: '1px solid rgba(74,144,217,0.2)',
                borderRadius: '1rem',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Swords size={14} /> PIRATES vs MARINES — LIVE BATTLE
                </span>
                <span style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.75rem', color: '#9CA3AF' }}>
                  🏴‍☠️ {redScore} pts vs ⚓ {blueScore} pts
                </span>
              </div>
              <div style={{ height: '12px', background: 'rgba(4,13,26,0.8)', borderRadius: '999px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${redPct}%`, background: 'linear-gradient(90deg, #C0392B, #E74C3C)', transition: 'width 0.8s ease', borderRadius: '999px 0 0 999px' }} />
                <div style={{ flex: 1, background: 'linear-gradient(90deg, #1A4A7A, #4A90D9)', transition: 'all 0.8s ease', borderRadius: '0 999px 999px 0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                <span style={{ color: '#E74C3C' }}>🏴‍☠️ PIRATES {redPct}%</span>
                <span style={{ color: '#4A90D9' }}>MARINES {100 - redPct}% ⚓</span>
              </div>
            </motion.div>
          )}

          {/* ── Grand Line Journey Map ─────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GrandLineMap levels={levels} currentLevel={data.current_level} />
          </motion.div>

          {/* ── Quest Progress Bar ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{
              background: 'rgba(4,13,26,0.7)',
              border: '1px solid rgba(74,144,217,0.15)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              marginTop: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#D4AF37' }}>
                ◆ GRAND LINE JOURNEY
              </span>
              <span style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.8rem', color: '#9CA3AF' }} data-testid="progress-text">
                {data.questions_answered} / {data.total_questions} questions solved
              </span>
            </div>
            <div className="tt-progress" data-testid="progress-bar">
              <div className="tt-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {data.completed_all && (
              <button
                onClick={() => { SoundManager.playSuccess(); navigate("/celebration"); }}
                className="btn-gold mt-5"
                data-testid="open-celebration-btn"
              >
                ☀️ Claim the One Piece →
              </button>
            )}
          </motion.div>

          {/* ── Badges ──────────────────────────────────── */}
          {data.badges.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} style={{ marginTop: '1.5rem' }}>
              <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#D4AF37', marginBottom: '0.75rem' }}>
                EARNED BADGES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {data.badges.map((b) => (
                  <div key={b} style={{
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }} data-testid={`badge-${b}`}>
                    <Award size={13} color="#D4AF37" />
                    <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.1em', color: '#E5E7EB' }}>{b.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Arc Cards Grid ─────────────────────────── */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <Map size={20} color="#D4AF37" />
              <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '1.5rem', color: '#F3F4F6' }}>The Grand Line Arcs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {levels.map((lvl, i) => (
                <ArcCard key={lvl.level_id} lvl={lvl} index={i} theme={ARC_THEMES[lvl.number] || ARC_THEMES[1]} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(7,21,37,0.8)',
        border: '1px solid rgba(74,144,217,0.15)',
        borderRadius: '1rem',
        padding: '1.25rem',
      }}
      data-testid={testId}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#6B7280', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'Cinzel,serif', fontSize: '1.6rem', color: '#F3F4F6', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.7rem', color: '#4B5563', marginTop: '4px' }}>{sub}</div>
    </motion.div>
  );
}

function ArcCard({ lvl, index, theme }) {
  const navigate = useNavigate();
  const locked = !lvl.unlocked;
  const completed = lvl.completed;
  const isFinal = lvl.number === 5;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => {
        if (!locked) { SoundManager.playClick(); navigate(`/level/${lvl.number}`); }
      }}
      disabled={locked}
      data-testid={`level-card-${lvl.number}`}
      style={{
        position: 'relative',
        textAlign: 'left',
        borderRadius: '1rem',
        overflow: 'hidden',
        height: '200px',
        cursor: locked ? 'not-allowed' : 'pointer',
        filter: locked ? 'grayscale(0.7) brightness(0.4)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        border: `2px solid ${completed ? '#10B981' : isFinal ? theme.color : `rgba(${theme.color === '#4A90D9' ? '74,144,217' : '212,175,55'},0.3)`}`,
        background: completed
          ? 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,13,26,0.9))'
          : isFinal
          ? 'linear-gradient(135deg, rgba(139,0,255,0.15), rgba(4,13,26,0.95))'
          : `linear-gradient(135deg, rgba(10,30,53,0.9), rgba(4,13,26,0.95))`,
        boxShadow: completed
          ? '0 0 20px rgba(16,185,129,0.2)'
          : isFinal
          ? `0 0 30px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 8px 32px rgba(0,0,0,0.4)',
      }}
      className={locked ? '' : 'arc-card'}
    >
      {/* Arc color stripe */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${theme.color}, transparent)`,
      }} />

      {/* Background emoji watermark */}
      <div style={{
        position: 'absolute',
        right: '-10px', bottom: '-15px',
        fontSize: '6rem',
        opacity: 0.06,
        pointerEvents: 'none',
      }}>{theme.emoji}</div>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.35em', color: theme.color, marginBottom: '4px' }}>
              {isFinal ? '⚠️ FINAL ARC' : `ARC ${lvl.number} · ${theme.sea}`}
            </div>
            <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1.1rem', color: '#F3F4F6', lineHeight: 1.2, maxWidth: '180px' }}>
              {theme.name}
            </h3>
          </div>
          {completed ? (
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontFamily: 'Cinzel,serif' }}>
              <Check size={14} /> Cleared
            </span>
          ) : locked ? (
            <Lock size={16} color="#6B7280" />
          ) : (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: `${theme.glow}`,
              border: `1px solid ${theme.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
              animation: isFinal ? 'chest-glow 2s ease-in-out infinite' : 'none',
            }}>
              {theme.emoji}
            </div>
          )}
        </div>

        <div>
          <p style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4, marginBottom: '10px' }}>
            {theme.desc}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.7rem', color: '#4B5563' }}>
              {lvl.total_questions} questions
            </span>
            {!locked && (
              <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', color: theme.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {completed ? 'Revisit' : isFinal ? '⚠️ ENTER' : 'Set Sail'} <ChevronRight size={14} />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function TeamPicker({ onPick }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(4,13,26,0.92)', backdropFilter: 'blur(20px)', display: 'grid', placeItems: 'center', padding: '1rem' }}
      data-testid="team-picker"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          background: 'rgba(7,21,37,0.95)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚔️</div>
        <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.35em', color: '#D4AF37', marginBottom: '8px' }}>
          ◆ CHOOSE YOUR ALLEGIANCE ◆
        </p>
        <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '2rem', color: '#F3F4F6', marginBottom: '8px' }}>
          Pirates or Marines?
        </h2>
        <p style={{ fontFamily: 'Cabin,sans-serif', color: '#6B7280', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Your crew's victories count toward your side's standing. Every question conquered builds your faction's dominance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            onClick={() => onPick("red")}
            data-testid="pick-team-red"
            style={{
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              border: '2px solid rgba(192,57,43,0.5)',
              background: 'rgba(192,57,43,0.08)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textAlign: 'left',
            }}
            className="hover:border-red-400 hover:bg-red-500/20"
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏴‍☠️</div>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: '1.2rem', color: '#FCA5A5', marginBottom: '4px' }}>Pirates</p>
            <p style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.7rem', color: 'rgba(252,165,165,0.6)', letterSpacing: '0.1em' }}>STRAW HAT CREW</p>
            <p style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '8px' }}>Live by freedom on the open seas</p>
          </button>
          <button
            onClick={() => onPick("blue")}
            data-testid="pick-team-blue"
            style={{
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              border: '2px solid rgba(74,144,217,0.5)',
              background: 'rgba(74,144,217,0.08)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textAlign: 'left',
            }}
            className="hover:border-blue-300 hover:bg-blue-500/20"
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚓</div>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: '1.2rem', color: '#93C5FD', marginBottom: '4px' }}>Marines</p>
            <p style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.7rem', color: 'rgba(147,197,253,0.6)', letterSpacing: '0.1em' }}>WORLD GOVERNMENT</p>
            <p style={{ fontFamily: 'Cabin,sans-serif', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '8px' }}>Uphold justice across the seas</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
