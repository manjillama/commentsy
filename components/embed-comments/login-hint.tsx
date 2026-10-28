"use client";
import { ExternalLinkIcon, PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import { CommentStyles } from "@/interfaces/IApp";
import { ParentSiteData } from "./input-comment";
import { useEmbedSessionContext } from "./embed-session";

export default function LoginHint({ parentSiteData, palette }: {
  parentSiteData: ParentSiteData;
  palette: CommentStyles["light"];
}) {
  const session = useEmbedSessionContext();
  const callbackUrl = parentSiteData?.url ?? process.env.NEXT_PUBLIC_SITE_URL ?? "/";

  return (
    <aside aria-label="Comment account" className="my-4 rounded-lg border p-3 sm:p-4" style={palette.primary}>
      <div className="flex items-start gap-3">
        <PersonIcon aria-hidden="true" className="mt-0.5 shrink-0 opacity-60" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Keep control of your comments</p>
          <p className="text-xs opacity-60 mt-1 leading-relaxed">Sign in before posting to edit or delete later. You can also continue as a guest.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
            <a href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} target="_blank" rel="noreferrer"
              style={palette.accent}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              Sign in <ExternalLinkIcon aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {session?.supported && (
              <button type="button" disabled={session.busy} onClick={session.enable}
                className="inline-flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                {session.busy && <ReloadIcon aria-hidden="true" className="animate-spin" />}
                {session.busy ? "Connecting…" : "Already signed in? Connect"}
              </button>
            )}
          </div>
          <p className="text-xs opacity-50 mt-2 leading-relaxed">
            {session?.supported ? "After signing in, return here. If your account doesn’t connect automatically, select Connect and allow access if asked." : "After signing in, return here to continue."}
          </p>
          {session?.message && (
            <div role="status" aria-live="polite" className="mt-3 border-t pt-3 text-xs leading-relaxed" style={{ borderColor: palette.primary.borderColor }}>
              {session.message}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
