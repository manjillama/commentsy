"use client";
import { IComment } from "@/interfaces/IComment";
import api from "@/utils/api";
import { useEffect, useRef, useState } from "react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [commentData, setCommentData] = useState(data);
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "commentsyParentSiteData")
        console.log(
          "Message received from the parent: " + JSON.stringify(event.data)
        );
    });
    window.parent.postMessage(
      { type: "commentsyResize", height: ref.current?.["offsetHeight"] },
      "*"
    );
  }, [commentData]);

  const { total, size } = commentData;

  const totalPage = Math.ceil(total / size);

  /** @todo Loader */
  const handleFetchNextComments = async () => {
    setIsCommentLoading(true);

    const data = await api.get<{
      comments: IComment[];
      total: number;
      size: number;
    }>(
      `/api/comments?identifier=${commentData.identifier}&page=${
        currentPage + 1
      }`
    );

    if (data.status === "success") {
      setCommentData({
        ...commentData,
        comments: [...commentData.comments, ...data.data.comments],
      });
      setCurrentPage(currentPage + 1);
    }
    setIsCommentLoading(false);
  };

  const handleCommentPost = () => {
    window.parent.postMessage({ type: "commentsyPostComment" }, "*");
  };

  return (
    <div ref={ref}>
      <div>
        {isCommentLoading && <span>Loading...</span>}
        <hr />
        <button onClick={handleCommentPost}>Add a comment</button>
        <p>Current page: {currentPage}</p>
        <button
          onClick={() => handleFetchNextComments()}
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
