import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_DATA.title}`,
};

const sections: [string, string[]][] = [
  [
    "Who operates Commentsy",
    [
      "Commentsy is an open source commenting service maintained by Manjil Tamang. This policy covers the service at commentsy.com, its dashboard, and its embedded comment widgets. Independently hosted copies are operated by their own owners and may follow different policies. For privacy questions or data requests, email hello@manjiltamang.com."
    ]
  ],
  [
    "Information we collect",
    [
      "Account information: your name, email address, profile image when provided, sign-in provider, avatar settings, and account timestamps. For email/password accounts, we store a password hash rather than your plaintext password.",
      "Google and GitHub sign-in: we receive basic identity information, including a provider identifier, name, email address, and profile image where available. We use this to authenticate you and create or update your Commentsy profile. Our Google sign-in requests basic identity scopes, not access to Gmail messages, Drive files, contacts, or calendars.",
      "Comments and site information: comment text, replies, GIF attachment metadata and URLs, posting and editing times, moderation status, and the associated page title, URL, and discussion identifier. Guest posting collects the name and email address you enter. Site owners provide site names, descriptions, authorized origins, and appearance settings.",
      "Technical information: requests pass through our hosting and database providers. They may process IP addresses, browser and request information, and operational logs to deliver and protect the service. Application logs record API paths, response status, timing, and diagnostic error codes."
    ]
  ],
  [
    "How we use information",
    [
      "We use information to sign users in, maintain sessions, display comments and profiles, connect discussions to website pages, provide account and site management, support moderation, investigate errors and abuse, and respond to support or privacy requests. Google account information is used for authentication and the associated user-facing profile features, not advertising."
    ]
  ],
  [
    "Public comments and sharing",
    [
      "Comments are intended for public discussion. Your display name, avatar or profile image, comment text, GIFs, and timestamps may be visible to readers, website owners, and search engines. Do not post confidential information or personal data you do not want others to see.",
      "Guest posting is not anonymous to the service: we store the name and email address you submit. Your guest name and avatar are shown with your comment. Guest email addresses are excluded from comment responses, including public discussions and moderation responses.",
      "We use infrastructure providers, including Vercel for hosting and MongoDB Atlas for database storage, to operate the hosted service. These providers process information as needed to deliver their services. Google and GitHub handle their own authentication pages under their respective privacy policies. We may disclose information where legally required or necessary to address fraud, abuse, or security incidents."
    ]
  ],
  [
    "GIFs and third-party websites",
    [
      "The optional GIF picker uses KLIPY. Searches, media requests, and search/share events are sent from your browser to KLIPY, with an anonymous per-page identifier. Media requests can expose your IP address and browser information to that provider. Commentsy stores the selected GIF URL and metadata, rather than a copy of the GIF file.",
      "Websites embedding Commentsy have their own privacy practices. This policy covers Commentsy processing; it does not govern the host website, its analytics, or other third-party services."
    ]
  ],
  [
    "Cookies and browser storage",
    [
      "Commentsy uses cookies for authentication, session continuity, and security checks during sign-in. An embedded widget may ask for browser storage access to recognize an existing Commentsy session. You can decline that permission or block cookies, although signed-in features may then be unavailable. Signing out ends the session in that browser; browser settings let you clear stored cookies."
    ]
  ],
  [
    "Retention and deletion",
    [
      "Account, site, and comment records are retained while they support the service and until removed through an applicable deletion process. We do not currently apply a fixed automatic retention period to all records.",
      "Deleting a comment in the interface marks it as deleted and hides its content from normal public display; it does not immediately erase the underlying database record. Replies may remain in the discussion. Copies made by other users or search engines may remain outside our control.",
      "To request access, correction, account deletion, or removal of retained data, contact hello@manjiltamang.com. There is currently no self-service account deletion feature. We may ask for information needed to verify that the request concerns your account or content. Some information may need to be retained for security, legal obligations, or resolving disputes, and provider backups may retain copies according to their backup processes."
    ]
  ],
  [
    "Your choices and security",
    [
      "You can edit supported profile fields and manage your signed-in comments from the dashboard. You can revoke Google or GitHub access in that provider’s account settings; revoking access does not by itself delete records already stored by Commentsy. Additional privacy rights may apply depending on where you live; contact us to exercise them.",
      "We use HTTPS, password hashing, and session controls to protect information. No online service or storage system can guarantee complete security. Keep your password and sign-in provider account secure."
    ]
  ],
  [
    "Children and policy changes",
    [
      "Commentsy is not intended for children under 13. If you believe a child has provided personal information, contact us so we can investigate and address it.",
      "We may update this policy as the service changes. The date above identifies the current version. Material changes will be described on the service. For questions, contact hello@manjiltamang.com."
    ]
  ]
];

function PrivacyPolicy() {
  return (
    <article className="bg-white min-h-screen text-neutral-700">
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <p className="text-sm mb-3">Commentsy · Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-950">Privacy Policy</h1>
        <p className="mt-4 text-sm">Effective October 28, 2026</p>
        <nav aria-label="Legal pages" className="flex flex-wrap gap-5 my-8 underline">
          <Link href="/">About Commentsy</Link>
          <Link href="/legal/terms-of-service">Terms of Service</Link>
          <a href="mailto:hello@manjiltamang.com">Contact</a>
        </nav>
        {sections.map(([heading, paragraphs], index) => (
          <section key={heading} className="mt-8">
            <h2 className="text-xl font-semibold text-neutral-950">{index + 1}. {heading}</h2>
            {paragraphs.map(paragraph => (
              <p key={paragraph} className="mt-3 leading-7">{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

export default withSiteLayout(PrivacyPolicy);
