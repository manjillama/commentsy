import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { Metadata } from "next";
import Link from "next/link";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: `Contact | ${SITE_DATA.title}`,
};

function ContactPage() {
  return (
    <div className="bg-white absolute inset-0">
      <div className="max-w-screen-lg mx-auto px-[15px] text-center flex flex-col h-full justify-center items-center">
        <h1 className="text-8xl font-bold">Contact</h1>
        <ul className="flex space-x-4 text-neutral-500 my-8">
          <li>
            <Link
              href="https://manjiltamang.com/"
              aria-label="Visit Manjil Tamang’s website (opens in a new tab)"
              title="Personal website"
              rel="noopener noreferrer"
              className={styles.contactLink}
              target="_blank"
            >
              <GlobeIcon aria-hidden="true" height={32} width={32} />
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/manjillama/commentsy"
              aria-label="View Commentsy on GitHub (opens in a new tab)"
              title="Commentsy on GitHub"
              rel="noopener noreferrer"
              className={styles.contactLink}
              target="_blank"
            >
              <GitHubLogoIcon aria-hidden="true" height={32} width={32} />
            </Link>
          </li>
          <li>
            <Link
              href="mailto:hello@manjiltamang.com"
              aria-label="Email hello@manjiltamang.com"
              title="Email me"
              className={styles.contactLink}
              target="_blank"
            >
              <EnvelopeClosedIcon aria-hidden="true" height={32} width={32} />
            </Link>
          </li>
        </ul>
        <p className="text-neutral-500">
          Whether you have a question or just want to say hi, my inbox is always
          open! 👋
        </p>
      </div>
    </div>
  );
}
export default withSiteLayout(ContactPage);
