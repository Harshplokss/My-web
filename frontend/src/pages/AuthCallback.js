import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
   const hash = window.location.hash || "";
const search = window.location.search || "";

let sid = null;

const hashMatch = hash.match(/session_id=([^&]+)/);
if (hashMatch) {
  sid = decodeURIComponent(hashMatch[1]);
} else {
  const params = new URLSearchParams(search);
  sid = params.get("session_id");
}

if (!sid) {
  navigate("/", { replace: true });
  return;
}
    (async () => {
      try {
        const r = await api.post("/auth/session", { session_id: sid });
        setUser(r.data.user);
        // Clear hash and redirect
        window.history.replaceState(null, "", "/dashboard");
        navigate("/dashboard", { replace: true, state: { user: r.data.user } });
      } catch (e) {
        console.error("Auth callback failed", e);
        navigate("/", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">
        UNLOCKING THE GATE…
      </div>
    </div>
  );
}
