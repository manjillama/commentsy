"use client";
import { IApp } from "@/interfaces/IApp";
import { setUserApps } from "@/slices/userAppsSlice";
import { AppDispatch, RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function UserApps({ userApps }: { userApps: IApp[] }) {
  const apps = useSelector((state: RootState) => state.apps.apps);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(setUserApps(userApps));
  }, []);

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
                <div className="text-sm text-neutral-500">
                  Create {getRelativeTimeString(new Date(app.createdAt))}
                </div>
              </div>
            </div>
            <div className="text-neutral-500">{app.description}</div>
            <div className="text-sm text-neutral-500">
              {app.likes} like{app.likes > 1 ? "s" : ""}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
