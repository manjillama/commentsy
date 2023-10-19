"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SignoutButton from "./signout-button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { NavLink } from "../ui";
import { DiscIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Avatar from "../ui/avatar";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-screen-2xl mx-auto px-[15px] py-4 flex justify-between items-center">
        <Link href="/" className="flex space-x-2 items-center">
          <div className="w-[36px] h-[18px]">
            <Image
              src="/commentsy.svg"
              width={36}
              height={18}
              alt="Logo"
              className="w-auto h-auto"
            />
          </div>
          <h1 className=" text-xl flex">commentsy </h1>
        </Link>

        <ul className="flex space-x-4 items-center">
          {session ? (
            <>
              <li>
                <Link
                  className="text-neutral-600 hover:bg-neutral-200 hover:text-black h-[32px] w-[32px] flex rounded-lg border border-neutral-200 items-center"
                  title="Issues"
                  href="https://github.com/manjillama/commentsy/issues"
                >
                  <DiscIcon className="mx-auto" height={18} width={18} />
                </Link>
              </li>
              <li>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="outline-none"
                      aria-label="Customise options"
                    >
                      <Avatar user={session.user} />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={5}
                      className="w-[250px] bg-white border border-neutral-200 py-2 rounded-lg "
                    >
                      <DropdownMenu.Item className="outline-none px-4 py-2">
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {session.user.name}
                        </p>
                        <span className="text-neutral-500 block overflow-hidden text-ellipsis whitespace-nowrap">
                          {session.user.email}
                        </span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <NavLink
                          activeStyle={{
                            backgroundColor: "#f5f5f5",
                            color: "#000",
                          }}
                          className="text-neutral-500 block outline-none px-4 py-2 hover:bg-neutral-100"
                          href="/dashboard"
                        >
                          Dashboard
                        </NavLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <NavLink
                          activeStyle={{
                            backgroundColor: "#f5f5f5",
                            color: "#000",
                          }}
                          className="text-neutral-500 block outline-none px-4 py-2 hover:bg-neutral-100"
                          href="/account"
                        >
                          Account
                        </NavLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="border-b border-neutral-200" />
                      <DropdownMenu.Item className="outline-none">
                        <SignoutButton />
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-500 hover:text-black"
                >
                  Contact
                </Link>
              </li>
              {pathname !== "/signin" ? (
                <li>
                  <Link
                    className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
                    href="/signin"
                  >
                    Log In
                  </Link>
                </li>
              ) : null}
              {pathname !== "/signup" ? (
                <li>
                  <Link
                    className="py-2 px-4 block bg-black text-white rounded-lg hover:opacity-75"
                    href="/signup"
                  >
                    Sign Up
                  </Link>
                </li>
              ) : null}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
