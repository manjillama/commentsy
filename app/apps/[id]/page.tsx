"use client";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function App({ params: { id } }: { params: { id: string } }) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);
  return (
    <div>
      <header className="border-b py-12">
        <div className="max-w-screen-lg px-[15px] mx-auto">
          <span className="text-sm text-neutral-500">{app.code}</span>
          <h1 className="text-4xl mb-3">{app.name}</h1>
          <p className="text-neutral-500">{app.description}</p>
        </div>
      </header>
      <div className="max-w-screen-lg px-[15px] mx-auto"></div>
    </div>
  );
}
