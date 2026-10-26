import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download, Upload, Share2, Sparkles, RefreshCw, Eye, ShieldAlert,
  Sliders, Image as ImageIcon, Camera, Check, FileDown, Layers
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import NavBar from "../components/NavBar";
import OceanBackground from "../components/OceanBackground";
import { useAuth } from "../context/AuthContext";
import { SoundManager } from "../utils/SoundManager";

// Iconic character preset avatars
const PRESET_AVATARS = [
  {
    name: "Monkey D. Luffy",
    epithet: "STRAW HAT",
    bounty: 3000000000,
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Roronoa Zoro",
    epithet: "PIRATE HUNTER",
    bounty: 1111000000,
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Vinsmoke Sanji",
    epithet: "BLACK LEG",
    bounty: 1032000000,
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    condition: "ONLY ALIVE"
  },
  {
    name: "Trafalgar D. Water Law",
    epithet: "SURGEON OF DEATH",
    bounty: 3000000000,
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Portgas D. Ace",
    epithet: "FIRE FIST",
    bounty: 550000000,
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Red-Haired Shanks",
    epithet: "YONKO",
    bounty: 4048900000,
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Nico Robin",
    epithet: "DEVIL CHILD",
    bounty: 930000000,
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  },
  {
    name: "Tony Tony Chopper",
    epithet: "COTTON CANDY LOVER",
    bounty: 1000,
    url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
    condition: "DEAD OR ALIVE"
  }
];

const QUICK_BOUNTIES = [
  { label: "30M (East Blue)", val: 30000000 },
  { label: "100M (Super Rookie)", val: 100000000 },
  { label: "500M (Dressrosa)", val: 500000000 },
  { label: "1.5B (5th Emperor)", val: 1500000000 },
  { label: "3B (Yonko)", val: 3000000000 },
  { label: "5.56B (Roger)", val: 5564800000 },
];

const PHOTO_FILTERS = [
  { id: "sepia", label: "Manga Sepia", style: "sepia(70%) contrast(120%) brightness(95%)" },
  { id: "bw", label: "Dramatic B&W", style: "grayscale(100%) contrast(135%) brightness(95%)" },
  { id: "vintage", label: "Aged Anime", style: "sepia(30%) saturate(120%) contrast(110%)" },
  { id: "none", label: "Natural Color", style: "none" },
];

