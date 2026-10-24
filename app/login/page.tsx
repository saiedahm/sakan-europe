"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError(false); setBusy(true);
    try {
      const { data, error: authError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      if (!data.session) throw new Error("Login completed without an active session. Please try again.");
      setMessage("Welcome back. Redirecting to SAKAN EUROPE…");
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand"><span className="brand-mark">S</span><span>SAKAN <b>EUROPE</b></span></Link>
    <h1>Welcome back.</h1><p className="auth-subtitle">Sign in to your SAKAN EUROPE account.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} /></label>
      {message && <p role="status" className={error ? "auth-message auth-error" : "auth-message"}>{message}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "SIGNING IN…" : "SIGN IN"}</button>
    </form>
    <p className="auth-switch">New to SAKAN? <Link href="/signup">Create your account</Link></p>
    <Link href="/" className="auth-back">← BACK TO THE COLLECTION</Link>
  </section></main>;
}
