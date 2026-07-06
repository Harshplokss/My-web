import React from "react";
import { motion } from "framer-motion";
import { Compass, KeySquare, Sparkles, ShieldCheck } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1544039161-b0c20826c6f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxtaXN0eSUyMGRhcmslMjBmb3Jlc3R8ZW58MHx8fHwxNzgyNTY2NzExfDA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const handleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 -z-10">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/70 via-[#0A0C10]/85 to-[#0A0C10]" />
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass size={22} className="text-[#D4AF37]" />
          <span className="font-accent text-sm tracking-[0.35em] text-[#D4AF37]">TREASURE HUNT</span>
        </div>
        <button onClick={handleSignIn} className="btn-ghost hidden sm:inline-flex" data-testid="landing-signin-top">
          Sign In
        </button>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-accent text-xs sm:text-sm tracking-[0.4em] text-[#D4AF37]/80 mb-6"
        >
          ◆ A CINEMATIC RIDDLE ADVENTURE ◆
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.05] max-w-3xl text-white"
        >
          Five trials. <br />
          One <em className="text-[#D4AF37] not-italic">treasure</em> waiting at the end.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-8 max-w-xl text-gray-300 text-base sm:text-lg leading-relaxed"
        >
          Step through misty woods, hidden caves, and a forgotten temple. Solve every riddle, earn ancient badges,
          and unlock the final chamber where your certificate awaits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <button onClick={handleSignIn} className="btn-gold text-base px-7 py-3.5" data-testid="landing-signin-cta">
            Begin the Hunt →
          </button>
          <a href="#features" className="btn-ghost">How it works</a>
        </motion.div>

        {/* Feature grid */}
        <div id="features" className="mt-28 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: KeySquare, title: "Gated Levels", desc: "Conquer one chamber to unlock the next. No shortcuts." },
            { icon: Sparkles, title: "Riddles & Puzzles", desc: "Multiple choice, text, image, and ancient riddles." },
            { icon: ShieldCheck, title: "Anti-Cheat", desc: "Backend-enforced gating. Answers never leak." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <f.icon size={22} className="text-[#D4AF37]" />
              <h3 className="font-display text-2xl mt-3">{f.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
