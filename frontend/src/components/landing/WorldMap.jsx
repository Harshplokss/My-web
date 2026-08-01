import React from "react";
import { motion } from "framer-motion";

const arcs = [
  "East Blue",
  "Alabasta",
  "Skypiea",
  "Water 7",
  "Enies Lobby",
  "Marineford",
  "Dressrosa",
  "Whole Cake",
  "Wano",
  "Egghead",
  "Elbaf",
  "Laugh Tale",
];

export default function WorldMap() {
  return (
    <section className="relative py-28 px-6 bg-[#081321]">

      <div className="max-w-5xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-5xl font-black text-yellow-400 mb-6"
        >
          Grand Line Journey
        </motion.h2>

        <p className="text-center text-gray-400 mb-20">
          Sail through every island and unlock your path to Laugh Tale.
        </p>

        <div className="flex flex-col items-center">

          {arcs.map((arc, index) => (
            <motion.div
              key={arc}
              whileHover={{ scale: 1.08 }}
              className="flex flex-col items-center"
            >

              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xl shadow-lg cursor-pointer">

                {index + 1}

              </div>

              <h3 className="text-white mt-4 text-xl font-semibold">

                {arc}

              </h3>

              {index !== arcs.length - 1 && (

                <div className="h-16 border-l-4 border-yellow-500 my-4"></div>

              )}

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}