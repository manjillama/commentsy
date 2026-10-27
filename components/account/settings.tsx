"use client";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { AVATAR_BACKGROUND_COLORS } from "@/interfaces/IUser";
import api from "@/utils/api";
import Avatar from "@/components/ui/avatar";

type Account = {
  name: string; email: string; provider: string; image?: string;
  avatarBackgroundColor: typeof AVATAR_BACKGROUND_COLORS[number];
};
const inputClass = "border border-neutral-300 w-full rounded-lg p-3 mt-2 bg-white disabled:opacity-60";
const buttonClass = "bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 disabled:opacity-50";

export default function AccountSettings({ account }: { account: Account }) {
  const { update } = useSession();
  const [profile, setProfile] = useState({ name: account.name, avatarBackgroundColor: account.avatarBackgroundColor });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const dirty = profile.name !== savedProfile.name || profile.avatarBackgroundColor !== savedProfile.avatarBackgroundColor;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setProfileError(""); setProfileMessage("");
    try {
      const response = await api.patch<Account>("/api/account", profile);
      if (response.status !== "success") { setProfileError(response.errors.join(" ") || response.message); return; }
      const next = { name: response.data.name, avatarBackgroundColor: response.data.avatarBackgroundColor };
      setProfile(next); setSavedProfile(next);
      setProfileMessage("Profile saved.");
      try { await update(); } catch { setProfileMessage("Profile saved. Reload to refresh your account menu."); }
    } finally { setSaving(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPasswordError(""); setPasswordMessage("");
    const values = new FormData(event.currentTarget);
    const currentPassword = String(values.get("currentPassword") ?? "");
    const newPassword = String(values.get("newPassword") ?? "");
    if (newPassword !== values.get("confirmPassword")) { setPasswordError("Your new passwords do not match."); return; }
    setChangingPassword(true);
    try {
      const response = await api.post("/api/account", { currentPassword, newPassword });
      if (response.status !== "success") { setPasswordError(response.errors.join(" ") || response.message); return; }
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Password updated.");
    } finally { setChangingPassword(false); }
  }

  return <div className="space-y-8 max-w-2xl">
    <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7" aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="text-xl font-semibold">Public profile</h2>
      <p className="text-sm text-neutral-500 mt-2 mb-6">Your name and avatar appear alongside your comments.</p>
      <form onSubmit={saveProfile} className="space-y-5">
        <div className="flex items-center gap-3"><Avatar user={{ name: profile.name, image: account.image, avatarBackgroundColor: profile.avatarBackgroundColor }} /><span className="text-sm font-medium">{profile.name || "Your name"}</span></div>
        <label className="block text-sm font-medium">Display name<input name="name" autoComplete="name" required maxLength={50} value={profile.name} onChange={event => { setProfile({ ...profile, name: event.target.value }); setProfileMessage(""); }} className={inputClass} disabled={saving} /></label>
        <fieldset disabled={saving}><legend className="text-sm font-medium mb-3">Avatar color</legend>
          <div className="flex flex-wrap gap-3">{AVATAR_BACKGROUND_COLORS.map(color => <button key={color} type="button" aria-label={`Avatar color ${color}`} aria-pressed={profile.avatarBackgroundColor === color} onClick={() => { setProfile({ ...profile, avatarBackgroundColor: color }); setProfileMessage(""); }} style={{ backgroundColor: color }} className={`w-8 h-8 rounded-full border-2 border-white ring-offset-2 ${profile.avatarBackgroundColor === color ? "ring-2 ring-black" : "ring-1 ring-neutral-200"}`} />)}</div>
          {account.image && <p className="text-xs text-neutral-500 mt-3">Your provider photo is shown when available. This color is used for your initials avatar.</p>}
        </fieldset>
        {profileError && <p role="alert" className="text-sm text-red-700">{profileError}</p>}
        <div className="flex flex-wrap gap-3 items-center"><button className={buttonClass} disabled={saving || !dirty}>{saving ? "Saving…" : "Save profile"}</button><p role="status" className="text-sm text-neutral-600">{profileMessage}</p></div>
      </form>
    </section>
    <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7" aria-labelledby="signin-heading">
      <h2 id="signin-heading" className="text-xl font-semibold">Sign-in details</h2>
      <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-neutral-500">Email</dt><dd className="mt-1 break-all">{account.email}</dd></div><div><dt className="text-neutral-500">Sign-in method</dt><dd className="mt-1">{account.provider === "credentials" ? "Email and password" : account.provider === "github" ? "GitHub" : "Google"}</dd></div></dl>
      {account.provider !== "credentials" && <p className="text-sm text-neutral-500 mt-5">Manage your password through your {account.provider === "github" ? "GitHub" : "Google"} account.</p>}
    </section>
    {account.provider === "credentials" && <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7" aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-xl font-semibold">Change password</h2><p className="text-sm text-neutral-500 mt-2 mb-5">Choose a new password with at least 8 characters.</p>
      <form onSubmit={changePassword} className="space-y-4">
        {([ ["currentPassword", "Current password"], ["newPassword", "New password"], ["confirmPassword", "Confirm new password"] ] as const).map(([name, label]) => <label key={name} className="block text-sm font-medium">{label}<input name={name} type="password" autoComplete={name === "currentPassword" ? "current-password" : "new-password"} required minLength={name === "currentPassword" ? undefined : 8} maxLength={100} value={passwords[name]} onChange={event => setPasswords({ ...passwords, [name]: event.target.value })} className={inputClass} disabled={changingPassword} /></label>)}
        {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
        <div className="flex flex-wrap gap-3 items-center"><button disabled={changingPassword} className={buttonClass}>{changingPassword ? "Updating…" : "Update password"}</button><p role="status" className="text-sm text-neutral-600">{passwordMessage}</p></div>
      </form>
    </section>}
  </div>;
}
