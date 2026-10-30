/** Normalize origins without accepting credentials or non-web protocols. */
export function webOrigin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

export function isAuthorizedPage(origins: string[], value: unknown): boolean {
  const origin = webOrigin(value);
  return origin !== null && origins.some(allowed => webOrigin(allowed) === origin);
}
