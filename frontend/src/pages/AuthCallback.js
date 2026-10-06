import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);
  const [errorMsg, setErrorMsg] = useState(null);

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
        if (r.data.session_token) {
          localStorage.setItem("treasure_session_token", r.data.session_token);
        }
        setUser(r.data.user);
        // Clear hash and redirect
        window.history.replaceState(null, "", "/dashboard");
        navigate("/dashboard", { replace: true, state: { user: r.data.user } });
      } catch (e) {
        console.error("Auth callback failed", e);
        setErrorMsg("Authentication failed or backend server unreachable. Redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 3000);
      }
    })();
  }, [navigate, setUser]);

  if (errorMsg) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[#0A0C10]">
        <div className="font-accent text-red-400 tracking-[0.2em] text-sm text-center p-4">
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="font-accent text-[#D4AF37] tracking-[0.3em] text-sm animate-pulse">
        UNLOCKING THE GATE…
      </div>
    </div>
  );
}
