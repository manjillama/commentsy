"use client";
import AppForm from "@/components/app-form/form";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Settings({
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
          <h1 className="text-4xl">App settings</h1>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        <h2 className="text-2xl mb-2 font-semibold">General</h2>
        <p className="mb-4">Your app&apos;s general settings.</p>

        <div className="border rounded-md p-6 bg-white">
          <AppForm
            from="settings"
            type="edit"
            appId={app._id}
            initialFormProps={{
              name: app.name,
              description: app.description,
              authorizedOrigins: app.authorizedOrigins,
            }}
          />
        </div>
      </div>
    </div>
  );
}
