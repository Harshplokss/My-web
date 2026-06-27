import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";

const ranks = [Trophy, Medal, Award];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/leaderboard").then((r) => setRows(r.data.rows)).catch(() => {});
  }, []);
  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80">◆ HALL OF HUNTERS</p>
        <h1 className="font-display text-5xl mt-2">Leaderboard</h1>
        <p className="text-gray-400 mt-3">Ranked by levels cleared, then by score.</p>

        <div className="mt-10 space-y-3">
          {rows.length === 0 && <p className="text-gray-500 text-center mt-12">No hunters yet. Be the first.</p>}
          {rows.map((row, i) => {
            const Rank = i < 3 ? ranks[i] : null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-5 flex items-center gap-4 ${i === 0 ? "gold-ring" : ""}`}
                data-testid={`leaderboard-row-${i}`}
              >
                <div className="w-10 text-center font-display text-2xl text-[#D4AF37]">{i + 1}</div>
                {row.picture ? (
                  <img src={row.picture} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                )}
                <div className="flex-1">
                  <p className="font-body font-medium">{row.name}</p>
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
