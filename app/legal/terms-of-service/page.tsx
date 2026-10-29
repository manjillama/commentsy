import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_DATA.title}`,
};

const sections: [string, string[]][] = [
  [
    "About these terms",
    [
      "These terms govern use of the hosted Commentsy website, dashboard, and embedded commenting service at commentsy.com, maintained by Manjil Tamang. By using the service, you agree to these terms. If you do not agree, do not use the hosted service. Independently hosted copies are subject to their operators’ terms.",
      "Commentsy is a pilot project. Features, availability, and service limits may change. For a deployment you control, you can fork and self-host the software subject to its repository license."
    ]
  ],
  [
    "Accounts and eligibility",
    [
      "You must be at least 13 and meet any higher minimum age required for using the service where you live. If you use Commentsy for an organization, you must have authority to act for it.",
      "Provide accurate account information and protect your password and connected Google or GitHub account. You are responsible for activity you authorize through your account. Do not impersonate others, share access without permission, or attempt to access another person’s account. Contact hello@manjiltamang.com if you suspect unauthorized access."
    ]
  ],
  [
    "Your content",
    [
      "You retain your rights in comments and other content you submit. You grant Commentsy permission to store, reproduce, format, and display that content as needed to operate the service, distribute it through embedded discussions, and support moderation. This permission does not transfer ownership of your content.",
      "Only submit content you have the right to share. You are responsible for its accuracy and legality. Comments are public: other people may read, copy, or quote them. Do not submit confidential information or another person’s private data without authorization."
    ]
  ],
  [
    "Acceptable use",
    [
      "Do not post unlawful content, threats, harassment, hateful abuse, sexual exploitation of children, non-consensual intimate material, or content that infringes another person’s rights. Do not use Commentsy for spam, fraud, deceptive impersonation, or distributing malware.",
      "Do not bypass authentication, moderation, origin restrictions, or other security controls; harvest personal information; or deliberately overload or disrupt the service. Report suspected security issues privately to hello@manjiltamang.com.",
      "Communities using the widget may set additional rules. Follow those rules when participating on their websites."
    ]
  ],
  [
    "Site owners and moderation",
    [
      "Embed Commentsy only on websites you own or are authorized to manage. You are responsible for configuring authorized domains, complying with obligations that apply to your website, explaining your use of the widget to visitors, and moderating discussions you manage.",
      "Site owners can moderate, hide, mark as spam, or remove comments. We may restrict content or accounts to address abuse, security risks, legal requirements, or violations of these terms. Moderation does not mean we endorse other content, and we cannot promise that every submission will be reviewed."
    ]
  ],
  [
    "Privacy and deletion",
    [
      "Our Privacy Policy explains the information processed by the service, including sign-in data, guest information, comments, and cookies. Read it before submitting personal information.",
      "Comment deletion hides content through the service but may retain a database record to preserve discussion structure and support service operations. It cannot remove copies others have made. Account deletion and further data removal requests can be sent to hello@manjiltamang.com; there is no self-service account deletion feature."
    ]
  ],
  [
    "Third-party services and open source software",
    [
      "Google, GitHub, KLIPY, and websites embedding Commentsy operate independently and have their own terms and privacy policies. We do not control their availability or content. Choosing a GIF does not give you ownership of its underlying media.",
      "The Commentsy source code is governed by the license included in its repository. These hosted-service terms do not replace or restrict permissions granted by that license. Rights in third-party code, media, and trademarks remain with their owners."
    ]
  ],
  [
    "Availability and responsibility",
    [
      "The hosted service is provided as available, without a promise of uninterrupted access, permanent storage, or fitness for a particular purpose. To the extent permitted by applicable law, we disclaim implied warranties and are not responsible for indirect or consequential losses, including lost profits or lost data, arising from use of the service.",
      "Nothing in these terms excludes liability or limits consumer rights where doing so is prohibited by law. Keep your own copies of important content and assess whether a pilot service meets your needs."
    ]
  ],
  [
    "Ending use and changes",
    [
      "You may stop using Commentsy at any time. Site owners can remove the embed from their websites. We may suspend access or discontinue the hosted service, including where needed to protect users or maintain security. Retention of existing records is described in the Privacy Policy.",
      "We may revise these terms as the service changes. We will update the date above and describe material changes on the service. Continued use after revised terms take effect means you accept them, to the extent permitted by applicable law."
    ]
  ],
  [
    "Contact",
    [
      "For questions about these terms, moderation concerns, copyright complaints, or account requests, email hello@manjiltamang.com. Include enough detail to identify the relevant account or content, but do not send passwords, access tokens, or other secrets."
    ]
  ]
];

function TermsOfService() {
  return (
    <article className="bg-white min-h-screen text-neutral-700">
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <p className="text-sm mb-3">Commentsy · Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-950">Terms of Service</h1>
        <p className="mt-4 text-sm">Effective October 28, 2026</p>
        <nav aria-label="Legal pages" className="flex flex-wrap gap-5 my-8 underline">
          <Link href="/">About Commentsy</Link>
          <Link href="/legal/privacy-policy">Privacy Policy</Link>
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

export default withSiteLayout(TermsOfService);
