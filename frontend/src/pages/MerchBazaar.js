import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, Filter, Star, ExternalLink, ShieldCheck,
  Tag, Sparkles, X, Check, ArrowUpDown, Eye, DollarSign, Coins
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "../components/NavBar";
import OceanBackground from "../components/OceanBackground";
import { api } from "../lib/api";
import { SoundManager } from "../utils/SoundManager";
import { DEFAULT_MERCH } from "../data/defaultMerch";

const CATEGORIES = [
  { id: "all", label: "All Treasures", icon: "💎" },
  { id: "figures", label: "Action Figures", icon: "⚔️" },
  { id: "replicas", label: "Devil Fruits & Replicas", icon: "🍇" },
  { id: "apparel", label: "Apparel & Hoodies", icon: "👕" },
  { id: "manga", label: "Manga & Art Books", icon: "📚" },
  { id: "decor", label: "Wanted Posters & Decor", icon: "📜" },
];

const STORES = [
  { id: "all", label: "All Merchant Guilds" },
  { id: "Crunchyroll", label: "Crunchyroll Store" },
  { id: "Amazon", label: "Amazon" },
  { id: "PlazaJapan", label: "PlazaJapan (Japan Import)" },
  { id: "AmiAmi", label: "AmiAmi Tokyo" },
];

