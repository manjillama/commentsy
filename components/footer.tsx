import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-screen-2xl mx-auto px-[15px] py-4 text-neutral-500">
        <div className="flex md:flex-row flex-col justify-between items-center">
          <ul className="flex space-x-4">
            <li>
              <Link className="hover:text-black" href="/">
                <GitHubLogoIcon height={20} width={20} />
              </Link>
            </li>
          </ul>
          <div>
            <Link
              href="https://www.buymeacoffee.com/manjiltamang"
              className="hover:text-black"
              target="_blank"
              rel="noreferrer"
            >
              Buy me a coffee ✨
            </Link>
          </div>
        </div>
        <div className="flex md:flex-row flex-col justify-between items-center">
          <div>
            <div className="flex space-x-1 items-center">
              <div className="w-[80px]">
                <Image
                  src="/commentsy-text.svg"
                  width={36}
                  height={18}
                  alt="Logo"
                  className="w-auto h-auto"
                />
              </div>
              <span className="text-sm">
                &copy; {new Date().getFullYear()}, created by{" "}
                <Link
                  className="underline hover:text-black"
                  target="_blank"
                  href="https://manjiltamang.com/"
                >
                  Manjil Tamang
                </Link>
              </span>
            </div>
          </div>

          <ul className="flex space-x-4">
            <li>
              <Link className="hover:text-black" href="/legal/privacy-policy">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link className="hover:text-black" href="/legal/terms-of-service">
                Terms of service
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
