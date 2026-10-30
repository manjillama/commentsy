import { publicPageMetadata } from "@/utils/seo";
import { withSiteLayout } from "@/hoc";
import Link from "next/link";

export const metadata = publicPageMetadata(
  "Terms of Service | Commentsy",
  "Read the terms for using Commentsy and its embeddable website comment system.",
  "/legal/terms-of-service"
);

const sections: [string, string[]][] = [
  [
    "About these terms",
    [
      "These terms govern the hosted Commentsy website, dashboard, and embedded commenting service at commentsy.com, provided as an independent pilot project. Commentsy is a project name, not a separate legal entity; “we”, “us”, and “our” refer to the operator of this hosted service. If you create an account or use the hosted service, you agree to these terms. If you do not agree, do not use the hosted service. If you act for an organization, you confirm that you have authority to bind it.",
      "Commentsy is a free, independent pilot project, not a paid hosting service. No uptime, support response, maintenance schedule, or period of continued operation is promised. Do not rely on it for emergency communications, safety-critical uses, or business operations that require uninterrupted comments or permanent records."
    ]
  ],
  [
    "Hosted service and self-hosted software",
    [
      "Using our hosted service means that we operate the Commentsy instance and process information as described in our Privacy Policy. Site owners remain responsible for their own websites, their configuration, and their moderation decisions. This allocation does not remove obligations that applicable law places on us.",
      "You may instead obtain the source code and self-host it under the MIT license included in the repository. An independent self-hosted operator is responsible for its hosting, security, updates, backups, availability, privacy notices, legal compliance, and user support. We do not operate or monitor an independently hosted instance or undertake to maintain it unless we separately agree in writing.",
      "Self-hosting gives you control over your deployment; it is not a guarantee against security incidents, data loss, legal claims, or other risks. If a self-hosted deployment connects to our hosted service or another provider, that provider’s terms and privacy practices still apply to that connection. These hosted-service terms do not replace or restrict rights granted by the repository license."
    ]
  ],
  [
    "Accounts and eligibility",
    [
      "You must be at least 13 and meet any higher minimum age required for using the service where you live. Do not use the service if applicable law prohibits your use.",
      "Provide accurate account information and protect your password and connected Google or GitHub account. You are responsible for activity you authorize through your account. Do not impersonate others, share access without permission, or attempt to access another person’s account. Contact hello@manjiltamang.com if you suspect unauthorized access."
    ]
  ],
  [
    "Your content and permission to operate the service",
    [
      "You retain your rights in comments and other content you submit. You grant us a non-exclusive, worldwide, royalty-free license to host, store, reproduce, format, transmit, and display that content only as reasonably necessary to operate, secure, and provide the service, including embedded discussions and moderation. This permission does not transfer ownership of your content.",
      "Only submit content you have the right to share. You are responsible for its legality and for obtaining necessary permissions. Comments are public: others may read, copy, or quote them. Do not submit confidential information, credentials, or another person’s private data without authorization.",
      "This permission ends when your content is removed from our systems, except to the extent retention or processing is reasonably necessary for backups, legal obligations, security, or resolving disputes, as described in the Privacy Policy. Copies independently made by others are outside our control."
    ]
  ],
  [
    "Acceptable use",
    [
      "Do not post unlawful content, threats, harassment, hateful abuse, sexual exploitation of children, non-consensual intimate material, or content that infringes another person’s rights. Do not use Commentsy for spam, fraud, deceptive impersonation, or distributing malware.",
      "Do not bypass authentication, moderation, origin restrictions, rate limits, or other security controls; harvest personal information; or deliberately overload or disrupt the service. Report suspected security issues privately to hello@manjiltamang.com.",
      "Communities using the widget may set additional rules. Follow those rules when participating on their websites. Do not use the hosted service to collect sensitive or regulated information that requires safeguards or agreements we have not expressly agreed to provide."
    ]
  ],
  [
    "Site owners and moderation",
    [
      "Embed Commentsy only on websites you own or are authorized to manage. You are responsible for configuring authorized domains and approval settings, complying with laws applicable to your website, providing appropriate visitor notices and obtaining required permissions, and moderating discussions you manage.",
      "Users and site owners supply discussion content. We do not endorse that content or guarantee its accuracy, legality, or suitability. Moderation tools, guest approval, and abuse controls reduce some risks but cannot guarantee that harmful content or automated abuse will be prevented.",
      "Site owners can moderate, hide, mark as spam, or remove comments. We may remove or restrict content, accounts, or embeds to address abuse, security risks, legal requirements, or violations of these terms. We do not promise to review every submission. Nothing here limits duties imposed on us by applicable law."
    ]
  ],
  [
    "Content concerns",
    [
      "You are responsible for the content you submit and for respecting other people’s rights. We do not endorse user content or promise to monitor every discussion. Report unlawful content, rights violations, or abuse to hello@manjiltamang.com with the relevant page URL and details. We may restrict content or accounts and respond to reports as required by applicable law."
    ]
  ],
  [
    "Privacy, retention, and backups",
    [
      "Our Privacy Policy explains how the hosted service processes sign-in data, guest information, comments, and cookies. Read it before submitting personal information. These terms do not waive applicable privacy rights or our legal obligations.",
      "Comment deletion hides content through the service but may retain an underlying record to preserve discussion structure and support service operations. It cannot remove copies others have made. Account deletion and further data removal requests can be sent to hello@manjiltamang.com; there is no self-service account deletion feature.",
      "Do not treat the hosted service as your only archive. Keep independent copies of important material. We do not promise permanent storage, restoration of deleted content, or a particular backup or recovery period unless separately agreed in writing. This does not limit any preservation or other duties required by law."
    ]
  ],
  [
    "Third-party services",
    [
      "Google, GitHub, KLIPY, infrastructure providers, and websites embedding Commentsy operate independently and may have their own terms and privacy policies. Their services may be interrupted or changed. Choosing a GIF does not give you ownership of its underlying media.",
      "We are not responsible for independently operated third-party sites or services to the extent permitted by law. Using those providers does not remove responsibilities that applicable law places on us for our own service. Rights in third-party code, media, and trademarks remain with their owners."
    ]
  ],
  [
    "Optional coffee contributions and sponsorships",
    [
      "Access to the public hosted service is free. Coffee contributions and sponsorships are optional support for the project’s development. They do not purchase service access, hosting, priority support, features, maintenance, or guaranteed availability. Contributors and sponsors receive the same service access as everyone else.",
      "Contributing or sponsoring does not require us to keep the service running or maintained, or to deliver a feature. Recurring contributions are voluntary support, not a hosting subscription, and are managed through the contribution platform. Mandatory rights and any separate express sponsorship agreement remain applicable."
    ]
  ],
  [
    "Warranty disclaimer",
    [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE HOSTED SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”. WE DISCLAIM IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.",
      "We do not warrant that the service will be uninterrupted, error-free, completely secure, or free of harmful content, or that data will never be lost. Information or assistance we provide does not create a warranty unless expressly agreed in writing. This section does not exclude warranties or remedies that cannot lawfully be excluded."
    ]
  ],
  [
    "Limitation of liability",
    [
      "To the maximum extent permitted by applicable law, the operator is not liable for losses arising from using or being unable to use this free service, including interruptions, bugs, unmaintained features, suspension, discontinuation, lost comments or data, lost revenue or profits, or disruption to your website or business. You decide whether to use the hosted service and bear the risks of relying on its availability.",
      "Nothing in these terms excludes or limits liability that cannot legally be excluded or limited, including any applicable liability for fraud, intentional misconduct, gross negligence, or death or personal injury caused by negligence. Mandatory legal rights remain unaffected."
    ]
  ],
  [
    "Suspension and ending use",
    [
      "You may stop using Commentsy at any time and remove the embed from your website.",
      "We reserve the right to change, restrict, suspend, stop maintaining, or permanently discontinue all or part of the free hosted service at any time, for any reason, with or without advance notice, except where notice or other action is required by law. No minimum operating period, migration assistance, continued access, or restoration of content is promised.",
      "If you need control over availability, maintenance, and continuity, self-host the software and maintain your own backups. Self-hosting does not itself guarantee uninterrupted operation. Retained information is handled under the Privacy Policy and applicable law."
    ]
  ],
  [
    "Changes and general terms",
    [
      "We will identify revisions by updating the effective date and provide reasonable advance notice of material changes, where practicable. Material changes apply prospectively; we will obtain further agreement where required by law. If you do not agree, stop using the service. Changes do not retroactively remove accrued claims or mandatory rights.",
      "If a provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law. A failure to enforce a provision is not a waiver of the right to enforce it later. Provisions that by their nature need to continue after use ends, including applicable content permissions, liability limits, survive to the extent necessary and permitted by law."
    ]
  ],
  [
    "Contact",
    [
      "For questions about the service, these terms, or your account, email hello@manjiltamang.com. Include enough detail to identify the relevant account or content, but do not send passwords, access tokens, or other secrets."
    ]
  ]
];