export default function MerchBazaar() {
  const [merchItems, setMerchItems] = useState(DEFAULT_MERCH);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStore, setActiveStore] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // "popular", "price_asc", "price_desc", "rating"
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    api.get("/merch")
      .then((res) => {
        if (res.data?.merch && res.data.merch.length > 0) {
          setMerchItems(res.data.merch);
        }
      })
      .catch(() => {
        setMerchItems(DEFAULT_MERCH);
      });
  }, []);

  const handleOpenStore = (item) => {
    SoundManager.playClick();
    toast.info(`Redirecting to ${item.store_name}...`);
    window.open(item.store_url, "_blank", "noopener,noreferrer");
  };

  // Filter & Search
  const filteredItems = merchItems.filter((item) => {
    const matchCat =
      activeCategory === "all" ||
      item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchStore =
      activeStore === "all" ||
      item.store_name?.toLowerCase().includes(activeStore.toLowerCase());
    const matchSearch =
      !searchQuery.trim() ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.store_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStore && matchSearch;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price_asc") return (a.price_usd || 0) - (b.price_usd || 0);
    if (sortBy === "price_desc") return (b.price_usd || 0) - (a.price_usd || 0);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="relative min-h-screen text-white bg-[#040D1A] overflow-x-hidden">
      <OceanBackground showShip={false} />
      <NavBar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs tracking-widest uppercase mb-4"
          >
            <Sparkles size={14} />
            The Grand Line Black Market & Straw Hat Bazaar
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4"
            style={{ textShadow: "0 0 35px rgba(212,175,55,0.35)" }}
          >
            One Piece Goodies & Collectibles
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm sm:text-base leading-relaxed"
          >
            Plunder verified figures, replicas, anime hoodies, authentic manga box sets, and Wanted posters
            curated directly from <strong>Crunchyroll Store</strong>, <strong>Amazon</strong>, <strong>PlazaJapan</strong>, and <strong>AmiAmi</strong>.
            Prices listed in standard USD and official <strong>Grand Line Berry (฿)</strong>!
          </motion.p>

          {/* Trusted Store Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-300">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> 100% Licensed & Authentic
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Coins size={14} className="text-yellow-400" /> Berry Bounty Exchange Rate
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <ExternalLink size={14} className="text-cyan-400" /> Direct Merchant Checkout
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search Luffy Gear 5, Zoro Swords, Devil Fruit, Wanted Posters..."
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

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  SoundManager.playClick();
                  setSortBy(e.target.value);
                }}
                className="bg-[#040D1A] border border-yellow-500/20 rounded-xl px-3 py-2 text-xs text-yellow-300 font-semibold focus:outline-none focus:border-yellow-400"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low (High Bounty)</option>
                <option value="rating">Top Rated (5.0 ★)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  SoundManager.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black border-yellow-400 shadow-md shadow-yellow-500/20"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-yellow-500/30 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Store Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-gray-400 font-mono pr-2 shrink-0">
              Merchant:
            </span>
            {STORES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  SoundManager.playClick();
                  setActiveStore(s.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition ${
                  activeStore === s.id
                    ? "bg-amber-500/20 text-yellow-300 border border-yellow-500/50"
                    : "bg-black/30 text-gray-400 border border-white/5 hover:text-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-16 bg-[#0A1628]/50 border border-white/10 rounded-2xl">
            <ShoppingBag className="mx-auto text-yellow-500/40 mb-3" size={40} />
            <h3 className="font-serif text-lg text-gray-300">No Treasures Found in the Bazaar</h3>
            <p className="text-gray-500 text-sm mt-1">Try resetting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedItems.map((item, idx) => {
              const formattedBerry = (item.price_berry || 0).toLocaleString();

              return (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-[#0A1628]/90 backdrop-blur-md border border-yellow-500/20 hover:border-yellow-400/60 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300"
                >
                  {/* Image Container with Badge */}
                  <div className="relative h-56 w-full overflow-hidden bg-black/60 cursor-pointer"
                       onClick={() => { SoundManager.playClick(); setSelectedProduct(item); }}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop";
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition" />

                    {/* Top Pill: Special Badge */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-500 text-black text-[11px] font-bold tracking-wider uppercase shadow-lg">
                        {item.badge}
                      </div>
                    )}

                    {/* Store Badge */}
                    <div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase text-white shadow-md backdrop-blur-md"
                      style={{ background: item.store_badge_color || "rgba(0,0,0,0.75)" }}
                    >
                      {item.store_name}
                    </div>

                    {/* Quick View Button Hover Trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        SoundManager.playClick();
                        setSelectedProduct(item);
                      }}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-yellow-500 hover:text-black border border-yellow-500/30 text-xs font-semibold text-gray-200 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 shadow-lg"
                    >
                      <Eye size={13} /> Quick View
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & Category */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span className="uppercase font-mono tracking-wider text-yellow-400/80">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star size={13} fill="currentColor" />
                          <span>{item.rating || 4.9}</span>
                          {item.reviews_count && (
                            <span className="text-[11px] text-gray-400">({item.reviews_count})</span>
                          )}
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => { SoundManager.playClick(); setSelectedProduct(item); }}
                        className="font-serif font-bold text-base text-gray-100 group-hover:text-yellow-300 transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
                      >
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-3 border-t border-white/10 mt-auto">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-white font-mono">
                            ${item.price_usd?.toFixed(2)}
                          </div>
                          <div className="text-[11px] font-mono text-yellow-400 flex items-center gap-1">
                            <span>฿ {formattedBerry} Berry</span>
                          </div>
                        </div>

                        <span className="text-[11px] text-emerald-400 font-medium">
                          {item.in_stock ? "✓ In Stock" : "Limited"}
                        </span>
                      </div>

                      {/* Plunder / Direct Buy Button */}
                      <button
                        onClick={() => handleOpenStore(item)}
                        className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <ShoppingBag size={14} /> Buy on {item.store_name?.split(" ")[0]} <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Quick View Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full bg-[#0A1628] border border-yellow-500/40 rounded-2xl overflow-hidden shadow-2xl my-8 text-gray-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Product Image */}
                <div className="relative h-72 md:h-full bg-black/70 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                  {selectedProduct.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-amber-500 text-black text-xs font-bold uppercase tracking-wider shadow-lg">
                      {selectedProduct.badge}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase text-white"
                            style={{ background: selectedProduct.store_badge_color || "#FF6600" }}>
                        {selectedProduct.store_name}
                      </span>
                      <span className="text-xs text-yellow-400 font-mono">
                        {selectedProduct.category?.toUpperCase()}
                      </span>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-100 mb-3 leading-snug">
                      {selectedProduct.name}
                    </h2>

                    <div className="flex items-center gap-2 mb-4 text-xs text-amber-400">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="font-bold text-white">{selectedProduct.rating || 4.9}</span>
                      <span className="text-gray-400">({selectedProduct.reviews_count || 1200} Collector Reviews)</span>
                    </div>

                    {/* Dual Price Highlight */}
                    <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 mb-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        ${selectedProduct.price_usd?.toFixed(2)} USD
                      </div>
                      <div className="text-sm font-mono text-yellow-400 font-semibold mt-1">
                        ฿ {(selectedProduct.price_berry || 0).toLocaleString()} Berry
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                      {selectedProduct.description}
                    </p>

                    {/* Specifications */}
                    {selectedProduct.specs && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1.5 mb-6">
                        <div className="font-bold text-yellow-400 uppercase tracking-wider text-[11px] mb-1">
                          Collector Specifications:
                        </div>
                        {Object.entries(selectedProduct.specs).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-gray-300">
                            <span className="capitalize text-gray-400">{k}:</span>
                            <span className="font-medium text-right text-white">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                    <button
                      onClick={() => handleOpenStore(selectedProduct)}
                      className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                      <ShoppingBag size={16} /> Open & Buy on {selectedProduct.store_name} <ExternalLink size={14} />
                    </button>
                    <p className="text-[11px] text-center text-gray-400">
                      Direct link to official retailer. Prices and stock verified daily.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
