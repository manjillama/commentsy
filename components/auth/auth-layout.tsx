import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import styles from "./auth.module.css";

export default function AuthLayout({ signup = false, children }: { signup?: boolean; children: ReactNode }) {
  return (
    <div className={`${styles.page} ${signup ? styles.signup : ""}`}>
      <div className={styles.layout}>
        <aside className={styles.story} aria-label="A place for conversation">
          <Link href="/" className={styles.back}><ArrowLeftIcon /> Back to Commentsy</Link>
          <div className={styles.storyHeading}>
            <span className={styles.eyebrow}>{signup ? "YOUR CORNER OF THE INTERNET" : "GOOD TO HAVE YOU BACK"}</span>
            <h2>{signup ? <>Big ideas deserve<br />{" "}a conversation.</> : <>The conversation<br />{" "}continues here.</>}</h2>
            <p>{signup ? "Give your readers a place to connect. Make it yours, and see where the conversation takes you." : "Your sites, your comments, and the people behind them. Pick up right where you left off."}</p>
          </div>
          <div className={styles.conversation} aria-hidden="true">
            <div className={styles.note}>A little space. A lot to say.</div>
            <div className={styles.comment}><span className={styles.avatar}>J</span><div><strong>Jamie <small>just now</small></strong><p>This gave me a whole new perspective. Thanks for sharing!</p><span className={styles.reply}>Reply</span></div></div>
            <div className={styles.response}><span className={styles.avatar}>A</span><div><strong>Alex <small>just now</small></strong><p>That&apos;s what good conversations are for. ✨</p><span className={styles.reply}>Reply</span></div></div>
            <div className={styles.powered}><Image src="/commentsy.svg" alt="" width={24} height={12} /> A connection starts with a comment.</div>
          </div>
          <span className={styles.storyFoot}>Open source. Open conversations.</span>
        </aside>
        <section className={styles.formPanel} aria-labelledby="auth-title">
          <div className={styles.formContent}>
            <span className={styles.eyebrow}>{signup ? "LET’S GET YOU STARTED" : "YOUR COMMENTSY"}</span>
            <h1 id="auth-title">{signup ? "Make yourself at home." : "Welcome back."}</h1>
            <p className={styles.intro}>{signup ? "Create your account and join the conversation." : "Log in to your Commentsy account."}</p>
            {children}
            <p className={styles.switchAccount}>{signup ? "Already part of the conversation?" : "New around here?"} <Link href={signup ? "/signin" : "/signup"}>{signup ? "Log in" : "Create an account"} <span aria-hidden="true">↗</span></Link></p>
          </div>
        </section>
      </div>
    </div>
  );
}
