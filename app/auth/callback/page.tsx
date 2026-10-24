"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Confirming your account…");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function finish() {
      try {
        const params = new URLSearchParams(window.location.search);
        const supabase = getSupabaseBrowserClient();
        const code = params.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) throw new Error(params.get("error_description") || "Confirmation link is missing or has expired.");
        }
        if (active) {
          setMessage("Your account is confirmed. Welcome to SAKAN EUROPE.");
          const next = params.get("next");
          window.location.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
        }
      } catch (e) {
        if (active) { setFailed(true); setMessage(e instanceof Error ? e.message : "Could not confirm your account."); }
      }
    }
    void finish();
    return () => { active = false; };
  }, []);
  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand"><span className="brand-mark">S</span><span>SAKAN <b>EUROPE</b></span></Link>
    <h1>{failed ? "Confirmation needed." : "One moment."}</h1>
    <p role="status" className={failed ? "auth-message auth-error" : "auth-subtitle"}>{message}</p>
    {failed && <Link href="/login" className="auth-back">CONTINUE TO SIGN IN</Link>}
  </section></main>;
}
