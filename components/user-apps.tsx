"use client";
import { RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

export default function UserApps() {
  const apps = useSelector((state: RootState) => state.apps.apps);

  if (!apps.length)
    return (
      <div className="bg-white border border-dashed border-neutral-300 rounded-xl p-8 flex flex-col sm:flex-row items-center gap-5">
        <div className="rounded-xl bg-neutral-100 p-4 shrink-0"><ChatBubbleIcon height={26} width={26} className="text-neutral-500" aria-hidden="true" /></div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold">Have a site of your own?</h3>
          <p className="text-sm text-neutral-500 mt-2">Create an app to add Commentsy to your website. No app is needed to post or manage your own comments.</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-wrap -mx-2">
      {apps.map((app) => (
        <div key={app._id} className="w-full md:w-4/12 p-2 h-auto flex-col">
          <Link
            href={`/apps/${app._id}`}
            className="bg-white block p-4 border border-neutral-200 rounded-lg h-full hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-[32px] w-[32px] bg-black rounded-full px-[6px] pt-[11px]">
                <Image
                  src="/commentsy-white.svg"
                  alt="logo"
                  width={30}
                  height={15}
                  className="w-auto h-auto"
                />
              </div>
              <div>
                <div className="text-lg">{app.name}</div>
                <div
                  className="text-sm text-neutral-500"
                  suppressHydrationWarning
                >
                  Created {getRelativeTimeString(new Date(app.createdAt))}
                </div>
              </div>
            </div>
            <div className="text-neutral-500 mb-2">{app.description}</div>
            <div className="text-xs text-neutral-500">{app.code}</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
