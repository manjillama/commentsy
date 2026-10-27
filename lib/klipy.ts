import { CommentGif, isCommentGif } from "@/utils/gif";

export const gifsEnabled = Boolean(process.env.NEXT_PUBLIC_KLIPY_API_KEY);

function endpoint(path: string) {
  return new URL(`https://api.klipy.com/api/v1/${encodeURIComponent(process.env.NEXT_PUBLIC_KLIPY_API_KEY ?? "")}/gifs/${path}`);
}

// A per-page anonymous identifier; no account or email is sent to KLIPY.
let customerId: string;
function getCustomerId() {
  return customerId ?? (customerId = crypto.randomUUID());
}

type KlipyItem = {
  id: string | number;
  slug: string;
  title?: string;
  file?: Record<string, { gif?: { url?: string } }>;
};

export async function searchGifs(query: string, page: number, signal: AbortSignal): Promise<{ gifs: CommentGif[]; hasNext: boolean }> {
  const url = endpoint(query ? "search" : "trending");
  url.search = new URLSearchParams({ page: String(page), per_page: "12", customer_id: getCustomerId(), locale: navigator.language.replace("-", "_"), ...(query ? { q: query } : {}) }).toString();
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("GIF search is unavailable. Please try again later.");
  const body = await response.json();
  if (!body.result || !Array.isArray(body.data?.data)) throw new Error("GIF search is unavailable. Please try again later.");
  const gifs = body.data.data.map((item: KlipyItem): CommentGif => ({
    provider: "klipy", id: String(item.id), slug: item.slug,
    title: (item.title ?? "GIF").slice(0, 300),
    url: item.file?.md?.gif?.url ?? item.file?.sm?.gif?.url ?? item.file?.hd?.gif?.url ?? "",
  }));
  // Never silently filter or reorder a provider's result set.
  if (!gifs.every(isCommentGif)) throw new Error("GIF results could not be displayed. Please try another search.");
  return { gifs, hasNext: body.data.has_next === true || body.data.has_next === 1 };
}

export async function registerGifShare(gif: CommentGif) {
  if (!gifsEnabled) return;
  try {
    await fetch(endpoint(`share/${encodeURIComponent(gif.slug)}`), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: getCustomerId() }), keepalive: true,
    });
  } catch {
    // A reporting failure must not undo a successfully saved comment.
  }
}
