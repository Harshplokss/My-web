import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Shield } from "lucide-react";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";

const ranks = [Trophy, Medal, Award];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    api.get("/leaderboard").then((r) => setRows(r.data.rows)).catch(() => {});
    api.get("/teams/standings").then((r) => setTeams(r.data)).catch(() => {});
  }, []);

  const winner = teams && (teams.red.score === teams.blue.score
    ? null
    : teams.red.score > teams.blue.score ? "red" : "blue");

  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80">◆ HALL OF HUNTERS</p>
        <h1 className="font-display text-5xl mt-2">Leaderboard</h1>
        <p className="text-gray-400 mt-3">Ranked by levels cleared, then by score.</p>

        {/* Team standings */}
        {teams && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10" data-testid="team-standings">
            <TeamCard
              team="red"
              label="Flamekeepers"
              data={teams.red}
              winning={winner === "red"}
              testId="team-card-red"
            />
            <TeamCard
              team="blue"
              label="Tidewalkers"
              data={teams.blue}
              winning={winner === "blue"}
              testId="team-card-blue"
            />
          </div>
        )}

        <h2 className="font-display text-2xl mt-12 mb-4">Top Hunters</h2>
        <div className="space-y-3">
          {rows.length === 0 && <p className="text-gray-500 text-center mt-12">No hunters yet. Be the first.</p>}
          {rows.map((row, i) => {
            const Rank = i < 3 ? ranks[i] : null;
            const teamStyle = row.team === "red"
              ? "border-red-500/40"
              : row.team === "blue"
              ? "border-blue-400/40"
              : "border-transparent";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-5 flex items-center gap-4 border-l-4 ${teamStyle} ${i === 0 ? "gold-ring" : ""}`}
                data-testid={`leaderboard-row-${i}`}
              >
                <div className="w-10 text-center font-display text-2xl text-[#D4AF37]">{i + 1}</div>
                {row.picture ? (
                  <img src={row.picture} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-body font-medium">{row.name}</p>
                    {row.team && (
                      <span
                        className={`font-accent text-[9px] tracking-[0.25em] px-2 py-0.5 rounded-full ${
                          row.team === "red" ? "text-red-300 bg-red-500/15" : "text-blue-200 bg-blue-500/15"
                        }`}
                      >
                        {row.team.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{row.levels_completed} levels cleared</p>
                </div>
                {Rank && <Rank size={20} className="text-[#D4AF37]" />}
                <div className="font-display text-2xl text-white tabular-nums">{row.score}</div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function TeamCard({ team, label, data, winning, testId }) {
  const isRed = team === "red";
  const accent = isRed ? "text-red-300" : "text-blue-200";
  const border = isRed ? "border-red-500/40" : "border-blue-400/40";
  const bg = isRed ? "bg-red-500/5" : "bg-blue-500/5";
  return (
    <div
      data-testid={testId}
      className={`rounded-2xl p-6 border ${border} ${bg} ${winning ? "ring-2 ring-[#D4AF37]/40 gold-ring" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className={accent} />
          <span className={`font-accent text-xs tracking-[0.3em] ${accent}`}>TEAM {team.toUpperCase()}</span>
        </div>
        {winning && <span className="font-accent text-[10px] tracking-widest text-[#D4AF37]">LEADING</span>}
      </div>
      <p className="font-display text-3xl mt-2 text-white">{label}</p>
      <div className="grid grid-cols-3 gap-3 mt-5 text-center">
        <div>
          <p className="font-display text-2xl text-white">{data.score}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Score</p>
        </div>
        <div>
          <p className="font-display text-2xl text-white">{data.levels}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Levels</p>
        </div>
        <div>
          <p className="font-display text-2xl text-white">{data.members}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Hunters</p>
        </div>
      </div>
    </div>
  );
}
