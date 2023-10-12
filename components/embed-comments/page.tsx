"use client";

import { IComment } from "@/interfaces/IComment";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Props = {
  data: {
    identifier: string;
    likesCount: number;
    commentsCount: number;
    comments: IComment[];
    total: number;
    size: number;
  };
};
export default function EmbedComments({ data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, String(value));

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const { total, size } = data;

  const totalPage = Math.ceil(total / size);

  const handlePagination = (dir: "prev" | "next") => {
    let query = "";
    if (dir === "prev") {
      query = createQueryString(
        "page",
        String(currentPage > 1 ? currentPage - 1 : 1)
      );
    } else query = createQueryString("page", String(currentPage + 1));
    router.push(`${pathname}?${query}`);
  };

  return (
    <div>
      <div>
        <p>Current page: {currentPage}</p>
        <button
          onClick={() => handlePagination("prev")}
          disabled={currentPage <= 1}
        >
          Previous page
        </button>
        <button
          onClick={() => handlePagination("next")}
          disabled={currentPage >= totalPage}
        >
          Next page
        </button>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
