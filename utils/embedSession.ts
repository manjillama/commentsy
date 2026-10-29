import type { Session } from "next-auth";

type StorageAccessDocument = {
  hasStorageAccess?: () => Promise<boolean>;
  requestStorageAccess?: () => Promise<void>;
};

export async function hasEmbedStorageAccess(document: StorageAccessDocument, embedded: boolean) {
  if (!embedded || !document.hasStorageAccess) return true;
  return document.hasStorageAccess();
}

export async function requestEmbedStorageAccess(document: StorageAccessDocument) {
  // Invoke directly from the click handler, before any await consumes activation.
  if (document.requestStorageAccess) await document.requestStorageAccess();
}

export async function fetchEmbedUser(): Promise<Session["user"] | undefined> {
  const response = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Could not check your sign-in. Please try again.");
  const session = await response.json();
  return session?.user?.id ? session.user : undefined;
}

export function missingEmbedSessionMessage() {
  return "We couldn’t connect your account. Use the Sign in link above, then return here and select Connect if needed. You can also continue as a guest.";
}
