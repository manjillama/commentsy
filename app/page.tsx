import { SITE_DATA } from "@/constants";
import { homeMetadata, siteUrl } from "@/utils/seo";
import { withSiteLayout } from "@/hoc";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import HtmlCode from "@/components/code-snippets/html-code";
import JsCode from "@/components/code-snippets/js-code";
import styles from "./landing.module.css";

export const metadata = homeMetadata();

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Commentsy", url: siteUrl },
    {
      "@type": "SoftwareApplication",
      name: "Commentsy",
      url: siteUrl,
      description: SITE_DATA.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      sameAs: "https://github.com/manjillama/commentsy",
      featureList: ["Embeddable website comments", "Threaded replies", "Guest comment approval", "Custom light and dark themes"],
    },
  ],
};

async function HomePage() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");
  return (
    <div className={styles.landing}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <a className={styles.eyebrow} href="https://github.com/manjillama/commentsy">
            <GitHubLogoIcon width={15} height={15} /> Open source. Open conversations.
          </a>
          <h1 id="hero-title">Comments for<br />your website.<br /><span>Your conversation.</span></h1>
          <p className={styles.lead}>Commentsy is an open source, embeddable comment system for websites and blogs. Add threaded discussions in minutes, customize the theme, and manage comments from one dashboard.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/signup">Get started <ArrowRightIcon /></Link>
            <a className={styles.secondaryButton} href="#how-it-works">See how it works <span aria-hidden="true">↗</span></a>
          </div>
          <div className={styles.heroNotes}><span><CheckIcon /> No external dependencies</span><span><CheckIcon /> Make it your own</span></div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualBackdrop} />
          <div className={styles.backPreview}>
            <Image src="/images/banner-2.jpg" alt="Commentsy comment interface in dark mode" width={1200} height={1061} sizes="(max-width: 760px) 65vw, 360px" priority />
          </div>
          <div className={styles.frontPreview}>
            <div className={styles.previewBar}><span /><span /><span /><span className={styles.previewLabel}>A little space for big conversations</span></div>
            <Image src="/images/banner-1.jpg" alt="Commentsy discussion with nested replies from readers" width={1200} height={1061} sizes="(max-width: 760px) 80vw, 460px" priority />
          </div>
          <div className={styles.visualCaption}><span aria-hidden="true">✳</span> Good things start with a comment.</div>
        </div>
      </section>

      <div className={`${styles.container} ${styles.useCases}`}>
        <p>A place for conversation, wherever you create.</p>
        <div>{["Blogs", "Personal sites", "Photos", "Ecommerce", "Services"].map(item => <span key={item}>{item}</span>)}</div>
      </div>

      <section className={styles.productSection} aria-labelledby="product-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>SMALL ADDITION. MORE CONNECTION.</span>
            <h2 id="product-title">Built for the conversation.<br />Designed to feel like you.</h2>
            <p>A simple experience for your readers. A thoughtful workspace for you.</p>
          </div>
          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureCopy}><span className={styles.featureNumber}>01 / MAKE IT YOURS</span><h3>Your site. Your style.</h3><p>Customize colors for light and dark mode, and preview your changes before saving. Your comments should feel right at home.</p></div>
              <div className={styles.featureImage}><span className={styles.stageNote}>A little more you.</span><Image src="/images/banner-4.png" alt="Appearance editor showing custom comment colors and a live light mode preview" width={918} height={806} sizes="(max-width: 760px) 90vw, 650px" /></div>
            </article>
            <article className={styles.featureCard}>
              <div className={styles.featureCopy}><span className={styles.featureNumber}>02 / STAY IN THE LOOP</span><h3>Comment moderation in one place.</h3><p>Review comments and replies across your sites. Require approval for guest posts, approve pending comments, and mark unwanted posts as spam from your Commentsy dashboard.</p></div>
              <div className={styles.featureImage}><span className={styles.stageNote}>Everything in its place.</span><Image src="/images/banner-5.png" alt="Commentsy dashboard with personal comment activity and connected sites" width={806} height={806} sizes="(max-width: 760px) 90vw, 650px" /></div>
            </article>
          </div>
          <article className={styles.activityFeature}>
            <div><span className={styles.featureNumber}>03 / KEEP THE THREAD GOING</span><h3>Your contributions,<br />within reach.</h3><p>Find your comments and replies across sites using Commentsy. Jump back into a discussion, or edit what you&apos;ve shared.</p><Link href="/signup" className={styles.textLink}>Find your next conversation <ArrowRightIcon /></Link></div>
            <div className={styles.activityImage}><span className={styles.stageNote}>Pick up where you left off.</span><Image src="/images/banner-6.png" alt="Personal comment history showing replies, GIFs, and links to the original discussions" width={807} height={809} sizes="(max-width: 760px) 85vw, 540px" /></div>
          </article>
        </div>
      </section>

      <section id="how-it-works" className={`${styles.container} ${styles.setup}`} aria-labelledby="setup-title">
        <div className={styles.setupHeading}><div><span className={styles.kicker}>LESS SETUP. MORE CONVERSATION.</span><h2 id="setup-title">A few minutes. Two snippets.<br />You&apos;re ready to go.</h2></div><Link href="/docs" className={styles.textLink}>Read the documentation <ArrowRightIcon /></Link></div>
        <p className={styles.setupIntro}>Create an account, add your site, and use its app code in the snippets below. No external dependencies required.</p>
        <div className={styles.codeGrid}>
          <div className={styles.codeCard}><div className={styles.stepHeading}><span>1</span><div><h3>Make room for the conversation</h3><p>Place this HTML where you want comments to appear.</p></div></div><HtmlCode appCode="{{YOUR_APP_CODE}}" /></div>
          <div className={styles.codeCard}><div className={styles.stepHeading}><span>2</span><div><h3>Add the finishing touch</h3><p>Paste this JavaScript inside your HTML head tag.</p></div></div><JsCode /></div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.setup}`} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <h2 id="faq-title">A simple comment system for your website</h2>
          <p>What to know before adding Commentsy to your site.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 leading-relaxed">
          <article><h3 className="text-xl font-semibold mb-2">How do I add comments to my website?</h3><p>Create an account, register your site, and copy the iframe and JavaScript snippets into your pages. Each page gets its own discussion through a stable identifier. <Link href="/docs" className="underline">Follow the integration guide</Link>.</p></article>
          <article><h3 className="text-xl font-semibold mb-2">Can I use Commentsy with a static blog?</h3><p>Yes. You can embed Commentsy on a blog, static HTML site, or other website that allows an iframe and JavaScript. Your website does not need its own comment backend.</p></article>
          <article><h3 className="text-xl font-semibold mb-2">Can visitors comment without an account?</h3><p>Visitors can post as guests or sign in. Enable guest approval to review guest comments and replies before they appear publicly.</p></article>
          <article><h3 className="text-xl font-semibold mb-2">Is Commentsy open source?</h3><p>Yes. Explore the source on <a href="https://github.com/manjillama/commentsy" className="underline">GitHub</a> and self-host your own instance. Customize light and dark themes to match your website.</p></article>
        </div>
      </section>

      <section className={`${styles.container} ${styles.closing}`} aria-labelledby="closing-title"><div><span className={styles.kicker}>LET&apos;S TALK.</span><h2 id="closing-title">Give your next visitor a voice.</h2><p>Bring the conversation to your corner of the internet.</p></div><Link className={styles.primaryButton} href="/signup">Get started with Commentsy <ArrowRightIcon /></Link></section>
    </div>
  );
}

export default withSiteLayout(HomePage);
import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
