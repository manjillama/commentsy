"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import FormFeedback from "./ui/form-feedback";

export default function PasswordRecoveryForm({ token }: { token?: string }) {
  const resetting = token !== undefined;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") ?? "");
    if (resetting && password !== values.get("confirmPassword")) {
      setError(true); setMessage("Passwords do not match."); return;
    }
    setBusy(true); setMessage("");
    const result = await api.post<{ message: string }>(resetting ? "/api/reset-password" : "/api/forgot-password", resetting
      ? { token, password }
      : { email: String(values.get("email") ?? "").trim() });
    setError(result.status !== "success");
    setMessage(result.status === "success" ? result.data.message : result.message);
    setComplete(result.status === "success");
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <span className="text-xs tracking-widest text-neutral-500">YOUR COMMENTSY</span>
      <h1 className="text-3xl font-semibold tracking-tight mt-3">{resetting ? "Choose a new password." : "Forgot your password?"}</h1>
      <p className="text-sm text-neutral-600 leading-6 mt-4 mb-6">{resetting ? "Enter a new password for your Commentsy account. Reset links expire after 30 minutes." : "Enter the email you used to sign up. Password recovery is available for email-and-password accounts. For Google or GitHub, use that provider to sign in."}</p>
      <FormFeedback message={message} error={error} />
      {!complete && <form onSubmit={submit} className="space-y-5 mt-5">
        {resetting ? <>
          <label className="block text-sm">New password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={100} className="mt-2 border border-neutral-300 w-full rounded-lg p-3" /></label>
          <label className="block text-sm">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={100} className="mt-2 border border-neutral-300 w-full rounded-lg p-3" /></label>
        </> : <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required maxLength={320} className="mt-2 border border-neutral-300 w-full rounded-lg p-3" /></label>}
        <button type="submit" disabled={busy} className="bg-black text-white w-full rounded-lg p-3 disabled:opacity-60">{busy ? "Please wait…" : resetting ? "Reset password" : "Send reset link"}</button>
      </form>}
      <div className="mt-6 flex flex-wrap gap-4 text-sm underline underline-offset-4"><Link href="/signin">Back to sign in</Link>{resetting && <Link href="/forgot-password">Request a new link</Link>}</div>
    </div>
  );
}