export default function WantedPosterGenerator() {
  const { user } = useAuth();
  const posterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Poster State
  const [pirateName, setPirateName] = useState(
    user?.name ? user.name.toUpperCase() : "MONKEY D. LUFFY"
  );
  const [epithet, setEpithet] = useState("STRAW HAT");
  const [bounty, setBounty] = useState(user?.score ? user.score * 1000000 : 3000000000);
  const [condition, setCondition] = useState("DEAD OR ALIVE");
  const [photoUrl, setPhotoUrl] = useState(
    user?.picture || PRESET_AVATARS[0].url
  );
  const [photoFilter, setPhotoFilter] = useState("sepia");
  const [photoZoom, setPhotoZoom] = useState(1);
  const [showMarineSeal, setShowMarineSeal] = useState(true);
  const [showConfidentialStamp, setShowConfidentialStamp] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Sync if user logs in or profile changes
  useEffect(() => {
    if (user?.name && pirateName === "MONKEY D. LUFFY") {
      setPirateName(user.name.toUpperCase());
    }
    if (user?.picture && photoUrl === PRESET_AVATARS[0].url) {
      setPhotoUrl(user.picture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle custom image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image file is too large! Please choose an image under 8MB.");
        return;
      }
      SoundManager.playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
        toast.success("Pirate photo loaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset loader
  const handleSelectPreset = (p) => {
    SoundManager.playClick();
    setPirateName(p.name.toUpperCase());
    setEpithet(p.epithet);
    setBounty(p.bounty);
    setPhotoUrl(p.url);
    setCondition(p.condition);
    toast.success(`Applied ${p.name}'s bounty profile!`);
  };

  // Randomize pirate identity
  const handleRandomize = () => {
    SoundManager.playClick();
    const randomPreset = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    handleSelectPreset(randomPreset);
  };

  // Download High-Resolution PNG
  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    SoundManager.playSuccess();
    toast.info("Forging high-resolution Wanted Poster...");

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      const cleanName = pirateName.trim().replace(/\s+/g, "_") || "PIRATE";
      link.download = `WANTED_${cleanName}_BOUNTY.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Wanted Poster downloaded successfully! 🏴‍☠️");
    } catch (err) {
      console.error(err);
      toast.error("Could not export poster. Please check image permissions.");
    } finally {
      setExporting(false);
    }
  };

  // Download Print-Ready PDF
  const handleDownloadPDF = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    SoundManager.playSuccess();
    toast.info("Generating print-ready Marine Warrant PDF...");

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const cleanName = pirateName.trim().replace(/\s+/g, "_") || "PIRATE";
      pdf.save(`WANTED_POSTER_${cleanName}.pdf`);
      toast.success("Marine Warrant PDF saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    } finally {
      setExporting(false);
    }
  };

  // Native Web Share
  const handleShare = async () => {
    SoundManager.playClick();
    if (!posterRef.current) return;

    if (navigator.share && navigator.canShare) {
      try {
        const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `WANTED_${pirateName}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `WANTED: ${pirateName}`,
              text: `Check out my One Piece Bounty of ฿ ${Number(bounty).toLocaleString()} Berry!`,
            });
            toast.success("Shared bounty poster!");
          }
        });
      } catch (e) {
        toast.info("Sharing cancelled.");
      }
    } else {
      toast.info("Sharing link copied!");
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const formattedBounty = Number(bounty || 0).toLocaleString();
  const activeFilterStyle = PHOTO_FILTERS.find((f) => f.id === photoFilter)?.style || "none";

  return (
    <div className="relative min-h-screen text-white bg-[#040D1A] overflow-x-hidden">
      <OceanBackground showShip={false} />
      <NavBar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs tracking-widest uppercase mb-4"
          >
            <Sparkles size={14} />
            Marine Headquarters • Global Bounty Bureau
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4"
            style={{ textShadow: "0 0 35px rgba(212,175,55,0.35)" }}
          >
            One Piece WANTED Poster Generator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-300 text-sm sm:text-base leading-relaxed"
          >
            Forge your personalized, screen-accurate <strong>DEAD OR ALIVE</strong> bounty poster.
            Upload your own photo or pick a legendary Straw Hat pirate, set your Berry bounty,
            and download ultra high-res <strong>PNG / PDF</strong> copies for printing or social media!
          </motion.p>
        </div>

        {/* Studio Workspace: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Wanted Poster Canvas (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
            <div className="text-xs font-mono uppercase tracking-widest text-yellow-400/80 mb-3 flex items-center gap-2">
              <Eye size={14} /> Live Marine Bounty Warrant Preview
            </div>

            {/* Poster Element to Capture */}
            <div
              ref={posterRef}
              className="wanted-poster-container w-full max-w-[420px] aspect-[1/1.42] relative select-none rounded-lg p-6 sm:p-7 flex flex-col justify-between shadow-2xl overflow-hidden"
              style={{
                background: "linear-gradient(155deg, #EFE3BE 0%, #E2CE98 45%, #D6BC7E 100%)",
                border: "6px solid #4A2E18",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8), inset 0 0 50px rgba(92,58,30,0.35)",
                color: "#2C1810",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {/* Distressed Paper Grain & Border Stitches */}
              <div
                className="absolute inset-2 border-2 border-dashed border-[#8B5E3C]/40 pointer-events-none rounded"
                style={{ mixBlendMode: "multiply" }}
              />

              {/* Arched WANTED Header */}
              <div className="text-center pt-1">
                <h1
                  className="font-black tracking-[0.14em] text-[#3D1E0B] leading-none"
                  style={{
                    fontSize: "clamp(2.4rem, 9.5vw, 3.8rem)",
                    fontFamily: "Impact, 'Arial Black', sans-serif",
                    textShadow: "1px 2px 0px rgba(255,255,255,0.4), -1px -1px 0px rgba(0,0,0,0.15)",
                    transform: "scaleY(1.15)",
                  }}
                >
                  WANTED
                </h1>

                {/* Subtitle / Condition */}
                <div
                  className="font-bold tracking-[0.25em] text-[#5C3A1E] mt-1 text-center"
                  style={{
                    fontSize: "clamp(0.6rem, 2.5vw, 0.85rem)",
                    fontFamily: "'Courier New', Courier, monospace",
                    letterSpacing: "0.28em",
                  }}
                >
                  {condition}
                </div>
              </div>

              {/* Central Photo Frame */}
              <div className="my-2 px-1">
                <div
                  className="relative w-full aspect-[1.12/1] rounded bg-[#C7AE7A] overflow-hidden border-4 border-[#5C3A1E] shadow-inner"
                  style={{
                    boxShadow: "inset 0 0 25px rgba(60,30,10,0.6)",
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={pirateName}
                    className="w-full h-full object-cover transition-all"
                    style={{
                      filter: activeFilterStyle,
                      transform: `scale(${photoZoom})`,
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = PRESET_AVATARS[0].url;
                    }}
                  />

                  {/* Red "CONFIDENTIAL / REWARD" Wax Seal Stamp */}
                  {showConfidentialStamp && (
                    <div
                      className="absolute bottom-2 right-2 border-2 border-[#991B1B] text-[#991B1B] font-mono font-black text-[9px] px-2 py-0.5 rounded rotate-[-12deg] tracking-widest uppercase bg-[#EFE3BE]/85 shadow"
                      style={{ textShadow: "0 0 1px rgba(153,27,27,0.5)" }}
                    >
                      ★ MARINE HQ ★
                    </div>
                  )}

                  {/* Epithet Tag in Photo Corner */}
                  {epithet && (
                    <div className="absolute top-2 left-2 bg-[#2C1810]/85 text-[#EFE3BE] text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                      "{epithet}"
                    </div>
                  )}
                </div>
              </div>

              {/* Lower Section: Name & Bounty */}
              <div className="text-center pb-1">
                {/* Pirate Name */}
                <h2
                  className="font-black text-[#2A1406] tracking-[0.08em] uppercase truncate px-2"
                  style={{
                    fontSize: "clamp(1.2rem, 5.2vw, 1.95rem)",
                    fontFamily: "Impact, 'Arial Black', sans-serif",
                    letterSpacing: "0.08em",
                  }}
                >
                  {pirateName || "UNKNOWN"}
                </h2>

                {/* Berry Bounty Line with authentic One Piece Berry symbol */}
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span
                    className="font-black text-[#5C3A1E] leading-none"
                    style={{
                      fontSize: "clamp(1.2rem, 5vw, 1.7rem)",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    ฿
                  </span>
                  <span
                    className="font-black text-[#2A1406] tracking-wider leading-none"
                    style={{
                      fontSize: "clamp(1.4rem, 5.8vw, 2.1rem)",
                      fontFamily: "Impact, 'Arial Black', sans-serif",
                    }}
                  >
                    {formattedBounty}
                  </span>
                  <span
                    className="font-bold text-[#5C3A1E] leading-none text-xl"
                    style={{ transform: "translateY(-2px)" }}
                  >
                    -
                  </span>
                </div>

                {/* Bottom Marine Authentic Legal Disclaimer */}
                <div className="mt-2 pt-1 border-t border-[#8B5E3C]/40 flex items-center justify-between text-[7px] text-[#5C3A1E] font-mono uppercase tracking-tighter opacity-80 px-1">
                  <span>MARINE KAIKOKU</span>
                  <span className="truncate max-w-[200px] text-center">
                    KONO SAKUHIN WA FICTION DETHUNODE
                  </span>
                  <span>WORLD GOVT</span>
                </div>
              </div>
            </div>

            {/* Quick Export Action Buttons below preview */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full max-w-[420px]">
              <button
                onClick={handleDownloadPNG}
                disabled={exporting}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                <Download size={15} /> {exporting ? "Forging..." : "Download PNG (HD)"}
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
                title="Download Print PDF"
              >
                <FileDown size={15} /> PDF
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-white/10 hover:bg-yellow-500/20 hover:text-yellow-400 border border-white/10 text-gray-300 transition"
                title="Share Warrant"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0A1628]/90 backdrop-blur-xl border border-yellow-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="text-yellow-400" size={18} />
                <h3 className="font-serif text-lg font-bold text-yellow-300">
                  Custom Bounty Studio
                </h3>
              </div>
              <button
                onClick={handleRandomize}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
              >
                <RefreshCw size={13} /> Randomize Pirate
              </button>
            </div>

            {/* Pirate Name & Epithet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                  Pirate Full Name *
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={pirateName}
                  onChange={(e) => setPirateName(e.target.value.toUpperCase())}
                  placeholder="e.g. MONKEY D. LUFFY"
                  className="w-full bg-[#040D1A] border border-white/10 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm font-semibold uppercase text-white tracking-wider outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                  Pirate Epithet / Title
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={epithet}
                  onChange={(e) => setEpithet(e.target.value.toUpperCase())}
                  placeholder="e.g. STRAW HAT / PIRATE HUNTER"
                  className="w-full bg-[#040D1A] border border-white/10 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm uppercase text-white outline-none transition"
                />
              </div>
            </div>

            {/* Bounty & Condition */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                    Bounty Score (฿ Berry) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={bounty}
                    onChange={(e) => setBounty(Number(e.target.value))}
                    className="w-full bg-[#040D1A] border border-white/10 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                    Wanted Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#040D1A] border border-white/10 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
                  >
                    <option value="DEAD OR ALIVE">DEAD OR ALIVE (Standard)</option>
                    <option value="ONLY ALIVE">ONLY ALIVE (Sanji / Royal Special)</option>
                    <option value="DEAD ONLY">DEAD ONLY (Extreme Threat)</option>
                  </select>
                </div>
              </div>

              {/* Quick Bounty Presets */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-mono text-gray-400 shrink-0">Presets:</span>
                {QUICK_BOUNTIES.map((qb) => (
                  <button
                    key={qb.label}
                    onClick={() => {
                      SoundManager.playClick();
                      setBounty(qb.val);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition font-mono ${
                      bounty === qb.val
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    {qb.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Selection: Upload or Preset Straw Hats */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Camera size={14} /> Pirate Portrait Source
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500 hover:text-black transition flex items-center gap-1.5"
                >
                  <Upload size={13} /> Upload Your Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Avatar Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((p) => {
                  const isSelected = photoUrl === p.url;
                  return (
                    <button
                      key={p.name}
                      onClick={() => handleSelectPreset(p)}
                      title={`${p.name} (${p.epithet})`}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-yellow-400 scale-105 shadow-md shadow-yellow-500/30"
                          : "border-white/10 opacity-70 hover:opacity-100 hover:border-yellow-400/50"
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                          <Check size={16} className="text-yellow-400 drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Filters & Adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                  Photo Tone / Filter
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PHOTO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        SoundManager.playClick();
                        setPhotoFilter(f.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                        photoFilter === f.id
                          ? "bg-amber-500 text-black font-semibold shadow"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1.5">
                  Portrait Zoom ({Math.round(photoZoom * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.05"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 mt-2"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                  <span>Fit (80%)</span>
                  <span>100%</span>
                  <span>Close-Up (200%)</span>
                </div>
              </div>
            </div>

            {/* Stamp & Seal Toggles */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={showConfidentialStamp}
                  onChange={(e) => setShowConfidentialStamp(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Red Marine HQ Seal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={Boolean(epithet)}
                  onChange={(e) => {
                    if (!e.target.checked) setEpithet("");
                    else setEpithet("STRAW HAT");
                  }}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Show Pirate Epithet Badge</span>
              </label>
            </div>

            {/* Bottom Export CTAs */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleDownloadPNG}
                disabled={exporting}
                className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <Download size={16} /> Download High-Res Poster (.PNG)
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
              >
                <FileDown size={16} /> Save as PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
