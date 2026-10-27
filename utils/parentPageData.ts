import { normalizePageUrl } from "@/utils/pageUrl";

export type ParentPageData = { type: "commentsyParentSiteData"; title: string; url: string };

export function parseParentPageData(value: unknown): ParentPageData | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<ParentPageData>;
  const url = normalizePageUrl(data.url);
  if (data.type !== "commentsyParentSiteData" || !url || typeof data.title !== "string" || !data.title.trim()) return null;
  return { type: data.type, title: data.title, url };
}

/** Ask the host again at submission time, including after client-side navigation. */
export function requestParentPageData(): Promise<ParentPageData> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", receive);
      reject(new Error("Could not read the original page address. Reload the page and check the Commentsy integration script."));
    }, 3000);
    function receive(event: MessageEvent) {
      if (event.source !== window.parent) return;
      const data = parseParentPageData(event.data);
      if (!data) return;
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      resolve(data);
    }
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "pingCommentsyParent" }, "*");
  });
}
