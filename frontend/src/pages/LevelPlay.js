import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";

const playTone = (freq = 880, duration = 0.18, type = "sine", gain = 0.08) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch {}
};

export default function LevelPlay() {
  const { num } = useParams();
  const levelNum = parseInt(num, 10);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState("idle"); // idle | wrong | correct | level_done
  const [error, setError] = useState(null);

  const fetchQuestion = async () => {
    setError(null);
    try {
      const r = await api.get(`/levels/${levelNum}/question`);
      setData(r.data);
      setAnswer("");
      setState("idle");
      if (r.data.level_completed) setState("level_done");
    } catch (e) {
      setError(e.response?.data?.detail || "Cannot load level");
    }
  };

  useEffect(() => { fetchQuestion(); /* eslint-disable-next-line */ }, [levelNum]);

  const submit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/levels/${levelNum}/answer`, { answer });
      if (r.data.correct) {
        playTone(740, 0.12, "sine", 0.08);
        setTimeout(() => playTone(988, 0.18, "sine", 0.08), 120);
        setState("correct");
        if (r.data.level_completed) {
          setTimeout(() => setState("level_done"), 1500);
        } else {
          setTimeout(() => fetchQuestion(), 1500);
        }
      } else {
        playTone(180, 0.18, "sawtooth", 0.05);
        setState("wrong");
        toast.error("Try Again", { description: "That's not it. Look closer." });
        setTimeout(() => setState("idle"), 1200);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen relative z-10">
        <NavBar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl text-[#D4AF37]">Forbidden Path</h2>
          <p className="text-gray-400 mt-4">{error}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-ghost mt-6">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen grid place-items-center"><div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">ENTERING…</div></div>;
  }

  if (state === "level_done") {
    return (
      <div className="min-h-screen relative z-10">
        <NavBar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <Sparkles className="text-[#D4AF37] mx-auto" size={48} />
          <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37] mt-6">LEVEL {data.level.number} COMPLETE</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-4">{data.level.title} — Conquered</h2>
          <p className="text-gray-400 mt-4">{data.level.subtitle}</p>
          <div className="mt-8 flex gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="btn-ghost" data-testid="back-dashboard-btn">Back to Map</button>
            {levelNum < 5 && (
              <button onClick={() => navigate(`/level/${levelNum + 1}`)} className="btn-gold" data-testid="next-level-btn">
                Enter Next Chamber →
              </button>
            )}
            {levelNum === 5 && (
              <button onClick={() => navigate("/celebration")} className="btn-gold" data-testid="open-celebration-btn">
                Reveal The Treasure →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = data.question;
  const totalQ = data.total_questions;
  const idx = data.question_index;
  const pct = ((idx) / totalQ) * 100;

  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition" data-testid="back-link">
          <ArrowLeft size={14} /> Back to Map
        </button>

        <div className="mt-6">
          <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]">LEVEL {data.level.number} · RIDDLE {idx + 1} / {totalQ}</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">{data.level.title}</h1>
          <p className="text-gray-400 mt-1 text-sm">{data.level.subtitle}</p>
        </div>

        <div className="mt-5 tt-progress">
          <div className="tt-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <motion.div
          key={q.question_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-7 sm:p-10 mt-8 relative overflow-hidden"
        >
          <span className="font-accent text-[11px] tracking-[0.3em] text-[#D4AF37]/80 uppercase">{q.type.replace("_", " ")}</span>
          <p className="font-display text-2xl sm:text-3xl mt-4 leading-snug" data-testid="question-prompt">{q.prompt}</p>

          {q.image_url && (
            <img src={q.image_url} alt="" className="mt-6 rounded-xl border border-white/10 max-h-72 mx-auto" />
          )}

          <div className="mt-7">
            {q.type === "multiple_choice" && q.options?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setAnswer(opt); }}
                    className={`text-left px-4 py-3.5 rounded-xl border transition-all font-body ${
                      answer === opt
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-white"
                        : "border-white/10 bg-black/30 text-gray-200 hover:border-[#D4AF37]/40"
                    }`}
                    data-testid={`option-${i}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Type your answer…"
                className="tt-input text-lg"
                data-testid="answer-input"
                autoFocus
              />
            )}
          </div>

          <AnimatePresence>
            {state === "correct" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center gap-3 text-emerald-400"
                data-testid="success-msg"
              >
                <CheckCircle2 size={20} /> <span className="font-accent tracking-widest text-sm">CORRECT!</span>
              </motion.div>
            )}
            {state === "wrong" && (
              <motion.div
                initial={{ x: -8 }}
                animate={{ x: [8, -8, 6, -6, 0] }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex items-center gap-3 text-red-400"
                data-testid="wrong-msg"
              >
                <XCircle size={20} /> <span className="font-accent tracking-widest text-sm">TRY AGAIN</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={submit}
              disabled={!answer.trim() || submitting || state === "correct"}
              className="btn-gold"
              data-testid="submit-answer-btn"
            >
              {submitting ? "Checking…" : state === "correct" ? "Unlocking…" : "Submit Answer"}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
