import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Particles from "./components/Particles";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import LevelPlay from "./pages/LevelPlay";
import Celebration from "./pages/Celebration";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#0A0C10]">
      <div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">LOADING…</div>
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  // Synchronous hash check to handle OAuth callback before ProtectedRoute runs
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/level/:num" element={<Protected><LevelPlay /></Protected>} />
      <Route path="/celebration" element={<Protected><Celebration /></Protected>} />
      <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
      <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white vignette relative">
      <Particles />
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
      <Toaster theme="dark" position="top-center" richColors />
    </div>
  );
}
