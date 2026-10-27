/** Normalize an absolute page URL without double-encoding existing escapes. */
export function normalizePageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 8192 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const input = value.trim();
  if (!/^https?:\/\//i.test(input) || /%(?![\da-f]{2})/i.test(input)) return null;
  try {
    const url = new URL(input);
    if (!url.hostname || url.username || url.password || url.href.length > 8192) return null;
    return url.href;
  } catch {
    return null;
  }
}
