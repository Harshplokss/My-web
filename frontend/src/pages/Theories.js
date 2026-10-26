import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Filter, ThumbsUp, ThumbsDown, Share2, Eye, EyeOff,
  ExternalLink, Sparkles, AlertTriangle, Plus, X, Image as ImageIcon,
  Flame, Check, Compass, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import OceanBackground from "../components/OceanBackground";
import { api } from "../lib/api";
import { SoundManager } from "../utils/SoundManager";
import { DEFAULT_THEORIES } from "../data/defaultTheories";

const SOURCE_COLORS = {
  reddit: { label: "r/OnePiece", bg: "rgba(255, 69, 0, 0.15)", border: "#FF4500", text: "#FF7744", icon: "🔴" },
  instagram: { label: "Instagram", bg: "rgba(225, 48, 108, 0.15)", border: "#E1306C", text: "#F472B6", icon: "📸" },
  google: { label: "Google / SBS", bg: "rgba(66, 133, 244, 0.15)", border: "#4285F4", text: "#60A5FA", icon: "🌐" },
  community: { label: "Straw Hat Lore", bg: "rgba(212, 175, 55, 0.15)", border: "#D4AF37", text: "#FDE047", icon: "🏴‍☠️" },
};

const CATEGORIES = [
  "All",
  "Void Century",
  "Imu & Gorosei",
  "Luffy & Joy Boy",
  "God Valley",
  "Elbaf",
  "Blackbeard"
];

const SOURCES = [
  { id: "all", label: "All Sources" },
  { id: "reddit", label: "Reddit (r/OnePiece)" },
  { id: "instagram", label: "Instagram Lore" },
  { id: "google", label: "Google & SBS" },
  { id: "community", label: "Community Submissions" },
];