function TermsOfService() {
  return (
    <article className="bg-white min-h-screen text-neutral-700">
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <p className="text-sm mb-3">Commentsy · Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-950">Terms of Service</h1>
        <p className="mt-4 text-sm">Effective October 29, 2026</p>
        <nav aria-label="Legal pages" className="flex flex-wrap gap-5 my-8 underline">
          <Link href="/">About Commentsy</Link>
          <Link href="/legal/privacy-policy">Privacy Policy</Link>
          <a href="mailto:hello@manjiltamang.com">Contact</a>
        </nav>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 leading-7">
          <p><strong>Hosted service or self-hosting?</strong> Hosted Commentsy is a pilot service with the limitations below. Self-hosting lets you control your deployment and take responsibility for operating it.</p>
          <a className="underline" href="https://github.com/manjillama/commentsy">View the source code and self-hosting instructions</a>
        </div>
        <nav aria-label="Terms sections" className="my-8">
          <h2 className="font-semibold text-neutral-950">On this page</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2">
            {sections.map(([heading], index) => <li key={heading}><a className="underline" href={`#terms-${index + 1}`}>{heading}</a></li>)}
          </ol>
        </nav>
        {sections.map(([heading, paragraphs], index) => (
          <section key={heading} id={`terms-${index + 1}`} className="mt-8 scroll-mt-6">
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
