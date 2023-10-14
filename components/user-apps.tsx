"use client";
import { RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function UserApps() {
  const apps = useSelector((state: RootState) => state.apps.apps);

  if (!apps.length)
    return (
      <div>
        <p>
          Want to build something that integrates with your website or mobile
          app and allows your users to add comments? Create a new Commentsy App
          to get started, follow our integration guide and start engaging with
          your audiences in just few minutes. You can also read more about it in
          our{" "}
          <Link className="text-blue-600 hover:underline" href="/docs">
            developer documentation
          </Link>
          .
        </p>
      </div>
    );

  return (
    <div className="flex flex-wrap -mx-2">
      {apps.map((app) => (
        <div key={app._id} className="w-full md:w-4/12 p-2 h-auto flex-col">
          <Link
            href={`/apps/${app._id}`}
            className="bg-white block p-4 border border-neutral-200 rounded-lg h-full hover:shadow-md transition-shadow duration-300	"
          >
            <div className="flex items-baseline space-x-4 mb-4">
              <Image src="/next.svg" alt="logo" width={50} height={50} />
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
