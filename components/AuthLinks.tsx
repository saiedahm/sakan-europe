"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthLinks() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (active) { setEmail(data.session?.user.email ?? null); setReady(true); }
      }).catch(() => { if (active) setReady(true); });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) { setEmail(session?.user.email ?? null); setReady(true); }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { setReady(true); }
    return () => { active = false; unsubscribe(); };
  }, []);
  async function signOut() {
    try { await getSupabaseBrowserClient().auth.signOut(); setEmail(null); }
    catch { /* The session listener will update the header if sign-out succeeds. */ }
  }
  if (!ready) return <div className="auth-links" aria-label="Account"><Link href="/login">ACCOUNT</Link></div>;
  return <div className="auth-links" aria-label="Account">
    {email ? <><span className="auth-user" title={email}>{email}</span><button type="button" className="auth-text-button" onClick={signOut}>SIGN OUT</button></> : <><Link href="/login">LOG IN</Link><Link href="/signup">JOIN VIP</Link></>}
  </div>;
}
