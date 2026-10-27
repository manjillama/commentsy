export type CommentGif = {
  provider: "klipy";
  id: string;
  slug: string;
  url: string;
  title: string;
};

export function isKlipyMediaUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 4096) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      ["static.klipy.com", "static1.klipy.com", "static2.klipy.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function isCommentGif(value: unknown): value is CommentGif {
  if (!value || typeof value !== "object") return false;
  const gif = value as Partial<CommentGif>;
  return gif.provider === "klipy" && typeof gif.id === "string" && gif.id.length > 0 && gif.id.length <= 200 &&
    typeof gif.slug === "string" && /^[a-z\d_-]{1,250}$/i.test(gif.slug) &&
    typeof gif.title === "string" && gif.title.length <= 300 && isKlipyMediaUrl(gif.url);
}
