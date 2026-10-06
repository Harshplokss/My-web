import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, HelpCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";
import { SoundManager } from "../utils/SoundManager";

export default function LevelPlay() {
  const { num, id } = useParams();
  const levelNum = parseInt(num || id, 10);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState("idle"); // idle | wrong | correct | level_done
  const [error, setError] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [unlockedHintText, setUnlockedHintText] = useState(null);

  const fetchQuestion = async () => {
    setError(null);
    setShowHint(false);
    setUnlockedHintText(null);
    try {
      const r = await api.get(`/levels/${levelNum}/question`);
      setData(r.data);
      setAnswer("");
      setState("idle");
      if (r.data.question?.hint_unlocked && r.data.question?.hint) {
        setUnlockedHintText(r.data.question.hint);
      }
      if (r.data.level_completed) setState("level_done");
    } catch (e) {
      setError(e.response?.data?.detail || "Cannot load level");
    }
  };

  const unlockHint = async () => {
    SoundManager.playHint();
    if (data?.question?.hint_unlocked || data?.question?.hint || unlockedHintText) {
      setUnlockedHintText(data?.question?.hint || unlockedHintText || "Look for double meanings in the prompt.");
      setShowHint(true);
      return;
    }
    try {
      const r = await api.post(`/levels/${levelNum}/hint`);
      setUnlockedHintText(r.data.hint);
      setShowHint(true);
      if (r.data.unlocked) {
        toast.info("⚓ Hint Unlocked!", { description: `Deducted ${r.data.cost} Berry score` });
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not unlock hint");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchQuestion(); }, [levelNum]);

  const submit = async (overrideAnswer) => {
    const submitVal = (typeof overrideAnswer === "string" ? overrideAnswer : answer).trim();
    if (!submitVal || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/levels/${levelNum}/answer`, { answer: submitVal });
      if (r.data.correct) {
        SoundManager.playSuccess();
        setState("correct");
        if (r.data.level_completed) {
          setTimeout(() => setState("level_done"), 1500);
        } else {
          setTimeout(() => fetchQuestion(), 1500);
        }
      } else {
        SoundManager.playFail();
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
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">ENTERING…</div>
      </div>
    );
  }

  if (state === "level_done") {
    return (
      <div className="min-h-screen relative z-10">
        <NavBar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <Sparkles className="text-[#D4AF37] mx-auto animate-pulse" size={48} />
          <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37] mt-6">LEVEL {data.level.number} COMPLETE</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-4">Chamber Sealed</h2>
          <p className="text-gray-400 mt-4">Every question conquered. The next gate opens for you.</p>
          <div className="mt-8 flex gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="btn-ghost" data-testid="back-dashboard-btn">Back to Map</button>
            {levelNum < 5 && (
              <button
                onClick={() => {
                  SoundManager.playClick();
                  navigate(`/level/${levelNum + 1}`);
                }}
                className="btn-gold"
                data-testid="next-level-btn"
              >
                Enter Next Chamber →
              </button>
            )}
            {levelNum === 5 && (
              <button
                onClick={() => {
                  SoundManager.playSuccess();
                  navigate("/celebration");
                }}
                className="btn-gold"
                data-testid="open-celebration-btn"
              >
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
  const isMultipleChoice = q.type === "multiple_choice" && Array.isArray(q.options) && q.options.length > 0;

  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => {
            SoundManager.playClick();
            navigate("/dashboard");
          }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition"
          data-testid="back-link"
        >
          <ArrowLeft size={14} /> Back to Map
        </button>

        <div className="mt-6">
          <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]">LEVEL {data.level.number} · QUESTION {idx + 1} / {totalQ}</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">{data.level.title || `Level ${data.level.number}`}</h1>
        </div>

        <div className="mt-5 tt-progress">
          <div className="tt-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <motion.div
          key={q.question_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-7 sm:p-10 mt-8 relative overflow-hidden text-center border border-white/10"
        >
          <span className="font-accent text-[11px] tracking-[0.3em] text-[#D4AF37]/80 uppercase">
            {q.type ? `${q.type.replace('_', ' ')} Challenge` : "Riddle Challenge"}
          </span>

          {/* Question Image if present */}
          {q.image_url && (
            <div className="mt-4 mb-2 max-w-md mx-auto rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img
                src={q.image_url}
                alt="Question visual"
                className="w-full h-auto max-h-64 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <p className="font-display text-2xl sm:text-3xl mt-4 leading-snug" data-testid="question-prompt">
            {q.prompt || `Question ${idx + 1}`}
          </p>
          <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
            {isMultipleChoice
              ? "Select the correct option below."
              : q.prompt
              ? "Solve the riddle above and submit your canonical answer below."
              : "Refer to the riddle you were given. Enter your answer below."}
          </p>

          {/* Hint / Clue Reveal Button & Drawer */}
          <div className="mt-4">
            {!showHint ? (
              <button
                onClick={unlockHint}
                className="inline-flex items-center gap-2 text-xs font-accent tracking-widest text-[#D4AF37]/80 hover:text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full transition"
                data-testid="reveal-hint-btn"
              >
                <Eye size={14} /> {q.hint_unlocked ? "SHOW UNLOCKED HINT" : "UNLOCK HINT (-2 BERRY)"}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 max-w-md mx-auto text-left flex items-start gap-3"
                data-testid="hint-box"
              >
                <HelpCircle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <span className="font-accent text-[#D4AF37] tracking-wider block mb-1">CLUE ADVICE:</span>
                  {unlockedHintText || q.hint || "Look for double meanings in the numbers and key words of the prompt."}
                </div>
              </motion.div>
            )}
          </div>

          {/* Multiple Choice Options or Text Input */}
          {isMultipleChoice ? (
            <div className="mt-7 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="options-grid">
              {q.options.map((opt, i) => {
                const isSelected = answer.trim().toLowerCase() === opt.trim().toLowerCase();
                return (
                  <button
                    key={i}
                    onClick={() => {
                      SoundManager.playClick();
                      setAnswer(opt);
                    }}
                    className={`p-3.5 rounded-xl border text-sm font-medium transition text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30"
                    }`}
                    data-testid={`option-btn-${i}`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 max-w-md mx-auto">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Type your answer…"
                className="tt-input text-lg text-center"
                data-testid="answer-input"
                autoFocus
              />
            </div>
          )}

          <AnimatePresence>
            {state === "correct" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center justify-center gap-3 text-emerald-400"
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
                className="mt-6 flex items-center justify-center gap-3 text-red-400"
                data-testid="wrong-msg"
              >
                <XCircle size={20} /> <span className="font-accent tracking-widest text-sm">TRY AGAIN</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => submit()}
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
