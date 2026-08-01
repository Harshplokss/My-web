import React from "react";
import { motion } from "framer-motion";

import ocean from "../../assets/images/hero/ocean.png";
import luffy from "../../assets/images/hero/hero-luffy.png";
import sunny from "../../assets/images/hero/thousand-sunny.png";

export default function Hero({ handleSignIn }) {
  return (
    <section className="relative h-screen overflow-hidden">

      {/* Ocean Background */}
      <motion.img
        src={ocean}
        alt="Ocean"
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#06111f]" />

      {/* Golden Glow */}
      <div className="absolute right-32 top-40 w-[650px] h-[650px] rounded-full bg-yellow-400/20 blur-[120px]" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex items-center justify-between px-8 pt-24">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="max-w-xl"
        >
          <p className="text-yellow-400 tracking-[0.45em] mb-5 uppercase">
            Journey to Laugh Tale
          </p>

          <h1 className="text-6xl lg:text-8xl font-black text-white leading-none">
            SET SAIL
            <br />
            FOR THE
            <span className="block text-yellow-400">
              ONE PIECE
            </span>
          </h1>

          <p className="mt-8 text-lg text-gray-300 leading-8">
            Explore every arc.
            <br />
            Challenge legendary pirates.
            <br />
            Discover hidden mysteries.
            <br />
            Become the Pirate King.
          </p>

          <div className="flex gap-5 mt-10">

            <button
              onClick={handleSignIn}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold transition"
            >
              Begin Journey
            </button>

            <button
              className="border border-white px-8 py-4 rounded-xl hover:bg-white hover:text-black transition"
            >
              Continue
            </button>

          </div>

        </motion.div>

        {/* Luffy */}
        <motion.img
          src={luffy}
          alt="Gear 5 Luffy"
          className="w-[520px] relative z-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -2, 2, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 6
          }}
        />

      </div>

      {/* Thousand Sunny */}
      <motion.img
        src={sunny}
        alt="Thousand Sunny"
        className="absolute bottom-8 left-[-280px] w-72 z-10"
        animate={{
          x: ["0%", "210%"],
          y: [0, -8, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "linear"
        }}
      />

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm tracking-[0.3em]"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ↓ SCROLL ↓
      </motion.div>

    </section>
  );
}