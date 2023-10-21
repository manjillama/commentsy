"use client";
import CommentItem from "@/components/comments/comment-item";
import Paginate from "@/components/paginate";
import { useFetch } from "@/hooks/useFetch";
import { useUrlSearchParams } from "@/hooks/useUrlParams";
import { IComment } from "@/interfaces/IComment";
import { RootState } from "@/store";
import AppError from "@/utils/appError";
import { useSelector } from "react-redux";

export default function Comments({
  params: { id },
  searchParams: { page, limit, status },
}: {
  params: {
    id: string;
  };
  searchParams: {
    page: string;
    limit: string;
    status: string;
  };
}) {
  const apps = useSelector((state: RootState) => state.apps.apps);
  const app = apps.find((app) => app._id === id);
  if (!app) throw new AppError("404", 404);

  const [searchParams, , replaceSearchParams] = useUrlSearchParams();

  const [fetching, data, error] = useFetch<{
    comments: IComment[];
    total: number;
    size: number;
  }>(
    `/api/apps/${app._id}/comments?status=${status}&page=${page}&limit=${limit}`
  );

  if (error) throw new AppError("404", 404);

  const { comments, size, total } = data
    ? data
    : {
        comments: [],
        size: 40,
        total: 0,
      };

  const totalPage = Math.ceil(total / size);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    replaceSearchParams(name, value);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <span className="text-sm text-neutral-500">{app.name}</span>
          <h1 className="text-4xl my-3">Comments</h1>
          <p className="text-neutral-800">
            Moderate, view and manage all your app comments. Only approved
            comments can be seen by your audiences.
          </p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">
        {fetching ? (
          <div>Loading...</div>
        ) : (
          <div>
            {!comments.length ? (
              <p className="text-neutral-500">There are no comments yet.</p>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {total} comment{total > 1 ? "s" : ""}
                  </h2>
                  <select
                    onChange={handleFilterChange}
                    name="status"
                    defaultValue={searchParams.get("status") ?? ""}
                    className="outline-none bg-inherit"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="deleted">Deleted</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg">
                  {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
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
