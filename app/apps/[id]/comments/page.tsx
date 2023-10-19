"use client";
import Paginate from "@/components/paginate";
import Avatar from "@/components/ui/avatar";
import { useFetch } from "@/hooks/useFetch";
import { IComment } from "@/interfaces/IComment";
import { RootState } from "@/store";
import { getRelativeTimeString } from "@/utils";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Comments({
  params: { id },
  searchParams: { page, limit },
}: {
  params: {
    id: string;
  };
  searchParams: {
    page: string;
    limit: string;
  };
}) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);

  if (!app) throw new AppError("404", 404);

  const [fetching, data, error] = useFetch<{
    comments: IComment[];
    total: number;
    size: number;
  }>(`/api/apps/${app._id}/comments?page=${page}&limit=${limit}`);

  if (error) throw new AppError("404", 404);

  const { comments, size, total } = data
    ? data
    : {
        comments: [],
        size: 40,
        total: 0,
      };

  const totalPage = Math.ceil(total / size);

  return (
    <div className="min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <span className="text-sm text-neutral-500">{app.name}</span>
          <h1 className="text-4xl my-3">Comments</h1>
          <p className="text-neutral-800">
            Moderate, view and manage all your app comments
          </p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        {fetching ? (
          <div>Loading...</div>
        ) : (
          <div>
            {!comments.length ? (
              <p className="text-neutral-500">
                There are no comments created yet.
              </p>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  {total} comment{total > 1 ? "s" : ""}
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex border-t p-4 first:border-t-0 space-x-4"
                    >
                      <div className="flex-1 flex-col overflow-hidden">
                        <div>{comment.pageTitle}</div>
                        <div className="whitespace-nowrap overflow-ellipsis overflow-hidden">
                          {comment.comment}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span suppressHydrationWarning>
                            {getRelativeTimeString(new Date(comment.createdAt))}
                          </span>
                          <span className="max-w-[120px] overflow-hidden whitespace-nowrap">
                            by {(comment.user as any).name}
                          </span>
                        </div>
                        <div>
                          <Avatar user={comment.user as any} size="sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <Paginate totalPageCount={totalPage} />
      </div>
    </div>
  );
}
