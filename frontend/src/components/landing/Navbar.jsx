import React from "react";

export default function Navbar({ handleSignIn }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-yellow-500/20">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <span className="text-3xl">🏴‍☠️</span>

          <div>
            <h2 className="text-yellow-400 text-2xl font-bold">
              Journey to Laugh Tale
            </h2>

            <p className="text-xs tracking-[0.35em] text-gray-400">
              THE GRAND LINE
            </p>
          </div>

        </div>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-white">

          <button className="hover:text-yellow-400 transition">
            Home
          </button>

          <button className="hover:text-yellow-400 transition">
            Arcs
          </button>

          <button className="hover:text-yellow-400 transition">
            Characters
          </button>

          <button className="hover:text-yellow-400 transition">
            Haki
          </button>

          <button className="hover:text-yellow-400 transition">
            Devil Fruits
          </button>

          <button className="hover:text-yellow-400 transition">
            Mysteries
          </button>

        </div>

        <button
          onClick={handleSignIn}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition duration-300 shadow-lg"
        >
          Begin Journey
        </button>

      </div>

    </div>
  );
}