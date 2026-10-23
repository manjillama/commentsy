"use client";
import { RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import NewAppDialog from "./app-form/new-app-dialog";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

export default function UserApps() {
  const apps = useSelector((state: RootState) => state.apps.apps);

  if (!apps.length)
    return (
      <div>
        <p>
          Want to build something that integrates with your website and allows
          your audiences to post comments? Create a new Commentsy App to get
          started, follow our integration guide and start engaging with your
          audiences in just a few minutes.
        </p>
        <div className="border rounded-md p-6 my-10 bg-white">
          <div className="border border-dotted px-6 py-12 flex flex-col items-center">
            <div className="rounded-full border h-[72px] w-[72px] flex items-center justify-center">
              <ChatBubbleIcon height={26} width={26} />
            </div>
            <h2 className="my-4 text-2xl font-medium">No apps yet</h2>
            <div>
              <NewAppDialog />
            </div>
          </div>
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
