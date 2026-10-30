"use client";
import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import FormFeedback from './ui/form-feedback';

export default function VerifyEmailForm() {
  const initialized = useRef(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [fromLogin, setFromLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    // Strict Mode replays effects after the URL fragment has been cleared.
    if (initialized.current) return;
    initialized.current = true;
    const fragment = window.location.hash.slice(1);
    if (fragment.startsWith('email=')) {
      setEmail(new URLSearchParams(fragment).get('email') ?? '');
      setFromLogin(true);
    }
    window.history.replaceState(null, '', window.location.pathname);
    if (fragment && !fragment.startsWith('email=')) {
      void api.post<{ message: string }>('/api/verify-email', { token: fragment }).then(result => {
        if (result.status === 'success') {
          window.location.replace('/signin?emailConfirmed=1');
        } else {
          setError(true);
          setMessage(result.message);
          setVerifying(false);
        }
      });
    } else setVerifying(false);
  }, []);
  async function sendConfirmation() {
    if (busy || cooldown > 0) return;
    setBusy(true);
    setMessage('');
    const result = await api.post<{ message: string }>('/api/resend-verification', { email: email.trim() });
    setError(result.status !== 'success');
    if (result.status === 'success') {
      setSent(true);
      setCooldown(60);
    } else setMessage(result.message);
    setBusy(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendConfirmation();
  }
  return <div className="max-w-md mx-auto px-5 py-16">
    <span className="text-xs tracking-widest text-neutral-500">YOUR COMMENTSY</span>
    <h1 className="text-3xl font-semibold tracking-tight mt-3">{verifying ? 'Confirming your email…' : sent ? 'Check your inbox.' : 'Confirm your email.'}</h1>
    <p className="my-5 text-sm leading-6 text-neutral-600">{verifying ? 'Please wait while we confirm your email address.' : sent ? 'If this email belongs to an unverified account, a confirmation link is on its way. Open it to confirm your email, then sign in. Check your spam folder too.' : fromLogin ? 'Your account is created, but your email still needs confirmation. Open the confirmation email in your inbox, or send a new link below.' : 'Need a new confirmation link? Enter the email you used to sign up. Links expire in 24 hours.'}</p>
    <FormFeedback message={message} error={error} />
    {!verifying && !sent && <form onSubmit={submit} className="space-y-4 my-5">
      <label className="block text-sm">Email<input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required maxLength={320} className="mt-2 border border-neutral-300 rounded-lg p-3 w-full" /></label>
      <button disabled={busy || cooldown > 0} className="bg-black text-white rounded-lg p-3 w-full disabled:opacity-60">{busy ? 'Please wait…' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send confirmation link'}</button>
    </form>}
    {sent && <div className="my-6 space-y-4">
      <p className="text-sm text-neutral-600 break-words">{email}</p>
      <button type="button" disabled={busy || cooldown > 0} onClick={sendConfirmation} className="w-full rounded-lg border border-neutral-300 p-3 text-sm disabled:opacity-50">{busy ? 'Sending…' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend confirmation email'}</button>
      <button type="button" onClick={() => { setSent(false); setMessage(''); }} className="text-sm underline underline-offset-4">Use a different email</button>
    </div>}
    <Link href="/signin" className="text-sm underline underline-offset-4">Back to sign in</Link>
  </div>;
}
