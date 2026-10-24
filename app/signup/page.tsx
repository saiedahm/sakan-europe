"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError(false);
    if (password !== confirm) { setError(true); setMessage("Passwords do not match."); return; }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` }
      });
      if (authError) throw authError;
      if (data.session) {
        setMessage("Your account is ready. Welcome to SAKAN EUROPE.");
        window.location.assign("/");
      } else {
        setMessage("Registration received. Check your email and confirm your address before signing in.");
      }
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand"><span className="brand-mark">S</span><span>SAKAN <b>EUROPE</b></span></Link>
    <h1>Your home, your story.</h1><p className="auth-subtitle">Create your SAKAN EUROPE account to join our private customer community.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} /></label>
      {message && <p role="status" className={error ? "auth-message auth-error" : "auth-message"}>{message}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}</button>
    </form>
    <p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p>
    <Link href="/" className="auth-back">← BACK TO THE COLLECTION</Link>
  </section></main>;
}
