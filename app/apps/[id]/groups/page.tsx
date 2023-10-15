"use client";
import { useFetch } from "@/hooks/useFetch";
import { IGroup } from "@/interfaces/IGroup";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Groups({ params: { id } }: { params: { id: string } }) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  const [fetching, data, error] = useFetch<{
    groups: IGroup[];
    total: number;
    size: number;
  }>(`/api/apps/${app._id}/groups`);

  if (error) throw new AppError("404", 404);

  const { groups, size, total } = data
    ? data
    : {
        groups: [],
        size: 40,
        total: 0,
      };

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <h1 className="text-4xl mb-3">Groups</h1>
          <p className="text-neutral-500">{app.name}</p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        {fetching ? (
          <div>Loading...</div>
        ) : (
          groups.map((group) => <div key={group._id}>{group.identifier}</div>)
        )}
      </div>
    </div>
  );
}
