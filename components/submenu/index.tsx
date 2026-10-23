"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Submenu({
  menuLinks,
}: {
  menuLinks: { url: URL | string; name: string }[];
}) {
  const currentRoute = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white -mt-[1px]">
      <div className="max-w-screen-2xl mx-auto px-[15px]">
        <ul className="flex -mx-4">
          {menuLinks.map((link, i) => (
            <li
              className="pb-2"
              style={
                currentRoute === link.url
                  ? { borderBottom: "2px solid #000" }
                  : {}
              }
              key={i}
            >
              <Link
                href={link.url}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/**

<li className="pb-2">
          <NavLink
            href={`/apps/${id}`}
            className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
          >
            App
          </NavLink>
        </li>
        <li className="pb-2">
          <NavLink
            href={`/apps/${id}/groups`}
            className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
          >
            Groups
          </NavLink>
        </li>
        <li className="pb-2">
          <NavLink
            href={`/apps/${id}/comments`}
            className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
          >
            Comments
          </NavLink>
        </li>
        <li className="pb-2">
          <NavLink
            href={`/apps/${id}/appearance`}
            className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
          >
            Appearance
          </NavLink>
        </li>
        <li className="pb-2">
          <NavLink
            href={`/apps/${id}/settings`}
            className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
          >
            Settings
          </NavLink>
        </li>

 */
