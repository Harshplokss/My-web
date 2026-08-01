import React from "react";
import { motion } from "framer-motion";
import WorldMap from "../components/landing/WorldMap";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";
import ocean from "../assets/images/ocean.png";
import luffy from "../assets/images/hero-luffy.png";
import sunny from "../assets/images/thousand-sunny.png";

export default function Landing() {
  const handleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

return (
  <div className="relative min-h-screen overflow-hidden bg-[#06111f]">
    <Navbar handleSignIn={handleSignIn} />
    <Hero handleSignIn={handleSignIn} />
     <WorldMap />
  </div>
);
}
