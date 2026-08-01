import { motion } from "framer-motion";

import luffy from "../../assets/images/hero-luffy.png";
import sunny from "../../assets/images/thousand-sunny.png";
import ocean from "../../assets/images/ocean.png";

export default function Hero() {
  return (
    <section
      className="relative h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url(${ocean})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Thousand Sunny */}
      <motion.img
        src={sunny}
        alt="Thousand Sunny"
        className="absolute bottom-10 left-[-250px] w-64 md:w-80"
        animate={{
          x: ["0%", "160%"],
          y: [0, -8, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6">
        <motion.img
          src={luffy}
          alt="Monkey D. Luffy"
          className="w-72 md:w-[450px] mx-auto drop-shadow-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-8 text-5xl md:text-7xl font-extrabold text-white"
        >
          SET SAIL
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-yellow-400 text-xl md:text-2xl mt-3"
        >
          The Grand Line Awaits
        </motion.p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
          <button className="px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition">
            Begin Journey
          </button>

          <button className="px-8 py-4 rounded-xl border border-white hover:bg-white hover:text-black transition">
            Continue Adventure
          </button>
        </div>
      </div>
    </section>
  );
}