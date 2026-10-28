"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import { fetchEmbedUser, hasEmbedStorageAccess, requestEmbedStorageAccess, missingEmbedSessionMessage } from "@/utils/embedSession";

type EmbedSessionState = {
  supported: boolean;
  busy: boolean;
  message: string;
  enable: () => Promise<void>;
};

export const EmbedSessionContext = createContext<EmbedSessionState | null>(null);
export const useEmbedSessionContext = () => useContext(EmbedSessionContext);

export function useEmbedSession(initialUser?: Session["user"]) {
  const [user, setUser] = useState(initialUser);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const mounted = useRef(false);
  const generation = useRef(0);

  const invalidateRequests = useCallback(() => { generation.current++; }, []);

  const refresh = useCallback(async () => {
    const current = ++generation.current;
    const nextUser = await fetchEmbedUser();
    if (mounted.current && current === generation.current) setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const embedded = window.self !== window.top;
    setSupported(embedded && typeof document.requestStorageAccess === "function");
    async function check() {
      try {
        if (await hasEmbedStorageAccess(document, embedded)) await refresh();
      } catch {
        // Guests can continue posting if cookie access or session checks fail.
      }
    }
    void check();
    function onVisibility() { if (document.visibilityState === "visible") void check(); }
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      invalidateRequests();
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, invalidateRequests]);

  async function enable() {
    setBusy(true);
    setMessage("");
    try {
      // Do not put an async permission check before this user-activated request.
      await requestEmbedStorageAccess(document);
      const nextUser = await refresh();
      if (!nextUser) setMessage(missingEmbedSessionMessage());
    } catch {
      setMessage("Signed-in comments could not be enabled. Sign in to Commentsy in a new tab, then try again and allow access if asked. You can still comment as a guest.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  return { user, controls: { supported, busy, message, enable } };
}
