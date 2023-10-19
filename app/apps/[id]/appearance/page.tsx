"use client";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Appearance({
  params: { id },
}: {
  params: { id: string };
}) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <p className="text-sm text-neutral-500">{app.name}</p>
          <h1 className="text-4xl my-3">Appearance</h1>
          <p className="text-neutral-800">
            Customize how your audience will see comments on your site
          </p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        Coming soon.
      </div>
    </div>
  );
}
