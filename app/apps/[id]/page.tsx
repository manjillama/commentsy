"use client";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function App({ params: { id } }: { params: { id: string } }) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  const htmlCode =
    `<!-- 
  Replace {{IDENTIFIER}} with your page's unique identifier variable
  The identifier you pass will be used to create a comments group
  For e.g. ` +
    process.env.NEXT_PUBLIC_SITE_URL +
    "/" +
    app.code +
    `?identifier=my-new-blog-post
  -->
<iframe
  scrolling="no"
  frameborder="0"
  id="commentsyIframe"
  src="` +
    process.env.NEXT_PUBLIC_SITE_URL +
    "/" +
    app.code +
    `?identifier={{IDENTIFIER}}"
  style="width:100%;border:none;overflow:hidden"
/>`;

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
    <div>
      <header className="border-b py-12">
        <div className="max-w-screen-lg px-[15px] mx-auto">
          <span className="text-sm text-neutral-500">{app.code}</span>
          <h1 className="text-4xl my-3">{app.name}</h1>
          <p className="text-neutral-800">{app.description}</p>
        </div>
      </header>
      <div className="max-w-screen-lg px-[15px] mx-auto py-12">
        <h2 className="text-2xl mb-2 font-semibold">
          Integrate commentsy to your site
        </h2>
        <p className="mb-4 text-neutral-500">
          No external dependencies. Just follow the instructions below and
          you&apos;re done!
        </p>
        <br />
        1. Place the following code inside your HTML where you&apos;d like
        Commentsy to load.
        <div className="relative">
          <CopyButton textToCopy={htmlCode} />
          <SyntaxHighlighter language="html">{htmlCode}</SyntaxHighlighter>
        </div>
        <br />
        2. Place the following JavaScript code inside your HTML head tag. It
        dynamically adjusts the iframe height based on the content inside and
        passes your current URL and page title to commentsy.
        <div className="relative">
          <CopyButton textToCopy={jsCode} />
          <SyntaxHighlighter language="html">{jsCode}</SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <button
      type="button"
      className="absolute top-4 right-4"
      onClick={() => {
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }}
      disabled={isCopied}
    >
      {isCopied ? (
        <CheckIcon width={20} height={20} />
      ) : (
        <CopyIcon width={18} height={18} />
      )}
    </button>
  );
};
