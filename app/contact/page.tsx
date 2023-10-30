import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  GlobeIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Contact | ${SITE_DATA.title}`,
};

function ContactPage() {
  return (
    <div className="bg-white absolute inset-0">
      <div className="max-w-screen-lg mx-auto px-[15px] text-center flex flex-col h-full justify-center items-center">
        <h2 className="text-8xl font-bold">Contact</h2>
        <ul className="flex space-x-4 text-neutral-500 my-8">
          <li>
            <Link
              href="https://manjiltamang.com/"
              className="hover:text-black"
              target="_blank"
            >
              <GlobeIcon height={32} width={32} />
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/manjillama/commentsy"
              className="hover:text-black"
              target="_blank"
            >
              <GitHubLogoIcon height={32} width={32} />
            </Link>
          </li>
          <li>
            <Link
              href="https://twitter.com/lamamanjil"
              className="hover:text-black"
              target="_blank"
            >
              <TwitterLogoIcon height={32} width={32} />
            </Link>
          </li>
          <li>
            <Link
              href="mailto:hello@manjiltamang.com"
              className="hover:text-black"
              target="_blank"
            >
              <EnvelopeClosedIcon height={32} width={32} />
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
