import { IComment } from "@/interfaces/IComment";
import api from "@/utils/api";
import { CommentData, PageParams } from ".";
import { useEffect, useState } from "react";

type Props = {
  commentData: CommentData;
  setCommentData: (commentData: CommentData) => void;
  params: PageParams;
  setParams: (params: PageParams) => void;
};
export default function FetchMoreComments({
  commentData,
  setCommentData,
  params,
  setParams,
}: Props) {
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [hasAllCommentFetched, setHasAllCommentFetched] = useState(false);

  const handleFetchNextComments = async () => {
    setIsCommentLoading(true);
    const data = await api.get<{
      comments: IComment[];
      total: number;
      size: number;
    }>(
      `/api/comments?identifier=${commentData.identifier}&page=${
        params.currentPage + 1
      }&sort=${params.sort}`
    );

    if (data.status === "success") {
      const newComments = data.data.comments;
      if (newComments.length > 0) {
        setCommentData({
          ...commentData,
          comments: [...commentData.comments, ...newComments],
        });
        setParams({
          ...params,
          currentPage: params.currentPage + 1,
        });
      } else setHasAllCommentFetched(true);
    }
    setIsCommentLoading(false);
  };

  if (hasAllCommentFetched || commentData.comments.length < commentData.size)
    return null;

  return (
    <div>
      {isCommentLoading ? (
        <div>Loading...</div>
      ) : (
        <button onClick={handleFetchNextComments}>Load more</button>
      )}
    </div>
  );
}
