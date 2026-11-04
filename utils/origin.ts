/** Normalize origins without accepting credentials or non-web protocols. */
export function webOrigin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isAuthorizedPage(origins: string[], value: unknown): boolean {
  const origin = webOrigin(value);
  if (origin === null) return false;
  const page = new URL(origin);
  // Only the conventional www prefix is interchangeable; other subdomains stay distinct.
  const hostname = page.hostname.replace(/^www\./, "");
  return origins.some((allowed) => {
    const allowedOrigin = webOrigin(allowed);
    if (allowedOrigin === null) return false;
    const site = new URL(allowedOrigin);
    return (
      site.protocol === page.protocol &&
      site.port === page.port &&
      site.hostname.replace(/^www\./, "") === hostname
    );
  });
}
