import { normalizePageUrl } from "@/utils/pageUrl";

/** The host page sends its title and URL to the Commentsy iframe. */
export type ParentPageData = {
  type: "commentsyParentSiteData";
  title: string;
  url: string;
};

/** Validate postMessage data before using it as comment page metadata. */
export function parseParentPageData(value: unknown): ParentPageData | null {
  if (!value || typeof value !== "object") return null;

  const message = value as Partial<ParentPageData>;
  const isPageDataMessage = message.type === "commentsyParentSiteData";
  const pageTitle = message.title;
  const hasPageTitle = typeof pageTitle === "string" && pageTitle.trim().length > 0;
  const pageUrl = normalizePageUrl(message.url);

  // Reject unrelated messages, empty titles, and invalid or non-HTTP(S) URLs.
  if (!isPageDataMessage || !hasPageTitle || !pageUrl) return null;

  return {
    type: "commentsyParentSiteData",
    title: pageTitle,
    url: pageUrl,
  };
}

/**
 * The iframe cannot directly read a cross-origin host page's location or title.
 * Ask the integration script through postMessage instead. Request fresh data
 * before posting so navigation on the host page doesn't leave a stale URL.
 */
export function requestParentPageData(): Promise<ParentPageData> {
  return new Promise((resolve, reject) => {
    function stopWaiting() {
      clearTimeout(responseTimeout);
      window.removeEventListener("message", handleParentMessage);
    }

    function handleParentMessage(event: MessageEvent) {
      // Only accept replies from the window containing this iframe.
      if (event.source !== window.parent) return;

      const pageData = parseParentPageData(event.data);
      if (!pageData) return;

      stopWaiting();
      resolve(pageData);
    }

    // Don't leave comment submission waiting forever if the host script is missing.
    const responseTimeout = setTimeout(() => {
      stopWaiting();
      reject(new Error(
        "Could not read the original page address. Reload the page and check the Commentsy integration script.",
      ));
    }, 3000);

    // Listen before asking, so a fast reply cannot be missed.
    window.addEventListener("message", handleParentMessage);
    // The host origin varies by customer. This message contains no sensitive data;
    // authorized-domain checks are performed separately by the server.
    window.parent.postMessage({ type: "pingCommentsyParent" }, "*");
  });
}
