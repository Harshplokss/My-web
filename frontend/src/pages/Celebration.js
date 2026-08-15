import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Download, Trophy, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import NavBar from "../components/NavBar";
import { api } from "../lib/api";

const FIREWORK_COLORS = ["#D4AF37", "#FDE047", "#B87333", "#FFD580", "#FFFFFF"];

function playApplauseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 3;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // pink-ish noise with envelope to simulate applause
      const env = Math.min(1, i / (ctx.sampleRate * 0.3)) * (1 - i / bufferSize);
      data[i] = (Math.random() * 2 - 1) * env * 0.35;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    src.connect(filter);
    filter.connect(ctx.destination);
    src.start();
    setTimeout(() => ctx.close(), duration * 1000 + 200);
  } catch {}
}

export default function Celebration() {
  const [data, setData] = useState(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const certRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/final").then((r) => {
      setData(r.data);
      setTimeout(() => playApplauseSound(), 400);
    }).catch(() => navigate("/dashboard"));
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [navigate]);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { backgroundColor: "#0F0B05", scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`treasure-hunt-certificate-${data?.user_name?.replace(/\s+/g, "_") || "winner"}.pdf`);
  };

  if (!data) {
    return <div className="min-h-screen grid place-items-center"><div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">UNVEILING…</div></div>;
  }

  return (
    <div className="relative z-10 min-h-screen overflow-hidden">
      <Confetti
        width={size.w}
        height={size.h}
        numberOfPieces={350}
        colors={FIREWORK_COLORS}
        recycle={false}
        gravity={0.15}
      />
      <Fireworks />
      <NavBar />

      <main className="max-w-4xl mx-auto px-6 py-10 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-accent text-xs tracking-[0.4em] text-[#D4AF37]"
        >
          ◆ THE TREASURE IS YOURS ◆
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl mt-4"
          data-testid="celebration-title"
        >
          Congratulations, <span className="text-[#D4AF37]">{data.user_name?.split(" ")[0]}!</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 mt-5 text-lg max-w-2xl mx-auto"
        >
          You completed all five chambers of the hunt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10"
        >
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80">FINAL ANSWER</p>
            <p className="font-display text-4xl sm:text-5xl mt-2 text-[#FDE047]" data-testid="final-answer">{data.final_answer}</p>
            <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80 mt-6">SECRET MESSAGE</p>
            <p className="font-body text-gray-200 mt-2 leading-relaxed italic" data-testid="secret-message">"{data.secret_message}"</p>
          </div>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="mt-14"
        >
          <div ref={certRef} className="certificate rounded-2xl px-10 py-14 max-w-3xl mx-auto text-center">
            <Trophy className="text-[#D4AF37] mx-auto" size={40} />
            <p className="font-accent text-xs tracking-[0.45em] text-[#D4AF37] mt-5">CERTIFICATE OF COMPLETION</p>
            <p className="font-display text-2xl mt-8 text-gray-300">This is to certify that</p>
            <p className="font-display text-5xl mt-4 text-white" data-testid="cert-name">{data.user_name}</p>
            <div className="h-px bg-[#D4AF37]/40 my-6 mx-auto w-1/2" />
            <p className="font-body text-gray-300 max-w-xl mx-auto leading-relaxed">
              has triumphed through every chamber of the Treasure Hunt,
              decoded every riddle, and uncovered the secret hidden within.
            </p>
            <div className="mt-8 flex items-center justify-around text-sm text-gray-400">
              <div>
                <p className="font-accent text-[10px] tracking-[0.35em] text-[#D4AF37]/80">FINAL SCORE</p>
                <p className="font-display text-2xl text-white mt-1">{data.score}</p>
              </div>
              <div>
                <p className="font-accent text-[10px] tracking-[0.35em] text-[#D4AF37]/80">COMPLETED</p>
                <p className="font-display text-base text-white mt-1">
                  {data.completed_at ? new Date(data.completed_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </p>
              </div>
            </div>
            <p className="font-accent text-[11px] tracking-[0.35em] text-[#D4AF37] mt-10">— TREASURE HUNT GUILD —</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={() => navigate("/dashboard")} className="btn-ghost flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={downloadPDF} className="btn-gold flex items-center gap-2" data-testid="download-certificate-btn">
              <Download size={16} /> Download Certificate (PDF)
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Fireworks() {
  const bursts = Array.from({ length: 6 });
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {bursts.map((_, i) => {
        const left = 10 + Math.random() * 80;
        const top = 10 + Math.random() * 50;
        const delay = i * 0.6;
        return (
          <div key={i} style={{ position: "absolute", left: `${left}%`, top: `${top}%` }}>
            {Array.from({ length: 18 }).map((_, j) => {
              const angle = (j / 18) * Math.PI * 2;
              const dist = 80 + Math.random() * 40;
              return (
                <span
                  key={j}
                  className="firework"
                  style={{
                    background: FIREWORK_COLORS[j % FIREWORK_COLORS.length],
                    boxShadow: `0 0 8px ${FIREWORK_COLORS[j % FIREWORK_COLORS.length]}`,
                    "--tx": `${Math.cos(angle) * dist}px`,
                    "--ty": `${Math.sin(angle) * dist}px`,
                    animation: `burst 1.4s ease-out ${delay}s infinite`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
