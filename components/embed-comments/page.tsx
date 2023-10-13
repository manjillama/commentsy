"use client";

import { IComment } from "@/interfaces/IComment";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [commentData, setCommentData] = useState(data);
  const ref = useRef(null);

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

  useEffect(() => {
    window.parent.postMessage(
      { type: "commentsyResize", height: ref.current?.["offsetHeight"] },
      "*"
    );
  }, [commentData]);

  const { total, size } = commentData;

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

  const handleFetchNextComments = () => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((data) => data.json())
      .then((data) =>
        console.log("Data", setCommentData({ ...commentData, ...data }))
      );
  };

  return (
    <div ref={ref}>
      <div>
        <div>
          <a href="http://localhost:3000/signin" target="_blank">
            Send me to commentsy
          </a>
        </div>
        <button onClick={handleFetchNextComments}>Press me</button>
        <hr />
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
        <hr />
        <pre>{JSON.stringify(commentData, null, 2)}</pre>
      </div>
    </div>
  );
}
