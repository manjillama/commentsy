"use client";
import { CopyButton } from "./copy-button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function HtmlCode({ appCode }: { appCode: string }) {
  const htmlCode =
    `<!-- 
  Replace {{IDENTIFIER}} with your page's unique identifier variable
  The identifier you pass will be used to create a comments group
  For e.g. ` +
    process.env.NEXT_PUBLIC_SITE_URL +
    "/" +
    appCode +
    `?identifier=my-new-blog-post
  -->
<iframe
  scrolling="no"
  frameborder="0"
  id="commentsyIframe"
  src="` +
    process.env.NEXT_PUBLIC_SITE_URL +
    "/embed/" +
    appCode +
    `?identifier={{IDENTIFIER}}&theme=light"
  style="width:100%;border:none;overflow:hidden"
/>`;
  return (
    <div className="relative">
      <CopyButton textToCopy={htmlCode} />
      <SyntaxHighlighter language="html">{htmlCode}</SyntaxHighlighter>
    </div>
  );
}
