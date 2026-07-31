import { motion } from "framer-motion";

import luffy from "../../assets/images/hero-luffy.png";
import sunny from "../../assets/images/thousand-sunny.png";
import ocean from "../../assets/images/ocean-bg.jpg";

export default function Hero() {
  return (
    <section
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${ocean})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <motion.img
        src={sunny}
        alt="Sunny"
        className="absolute bottom-12 left-0 w-72"
        animate={{
          x: ["-15%", "110%"],
          y: [0, -12, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center"
      >
        <motion.img
          src={luffy}
          alt="Luffy"
          className="w-[420px] mx-auto drop-shadow-2xl"
          animate={{ y: [0, -15, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
        />

        <h1 className="text-7xl font-black mt-8 tracking-wide">
          SET SAIL
        </h1>

        <p className="text-yellow-400 text-2xl mt-3">
          The Grand Line Awaits
        </p>

        <div className="flex justify-center gap-6 mt-10">
          <button className="btn-gold text-lg px-8 py-4">
            Begin Journey
          </button>

          <button className="btn-ghost text-lg px-8 py-4">
            Continue
          </button>
        </div>
      </motion.div>
    </section>
  );
}
