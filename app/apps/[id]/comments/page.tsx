"use client";
import { useFetch } from "@/hooks/useFetch";
import { IComment } from "@/interfaces/IComment";
import { RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Comments({
  params: { id },
}: {
  params: { id: string };
}) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  const [fetching, data, error] = useFetch<{
    comments: IComment[];
    total: number;
    size: number;
  }>(`/api/apps/${app._id}/comments`);

  if (error) throw new AppError("404", 404);

  const { comments, size, total } = data
    ? data
    : {
        comments: [],
        size: 40,
        total: 0,
      };

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <h1 className="text-4xl mb-3">Comments</h1>
          <p className="text-neutral-500">{app.name}</p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        {fetching ? (
          <div>Loading...</div>
        ) : (
          <div>
            {!comments.length && (
              <p className="text-neutral-500">
                There are no comments created yet.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment._id}>
                <div>{comment.pageTitle}</div>
                <div dangerouslySetInnerHTML={{ __html: comment.comment }} />
                <div>{getRelativeTimeString(new Date(comment.createdAt))}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
