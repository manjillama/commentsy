import { publicPageMetadata } from "@/utils/seo";
import { withSiteLayout } from "@/hoc";
import Link from "next/link";

export const metadata = publicPageMetadata(
  "Add Comments to Your Website | Commentsy Docs",
  "Learn how to embed Commentsy, configure authorized domains, customize comment themes, and moderate website comments and replies.",
  "/docs"
);

const sections = [
  { id: "quick-start", title: "Add comments to your site" },
  { id: "identifiers", title: "Page identifiers" },
  { id: "appearance", title: "Themes and appearance" },
  { id: "comments", title: "Posting and moderation" },
  { id: "troubleshooting", title: "Troubleshooting" },
];

function DocsPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="border-b">
        <div className="max-w-screen-lg mx-auto px-[15px] py-12">
          <h1 className="text-4xl font-semibold">Commentsy Documentation</h1>
          <p className="mt-4 text-neutral-600 max-w-2xl">
            Add a conversation to each page of your website, match your
            site&apos;s colors, and manage comments from your dashboard.
          </p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-10 grid gap-10 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Documentation sections">
          <p className="font-semibold mb-3">On this page</p>
          <ul className="space-y-3 text-sm text-neutral-600">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:text-black underline underline-offset-4">
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12 text-neutral-700 leading-relaxed min-w-0 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-black [&_h2]:mb-4 [&_h3]:font-semibold [&_h3]:text-black [&_section]:scroll-mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-black [&_code]:break-words [&_code]:text-sm [&_code]:bg-neutral-100 [&_code]:rounded [&_code]:px-1">
          <section id="quick-start" aria-labelledby="quick-start-title">
            <h2 id="quick-start-title">Add comments to your site</h2>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <Link href="/signup">Create an account</Link> or <Link href="/signin">sign in</Link>,
                then open your <Link href="/dashboard">dashboard</Link>.
                In <strong>Your sites</strong>, create an app for your website.
              </li>
              <li>
                Enter a name, description, and authorized domains. Use your
                website&apos;s full origin, such as <code>https://www.example.com</code>,
                without a path or trailing slash. Add each origin you use,
                including <code>https://example.com</code> if you also serve that
                address. For local testing, include the port, for example <code>http://localhost:5500</code>.
              </li>
              <li>
                Open the app to find its integration instructions. Copy the
                iframe snippet into the HTML where you want comments to appear.
                Replace <code>{"{{IDENTIFIER}}"}</code> with a unique, stable
                identifier for the current page.
              </li>
              <li>
                Copy the JavaScript snippet into your page&apos;s HTML <code>{"<head>"}</code>.
                It adjusts the widget height and shares the page title and URL
                with Commentsy. Include both snippets for the integration to work
                correctly. If you use an external JavaScript file, omit the
                surrounding <code>{"<script>"}</code> tags.
              </li>
              <li>
                Load your website and post a test comment. Repeat the iframe
                integration on other pages, giving each page its own identifier.
              </li>
            </ol>
          </section>

          <section id="identifiers" aria-labelledby="identifiers-title">
            <h2 id="identifiers-title">Page identifiers</h2>
            <p>
              The <code>identifier</code> parameter chooses the conversation
              within your app. For a blog post, use a value such as <code>my-first-post</code>
              or a permanent post ID. Reusing an identifier in the same app
              shares the same comments across those pages.
            </p>
            <p className="mt-3">
              Keep identifiers stable when you rename a page or change its URL.
              Changing an identifier opens a different conversation; it does not
              move existing comments. URL-encode values that contain spaces or
              special characters before putting them in the iframe URL.
            </p>
          </section>

          <section id="appearance" aria-labelledby="appearance-title">
            <h2 id="appearance-title">Themes and appearance</h2>
            <p>
              Set <code>theme=light</code> or <code>theme=dark</code> in the iframe
              URL to choose a theme. Remove the theme parameter to use the
              visitor&apos;s device preference. Open your app&apos;s <strong>Appearance </strong>
              page to customize the colors for each theme.
            </p>
            <p className="mt-3">
              Update authorized domains, the app name, and its description in
              the app&apos;s <strong>Settings</strong> page.
            </p>
          </section>

          <section id="comments" aria-labelledby="comments-title">
            <h2 id="comments-title">Posting and moderation</h2>
            <p>
              Visitors can post as guests or sign in to manage their own comments.
              Sign in before posting to retain author controls: guest comments
              cannot be claimed by signing in later. A comment or reply can
              contain up to 5,000 characters and one GIF, when the GIF picker is
              configured on your Commentsy instance.
            </p>
            <p className="mt-3">
              Open your app&apos;s <strong>Comments</strong> page to review and
              moderate conversations. Only approved comments appear in the widget.
              Deleting a comment replaces its content with a notice. Existing replies
              remain visible, but new replies are closed. Threads show the first
              three replies; select View replies to load more.
              Your dashboard separately lists comments you posted while signed in.
            </p>
          </section>

          <section id="troubleshooting" aria-labelledby="troubleshooting-title">
            <h2 id="troubleshooting-title">Troubleshooting</h2>
            <div className="space-y-6">
              <div>
                <h3>The widget shows an unauthorized message</h3>
                <p className="mt-2">
                  Check the app code in your iframe URL and the authorized domains
                  in Settings. Match the host page&apos;s protocol, hostname, and
                  port exactly. Ensure your website sends a referrer with iframe
                  requests; a policy that suppresses it can prevent authorization.
                </p>
              </div>
              <div>
                <h3>Comments appear on the wrong page</h3>
                <p className="mt-2">
                  Check that each page has its own identifier and that you replaced
                  the placeholder in the iframe URL. Pages using the same app and
                  identifier share a conversation.
                </p>
              </div>
              <div>
                <h3>The widget height does not adjust</h3>
                <p className="mt-2">
                  Check that you included the generated JavaScript snippet and
                  kept the iframe ID as <code>commentsyIframe</code>. If your site
                  blocks inline scripts, put the script contents in an allowed
                  external JavaScript file.
                </p>
              </div>
              <div>
                <h3>I signed in, but the widget still shows me as a guest</h3>
                <p className="mt-2">
                  Sign in to Commentsy in a separate tab, then return to the widget
                  and select <strong>Already signed in? Connect</strong>. Allow
                  browser storage access if prompted. Browser cookie policies can
                  restrict embedded sign-in; guest posting remains available if
                  access is denied.
                </p>
                <p className="mt-3">
                  For local HTTP testing, use the same hostname for both sites,
                  such as localhost on different ports. Do not mix localhost with
                  127.0.0.1. Test cross-site embedded sign-in with HTTPS on both
                  sites.
                </p>
              </div>
            </div>
            <p className="mt-6">
              Still need help? <Link href="/contact">Get in touch</Link> with
              the page URL and a description of what you see.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withSiteLayout(DocsPage);
