import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, LogOut, Crown, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/5">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 group"
        data-testid="nav-logo"
      >
        <Compass size={22} className="text-[#D4AF37] group-hover:rotate-45 transition-transform duration-500" />
        <span className="font-accent text-sm tracking-[0.35em] text-[#D4AF37]">TREASURE HUNT</span>
      </button>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/leaderboard" className="text-sm text-gray-300 hover:text-[#D4AF37] transition flex items-center gap-1.5" data-testid="nav-leaderboard">
          <Trophy size={16} /> <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        {user?.is_admin && (
          <Link to="/admin" className="text-sm text-[#D4AF37] hover:text-[#FDE047] transition flex items-center gap-1.5" data-testid="nav-admin">
            <Crown size={16} /> <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
        {user && (
          <div className="flex items-center gap-3">
            {user.picture && <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-[#D4AF37]/40" />}
            <span className="text-sm hidden md:inline text-gray-300" data-testid="nav-user-name">{user.name}</span>
            <button onClick={logout} className="text-gray-400 hover:text-red-400 transition" title="Sign out" data-testid="nav-logout">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