export default function Theories() {
  const [theories, setTheories] = useState(DEFAULT_THEORIES);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSource, setActiveSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("top"); // "top" or "newest"
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [activeComicModal, setActiveComicModal] = useState(null); // { pages, index, theoryTitle }
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [votedMap, setVotedMap] = useState({});

  useEffect(() => {
    // Fetch from backend API, fall back to DEFAULT_THEORIES on error
    api.get("/theories")
      .then((res) => {
        if (res.data?.theories && res.data.theories.length > 0) {
          setTheories(res.data.theories);
        }
      })
      .catch(() => {
        // Fall back gracefully to bundled default theories
        setTheories(DEFAULT_THEORIES);
      });
  }, []);

  const handleVote = async (theoryId, direction) => {
    if (votedMap[theoryId]) {
      toast.info("You have already voted on this theory!");
      return;
    }
    SoundManager.playClick();
    setVotedMap((prev) => ({ ...prev, [theoryId]: direction }));

    // Optimistic UI update
    setTheories((prev) =>
      prev.map((t) => {
        if (t.theory_id === theoryId) {
          return {
            ...t,
            upvotes: direction === "up" ? t.upvotes + 1 : t.upvotes,
            downvotes: direction === "down" ? t.downvotes + 1 : t.downvotes,
          };
        }
        return t;
      })
    );

    try {
      await api.post(`/theories/${theoryId}/vote`, { direction });
      if (direction === "up") {
        toast.success("🏴‍☠️ Voted: Believe this Theory!");
      } else {
        toast.info("⚓ Voted: Buster Call / Debunked!");
      }
    } catch {
      // Keep optimistic UI
    }
  };

  const toggleSpoiler = (id) => {
    SoundManager.playClick();
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (theory) => {
    SoundManager.playClick();
    const url = window.location.href.split("#")[0] + "#" + theory.theory_id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Theory link copied to clipboard!");
    } else {
      toast.info(`Sharing: ${theory.title}`);
    }
  };

  // Filtered & Sorted Theories
  const filteredTheories = theories.filter((t) => {
    const matchCat =
      activeCategory === "All" ||
      t.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSrc =
      activeSource === "all" ||
      t.source_type?.toLowerCase() === activeSource.toLowerCase();
    const matchSearch =
      !searchQuery.trim() ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.full_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSrc && matchSearch;
  });

  const sortedTheories = [...filteredTheories].sort((a, b) => {
    if (sortBy === "newest") return -1;
    return (b.upvotes || 0) - (b.downvotes || 0) - ((a.upvotes || 0) - (a.downvotes || 0));
  });

  return (
    <div className="relative min-h-screen text-white bg-[#040D1A] overflow-x-hidden">
      <OceanBackground showShip={false} />
      <NavBar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs tracking-widest uppercase mb-4"
          >
            <Sparkles size={14} />
            The Void Century Archives
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-600 mb-4"
            style={{ textShadow: "0 0 35px rgba(212,175,55,0.35)" }}
          >
            One Piece Theories & Rumors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm sm:text-base leading-relaxed"
          >
            Investigate the greatest mysteries, fan predictions, and leaked Marine documents
            curated from <strong>r/OnePiece</strong>, <strong>Instagram</strong>, and <strong>Ohara Scholars</strong>.
            Inspect authenticated comic panels, vote with your pirate crew, and submit your own prediction.
          </motion.p>

          {/* Action CTA Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              onClick={() => { SoundManager.playClick(); setIsSubmitModalOpen(true); }}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} /> Submit Your Theory
            </button>
            <div className="flex items-center gap-3 text-xs text-yellow-400/80 font-mono">
              <span>📜 {theories.length} Active Conspiracies</span>
              <span>•</span>
              <span>🔥 Verified Comic Pages</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0A1628]/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search theories, Imu, Joy Boy, Ancient Kingdom, God Valley..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#040D1A]/80 border border-yellow-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Sort:</span>
              <button
                onClick={() => { SoundManager.playClick(); setSortBy("top"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                  sortBy === "top"
                    ? "bg-amber-500/20 text-yellow-400 border border-yellow-500/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Top Believed
              </button>
              <button
                onClick={() => { SoundManager.playClick(); setSortBy("newest"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                  sortBy === "newest"
                    ? "bg-amber-500/20 text-yellow-400 border border-yellow-500/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Newest Rumors
              </button>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            <span className="text-xs text-gray-400 font-mono pr-2 flex items-center gap-1 shrink-0">
              <Filter size={13} /> Source:
            </span>
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => { SoundManager.playClick(); setActiveSource(s.id); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  activeSource === s.id
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm shadow-yellow-500/20"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-yellow-500/30 hover:text-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Topic Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-gray-400 font-mono pr-2 flex items-center gap-1 shrink-0">
              <Compass size={13} /> Topic:
            </span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { SoundManager.playClick(); setActiveCategory(c); }}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition ${
                  activeCategory === c
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-black/40 text-gray-300 hover:bg-black/60 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Theories List */}
        {sortedTheories.length === 0 ? (
          <div className="text-center py-16 bg-[#0A1628]/50 border border-white/10 rounded-2xl">
            <BookOpen className="mx-auto text-yellow-500/40 mb-3" size={40} />
            <h3 className="font-serif text-lg text-gray-300">No Secret Poneglyphs Match Your Search</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedTheories.map((theory, idx) => {
              const srcConfig = SOURCE_COLORS[theory.source_type] || SOURCE_COLORS.community;
              const isSpoilerRevealed = revealedSpoilers[theory.theory_id] || !theory.has_spoilers;
              const netBounty = (theory.upvotes || 0) - (theory.downvotes || 0);

              return (
                <motion.article
                  key={theory.theory_id}
                  id={theory.theory_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-[#0A1628]/85 backdrop-blur-md border border-yellow-500/20 rounded-2xl overflow-hidden shadow-xl hover:border-yellow-500/40 transition-all duration-300"
                >
                  {/* Top Bar: Source + Topic + Spoilers */}
                  <div className="p-5 sm:p-6 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                        style={{
                          background: srcConfig.bg,
                          border: `1px solid ${srcConfig.border}`,
                          color: srcConfig.text,
                        }}
                      >
                        <span>{srcConfig.icon}</span>
                        {theory.source_name}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
                        {theory.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {theory.has_spoilers && (
                        <button
                          onClick={() => toggleSpoiler(theory.theory_id)}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition ${
                            isSpoilerRevealed
                              ? "bg-red-500/15 border border-red-500/30 text-red-300"
                              : "bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse"
                          }`}
                        >
                          <AlertTriangle size={13} />
                          {isSpoilerRevealed ? "Spoilers Unlocked" : "Contains Spoilers (Click to Reveal)"}
                        </button>
                      )}

                      <button
                        onClick={() => handleShare(theory)}
                        className="p-1.5 text-gray-400 hover:text-yellow-400 rounded-lg hover:bg-white/5 transition"
                        title="Share Theory"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-100 mb-2 leading-snug">
                      {theory.title}
                    </h2>

                    <p className="text-yellow-400/90 text-sm font-medium mb-4 italic">
                      "{theory.summary}"
                    </p>

                    {/* Spoiler blur wrapper */}
                    <div className="relative">
                      {!isSpoilerRevealed && (
                        <div
                          onClick={() => toggleSpoiler(theory.theory_id)}
                          className="absolute inset-0 z-20 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center cursor-pointer rounded-xl border border-yellow-500/20 group hover:border-yellow-400/40 transition"
                        >
                          <AlertTriangle className="text-amber-400 mb-2 group-hover:scale-110 transition" size={28} />
                          <p className="font-serif text-base text-gray-200 font-semibold">
                            Manga Spoilers Concealed (Egghead & Beyond)
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Click here to decipher this secret Poneglyph and reveal attached comic pages
                          </p>
                        </div>
                      )}

                      <div className={`space-y-4 ${!isSpoilerRevealed ? "filter blur-sm select-none" : ""}`}>
                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                          {theory.full_text}
                        </div>

                        {/* Comic Pages / Manga Panels Section */}
                        {theory.comic_pages && theory.comic_pages.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                              <ImageIcon size={16} className="text-yellow-400" />
                              <h4 className="font-serif text-xs uppercase tracking-widest text-yellow-400">
                                Supporting Comic Pages & Manga Evidence ({theory.comic_pages.length})
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {theory.comic_pages.map((comic, cIdx) => (
                                <div
                                  key={cIdx}
                                  onClick={() => {
                                    if (isSpoilerRevealed) {
                                      SoundManager.playClick();
                                      setActiveComicModal({
                                        pages: theory.comic_pages,
                                        index: cIdx,
                                        theoryTitle: theory.title,
                                      });
                                    }
                                  }}
                                  className="group relative bg-[#040D1A] border border-white/10 hover:border-yellow-400/50 rounded-xl overflow-hidden cursor-pointer transition shadow-md"
                                >
                                  <div className="h-40 overflow-hidden relative">
                                    <img
                                      src={comic.image_url}
                                      alt={comic.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      onError={(e) => {
                                        // Stylized manga fallback
                                        e.target.src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop";
                                      }}
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-yellow-500/30 text-[10px] font-mono text-yellow-300 font-semibold">
                                      {comic.chapter}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition" />
                                  </div>
                                  <div className="p-2.5">
                                    <div className="text-xs font-semibold text-gray-200 truncate group-hover:text-yellow-300 transition">
                                      {comic.title || "Manga Panel"}
                                    </div>
                                    <div className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                                      {comic.caption}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Author, Source Link & Bounty Voting */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Discovered by:</span>
                        <strong className="text-gray-200">{theory.author}</strong>
                        {theory.source_url && (
                          <a
                            href={theory.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-yellow-400/80 hover:text-yellow-300 ml-1 underline"
                          >
                            Original Post <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(theory.theory_id, "up")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                            votedMap[theory.theory_id] === "up"
                              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                              : "bg-white/5 hover:bg-yellow-500/10 text-gray-300 hover:text-yellow-400 border border-white/10"
                          }`}
                        >
                          <ThumbsUp size={14} />
                          <span>Believe</span>
                          <span className="font-mono text-xs opacity-90">({theory.upvotes || 0})</span>
                        </button>

                        <button
                          onClick={() => handleVote(theory.theory_id, "down")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                            votedMap[theory.theory_id] === "down"
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                              : "bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10"
                          }`}
                        >
                          <ThumbsDown size={14} />
                          <span>Debunk</span>
                          <span className="font-mono text-xs opacity-90">({theory.downvotes || 0})</span>
                        </button>

                        <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-yellow-500/20 text-xs font-mono text-yellow-400">
                          Net: {netBounty >= 0 ? `+${netBounty}` : netBounty} ฿
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* Comic Page Reader Lightbox Modal */}
      <AnimatePresence>
        {activeComicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-[#071324] border border-yellow-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-yellow-400 font-mono tracking-widest uppercase">
                    Manga Evidence • {activeComicModal.pages[activeComicModal.index]?.chapter}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-100">
                    {activeComicModal.pages[activeComicModal.index]?.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveComicModal(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Image Body */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                <img
                  src={activeComicModal.pages[activeComicModal.index]?.image_url}
                  alt={activeComicModal.pages[activeComicModal.index]?.title}
                  className="max-h-[65vh] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Modal Caption & Navigation */}
              <div className="p-4 px-6 border-t border-white/10 bg-[#040D1A] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-300 italic max-w-xl">
                  "{activeComicModal.pages[activeComicModal.index]?.caption}"
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={activeComicModal.index === 0}
                    onClick={() => {
                      SoundManager.playClick();
                      setActiveComicModal((prev) => ({ ...prev, index: prev.index - 1 }));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Previous Panel
                  </button>
                  <span className="text-xs font-mono text-yellow-400 px-2">
                    {activeComicModal.index + 1} / {activeComicModal.pages.length}
                  </span>
                  <button
                    disabled={activeComicModal.index === activeComicModal.pages.length - 1}
                    onClick={() => {
                      SoundManager.playClick();
                      setActiveComicModal((prev) => ({ ...prev, index: prev.index + 1 }));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next Panel →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Theory Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <SubmitTheoryModal
            onClose={() => setIsSubmitModalOpen(false)}
            onCreated={(newTheory) => {
              setTheories((prev) => [newTheory, ...prev]);
              toast.success("Theory successfully submitted to the Void Century Archives!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal component to submit new theory
function SubmitTheoryModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fullText, setFullText] = useState("");
  const [sourceType, setSourceType] = useState("reddit");
  const [sourceName, setSourceName] = useState("r/OnePiece");
  const [sourceUrl, setSourceUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Void Century");
  const [hasSpoilers, setHasSpoilers] = useState(true);
  const [comicChapter, setComicChapter] = useState("");
  const [comicImageUrl, setComicImageUrl] = useState("");
  const [comicCaption, setComicCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      toast.error("Please provide both a title and summary!");
      return;
    }

    setLoading(true);
    SoundManager.playClick();

    const comicPages = [];
    if (comicImageUrl.trim()) {
      comicPages.push({
        chapter: comicChapter.trim() || "Chapter Reference",
        title: `${title} - Exhibit 1`,
        image_url: comicImageUrl.trim(),
        caption: comicCaption.trim() || "Comic reference supporting this theory.",
      });
    }

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      full_text: fullText.trim() || summary.trim(),
      source_type: sourceType,
      source_name: sourceName.trim() || "Straw Hat Fan",
      source_url: sourceUrl.trim(),
      author: author.trim() || "Anonymous Pirate",
      category,
      has_spoilers: hasSpoilers,
      comic_pages: comicPages,
    };

    try {
      const res = await api.post("/theories", payload);
      onCreated(res.data.theory);
      onClose();
    } catch {
      // Local fallback creation
      const localDoc = {
        ...payload,
        theory_id: `th_local_${Date.now()}`,
        upvotes: 1,
        downvotes: 0,
      };
      onCreated(localDoc);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-2xl w-full bg-[#0A1628] border border-yellow-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 text-gray-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            <h3 className="font-serif text-xl font-bold text-yellow-300">
              Submit a One Piece Theory or Prediction
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
              Theory Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shanks' Lineage and the God's Knights Connection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
                Source Platform
              </label>
              <select
                value={sourceType}
                onChange={(e) => {
                  setSourceType(e.target.value);
                  if (e.target.value === "reddit") setSourceName("r/OnePiece");
                  else if (e.target.value === "instagram") setSourceName("@onepiece_theories");
                  else if (e.target.value === "google") setSourceName("Google / SBS");
                  else setSourceName("Community Theorist");
                }}
                className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="reddit">Reddit (r/OnePiece)</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google / SBS Discussions</option>
                <option value="community">My Own Original Theory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
                Lore Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
                Theorist Handle / Username
              </label>
              <input
                type="text"
                placeholder="e.g. u/OharaScholar or @pirate_lore"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
                Link to Source / Discussion
              </label>
              <input
                type="url"
                placeholder="https://reddit.com/r/OnePiece/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
              Brief Summary (One-Sentence Hook) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Ancient Kingdom sunk when Uranus was fired during the Void Century."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-yellow-400/90 mb-1">
              Detailed Evidence & Arguments
            </label>
            <textarea
              rows={4}
              placeholder="Cite manga chapters, character quotes, and Oda's SBS revelations..."
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              className="w-full bg-[#040D1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Attached Comic Panel Reference */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-yellow-400">
              <ImageIcon size={14} /> Attach Comic / Manga Panel Reference (Optional)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Chapter reference (e.g. Chapter 1086)"
                value={comicChapter}
                onChange={(e) => setComicChapter(e.target.value)}
                className="w-full bg-[#040D1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <input
                type="url"
                placeholder="Manga Panel Image URL"
                value={comicImageUrl}
                onChange={(e) => setComicImageUrl(e.target.value)}
                className="w-full bg-[#040D1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <input
              type="text"
              placeholder="Caption explaining this manga panel"
              value={comicCaption}
              onChange={(e) => setComicCaption(e.target.value)}
              className="w-full bg-[#040D1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="spoilerCheck"
              checked={hasSpoilers}
              onChange={(e) => setHasSpoilers(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="spoilerCheck" className="text-xs text-gray-300">
              Contains Manga Spoilers (protect anime-only fans with a blur seal)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
            >
              {loading ? "Inscribing..." : "Publish Theory"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
