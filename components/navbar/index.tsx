"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SignoutButton from "./signout-button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { NavLink } from "../ui";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-screen-2xl mx-auto px-[15px] py-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">
          <Link href="/">Commentsy</Link>
        </h1>
        <ul className="flex space-x-4 items-center">
          {session ? (
            <>
              <li>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="outline-none"
                      aria-label="Customise options"
                    >
                      <div
                        className="rounded-full h-[32px] w-[32px] p-4 flex items-center justify-center font-semibold"
                        style={{
                          backgroundColor: session.user.avatarBackgroundColor,
                        }}
                      >
                        {session.user.name?.split("")[0]}
                      </div>
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
                          className="text-neutral-500 block outline-none px-4 py-2 hover:bg-neutral-100"
                          href="/dashboard"
                        >
                          Dashboard
                        </NavLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <NavLink
                          className="text-neutral-500 block outline-none px-4 py-2 hover:bg-neutral-100"
                          href="/profile"
                        >
                          Profile
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
