"use client";
import { CopyButton } from "./copy-button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function JsCode() {
  const jsCode =
    `<script>
  /**
   * Important!!! Do not modify this code
   * Paste this JavaScript code snippet as it is inside your HTML <head> tag
   * or
   * Paste it into an external JavaScript file then include it inside your HTML <head> tag
   **/
  window.addEventListener("message", (event) => {
    const iframe = document.getElementById("commentsyIframe");
    if (iframe && event.data) {
      if (event.data.type === "commentsyResize" && event.data.height) {
        iframe.style.height = \`\${event.data.height}px\`;
      }
      if (event.data.type === "pingCommentsyParent") {
        iframe.contentWindow.postMessage(
          {
            type: "commentsyParentSiteData",
            title: document.title,
            url: window.location.href.split("?")[0],
          },
          "` +
    process.env.NEXT_PUBLIC_SITE_URL +
    `"
        );
      }
    }
  });
</script>`;
  return (
    <div className="relative">
      <CopyButton textToCopy={jsCode} />
      <SyntaxHighlighter language="html">{jsCode}</SyntaxHighlighter>
    </div>
  );
}
