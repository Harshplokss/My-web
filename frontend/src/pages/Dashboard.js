import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, ChevronRight, Award, Flame, Trophy, Shield } from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const LEVEL_BG = {
  1: "https://images.pexels.com/photos/11336947/pexels-photo-11336947.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  2: "https://images.pexels.com/photos/11336947/pexels-photo-11336947.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  3: "https://images.unsplash.com/photo-1513733582371-0adb4dac50f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdGVtcGxlJTIwcnVpbnN8ZW58MHx8fHwxNzgyNTY2NzExfDA&ixlib=rb-4.1.0&q=85",
  4: "https://images.unsplash.com/photo-1600023062179-6c6b954698cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwzfHxhbmNpZW50JTIwdGVtcGxlJTIwcnVpbnN8ZW58MHx8fHwxNzgyNTY2NzExfDA&ixlib=rb-4.1.0&q=85",
  5: "https://images.pexels.com/photos/366791/pexels-photo-366791.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

const BADGE_LABEL = {
  first_clue: "First Clue",
  wanderer: "Wanderer",
  spelunker: "Spelunker",
  temple_seeker: "Temple Seeker",
  treasure_master: "Treasure Master",
  legend: "Legend",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const load = async () => {
    const [pRes, lRes] = await Promise.all([api.get("/progress"), api.get("/levels")]);
    setData(pRes.data);
    setLevels(lRes.data.levels);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const pickTeam = async (team) => {
    try {
      await api.post("/me/team", { team });
      toast.success(`Welcome to Team ${team.toUpperCase()}!`);
      await checkAuth();
      await load();
    } catch {
      toast.error("Could not set team");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">PREPARING THE MAP…</div>
      </div>
    );
  }

  const progressPct = data.total_questions > 0 ? (data.questions_answered / data.total_questions) * 100 : 0;

  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      {!data.team && <TeamPicker onPick={pickTeam} />}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80">◆ WELCOME BACK, HUNTER</p>
            {data.team && (
              <span
                data-testid="team-badge"
                className={`font-accent text-[10px] tracking-[0.3em] px-3 py-1 rounded-full border ${
                  data.team === "red"
                    ? "border-red-500/50 text-red-300 bg-red-500/10"
                    : "border-blue-400/50 text-blue-300 bg-blue-500/10"
                }`}
              >
                TEAM {data.team.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-2" data-testid="dashboard-welcome">
            {data.user.name?.split(" ")[0] || "Adventurer"}
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            Your map is etched. Press onward — the chambers reveal themselves only to those who solve what came before.
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <StatCard label="Current Level" value={`${data.current_level}/${data.total_levels}`} icon={Flame} testId="stat-current-level" />
          <StatCard label="Levels Completed" value={data.completed_levels.length} icon={Check} testId="stat-levels-completed" />
          <StatCard label="Total Score" value={data.score} icon={Trophy} testId="stat-score" />
          <StatCard label="Badges" value={data.badges.length} icon={Award} testId="stat-badges" />
        </div>

        {/* Progress Bar */}
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-accent text-xs tracking-[0.3em] text-[#D4AF37]/80">QUEST PROGRESS</span>
            <span className="text-sm text-gray-300" data-testid="progress-text">
              {data.questions_answered} / {data.total_questions} riddles solved
            </span>
          </div>
          <div className="tt-progress" data-testid="progress-bar">
            <div className="tt-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {data.completed_all && (
            <button
              onClick={() => navigate("/celebration")}
              className="btn-gold mt-5"
              data-testid="open-celebration-btn"
            >
              View Your Triumph →
            </button>
          )}
        </div>

        {/* Badges */}
        {data.badges.length > 0 && (
          <div className="mt-8">
            <p className="font-accent text-xs tracking-[0.3em] text-[#D4AF37]/80 mb-4">EARNED BADGES</p>
            <div className="flex flex-wrap gap-3">
              {data.badges.map((b) => (
                <div key={b} className="glass rounded-xl px-4 py-2.5 flex items-center gap-2" data-testid={`badge-${b}`}>
                  <Award size={16} className="text-[#D4AF37]" />
                  <span className="text-sm font-accent tracking-wider">{BADGE_LABEL[b] || b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Levels Grid */}
        <h2 className="font-display text-3xl sm:text-4xl mt-14">The Chambers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {levels.map((lvl, i) => (
            <LevelCard key={lvl.level_id} lvl={lvl} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, testId }) {
  return (
    <div className="glass rounded-2xl p-5" data-testid={testId}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</span>
        <Icon size={16} className="text-[#D4AF37]" />
      </div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}

function LevelCard({ lvl, index }) {
  const navigate = useNavigate();
  const locked = !lvl.unlocked;
  const completed = lvl.completed;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.5 }}
      onClick={() => !locked && navigate(`/level/${lvl.number}`)}
      disabled={locked}
      data-testid={`level-card-${lvl.number}`}
      className={`relative text-left glass rounded-2xl overflow-hidden h-72 group ${
        locked ? "locked-card" : "glass-hover hover:scale-[1.02] transition-transform"
      }`}
    >
      <div className="absolute inset-0">
        <img src={LEVEL_BG[lvl.number]} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/70 to-transparent" />
      </div>
      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="font-accent text-[11px] tracking-[0.35em] text-[#D4AF37]">LEVEL 0{lvl.number}</span>
          {completed ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <Check size={14} /> Completed
            </span>
          ) : locked ? (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Lock size={14} /> Locked
            </span>
          ) : (
            <span className="text-xs text-[#D4AF37]">Unlocked</span>
          )}
        </div>
        <div>
          <h3 className="font-display text-3xl sm:text-4xl">Level {lvl.number}</h3>
          <div className="mt-4 space-y-2">
            {Array.from({ length: lvl.total_questions }).map((_, qi) => (
              <div key={qi} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
                Question {qi + 1}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-5">
            <span className="text-xs text-gray-500">{lvl.total_questions} questions</span>
            {!locked && (
              <span className="flex items-center gap-1 text-sm text-[#D4AF37] font-medium">
                Enter <ChevronRight size={16} />
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg grid place-items-center p-4" data-testid="team-picker">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-2xl w-full text-center"
      >
        <Shield className="text-[#D4AF37] mx-auto" size={36} />
        <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80 mt-4">◆ CHOOSE YOUR ALLEGIANCE ◆</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-3">Pick a Team</h2>
        <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
          Every score and every chamber cleared adds to your team&apos;s standing. Choose wisely, hunter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => onPick("red")}
            data-testid="pick-team-red"
            className="rounded-2xl p-6 border-2 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400 transition-all text-left group"
          >
            <Shield className="text-red-400 group-hover:scale-110 transition-transform" size={28} />
            <p className="font-display text-3xl mt-3 text-red-300">Team Red</p>
            <p className="text-xs text-red-200/70 mt-2 font-accent tracking-widest">FLAMEKEEPERS</p>
          </button>
          <button
            onClick={() => onPick("blue")}
            data-testid="pick-team-blue"
            className="rounded-2xl p-6 border-2 border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-300 transition-all text-left group"
          >
            <Shield className="text-blue-300 group-hover:scale-110 transition-transform" size={28} />
            <p className="font-display text-3xl mt-3 text-blue-200">Team Blue</p>
            <p className="text-xs text-blue-200/70 mt-2 font-accent tracking-widest">TIDEWALKERS</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

