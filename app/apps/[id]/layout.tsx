import { withSiteLayout } from "@/hoc";
import Link from "next/link";

function AppLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div>
      <nav className="border-b border-neutral-200 bg-white -mt-[1px]">
        <div className="max-w-screen-2xl mx-auto px-[15px]">
          <ul className="flex -mx-4">
            <li className="pb-2">
              <Link
                href={`/apps/${id}`}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                App
              </Link>
            </li>
            <li className="pb-2">
              <Link
                href={`/apps/${id}/groups`}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                Groups
              </Link>
            </li>
            <li className="pb-2">
              <Link
                href={`/apps/${id}/comments`}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                Comments
              </Link>
            </li>
            <li className="pb-2">
              <Link
                href={`/apps/${id}/appearance`}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                Appearance
              </Link>
            </li>
            <li className="pb-2">
              <Link
                href={`/apps/${id}/settings`}
                className="px-4 py-2 rounded-md hover:bg-neutral-200 hover:text-black text-neutral-500 block"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      {children}
    </div>
  );
}

export default withSiteLayout(AppLayout);
