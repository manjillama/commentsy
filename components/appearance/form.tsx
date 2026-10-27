"use client";

import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { CommentStyles, IApp } from "@/interfaces/IApp";
import { DEFAULT_COMMENT_STYLES, parseCommentStyles } from "@/utils/commentStyles";
import { refetchUserApps } from "@/slices/userAppsSlice";
import api from "@/utils/api";
import { Alert } from "@/components/ui";

const fields = [
  { role: "primary", property: "backgroundColor", label: "Background" },
  { role: "primary", property: "color", label: "Text" },
  { role: "accent", property: "backgroundColor", label: "Button background" },
  { role: "accent", property: "color", label: "Button text" },
] as const;

function expandHex(color: string) {
  return color.length === 4
    ? `#${color.slice(1).split("").map(character => character + character).join("")}`
    : color;
}

export default function AppearanceForm({ app }: { app: IApp }) {
  const [styles, setStyles] = useState(() => parseCommentStyles(app.commentStyles));
  const [savedStyles, setSavedStyles] = useState(() => JSON.stringify(parseCommentStyles(app.commentStyles)));
  const [theme, setTheme] = useState<keyof CommentStyles>("light");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const dirty = JSON.stringify(styles) !== savedStyles;
  const palette = styles[theme];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors([]);
    setSaved(false);
    try {
      const response = await api.patch<IApp>(`/api/apps/${app._id}`, {
        commentStyles: JSON.stringify(styles),
      });
      if (response.status === "success") {
        await dispatch(refetchUserApps());
        const persisted = parseCommentStyles(response.data.commentStyles);
        setStyles(persisted);
        setSavedStyles(JSON.stringify(persisted));
        setSaved(true);
      } else setErrors(response.errors);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Comment colors</h2>
        <p className="text-neutral-600">Customize light and dark mode separately. Your embed&apos;s theme setting determines which palette visitors see; otherwise their device preference is used.</p>
      </div>
      {errors.length > 0 && <Alert variant="error"><div role="alert">{errors.join(" ")}</div></Alert>}
      <fieldset disabled={saving} className="space-y-6">
        <div className="flex gap-2" role="group" aria-label="Theme to customize">
          {(["light", "dark"] as const).map(mode => (
            <button key={mode} type="button" aria-pressed={theme === mode}
              onClick={() => setTheme(mode)}
              className={`rounded-lg border px-4 py-2 ${theme === mode ? "bg-black text-white border-black" : "bg-white border-neutral-300"}`}>
              {mode === "light" ? "Light mode" : "Dark mode"}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border rounded-lg p-6 space-y-5">
            {fields.map(({ role, property, label }) => {
              const inputId = `${theme}-${role}-${property}`;
              return (
                <div key={inputId} className="flex items-center justify-between gap-4">
                  <label htmlFor={inputId}>{label}</label>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-neutral-600">{expandHex(palette[role][property])}</span>
                    <input id={inputId} type="color" value={expandHex(palette[role][property])}
                      className="h-10 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1"
                      onChange={event => {
                        setStyles({ ...styles, [theme]: { ...palette, [role]: { ...palette[role], [property]: event.target.value } } });
                        setSaved(false);
                      }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={`${theme}-border`}>Form border</label>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-neutral-600">{expandHex(palette.primary.borderColor ?? "#d4d4d4")}</span>
                <input id={`${theme}-border`} type="color" value={expandHex(palette.primary.borderColor ?? "#d4d4d4")}
                  className="h-10 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1"
                  onChange={event => {
                    setStyles({ ...styles, [theme]: { ...palette, primary: { ...palette.primary, borderColor: event.target.value } } });
                    setSaved(false);
                  }} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">Live preview · {theme} mode</p>
            <div style={{ backgroundColor: palette.primary.backgroundColor, color: palette.primary.color }} className="rounded-lg border border-neutral-300 p-5 text-sm" aria-label={`${theme} mode comment preview`}>
              <h3 className="font-semibold mb-5">1 comment</h3>
              <div style={palette.primary} className="border border-neutral-300 rounded-lg p-3 mb-3"><span className="opacity-60">Add a comment...</span></div>
              <div className="flex justify-end gap-2 mb-6">
                <span style={palette.primary} className="rounded-lg px-4 py-2">Cancel</span>
                <span style={palette.accent} className="rounded-lg px-5 py-2">Comment</span>
              </div>
              <div className="flex gap-3">
                <div className="rounded-full bg-black text-white h-8 w-8 flex items-center justify-center shrink-0">J</div>
                <div><p><strong>Jamie</strong> <span className="text-neutral-500">just now</span></p>
                  <p className="mt-1">Thanks for sharing! This was really helpful.</p>
                  <p className="opacity-50 font-semibold mt-2">Reply</p>
                </div>
              </div>
              <p className="font-semibold text-right mt-6">Powered by commentsy</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button type="button" className="border border-neutral-300 rounded-lg px-4 py-2 hover:bg-neutral-100"
            onClick={() => { setStyles(DEFAULT_COMMENT_STYLES); setSaved(false); setErrors([]); }}>
            Reset both themes to defaults
          </button>
          <button type="submit" disabled={saving || !dirty}
            className="bg-black text-white rounded-lg px-4 py-2 hover:opacity-75 disabled:opacity-50">
            {saving ? "Saving…" : "Save appearance"}
          </button>
        </div>
      </fieldset>
      <p className="text-sm text-neutral-600" role="status" aria-live="polite">
        {saved ? "Appearance saved. Reload your embedded comments to see the changes." : dirty ? "You have unsaved changes. Save to apply them to your embedded comments." : "The default palettes keep the original Commentsy styling."}
      </p>
    </form>
  );
}
