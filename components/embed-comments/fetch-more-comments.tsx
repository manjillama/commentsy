import { IComment } from "@/interfaces/IComment";
import api from "@/utils/api";
import { CommentDataWithUserCommentSyles, PageParams } from ".";
import { useState } from "react";
import { Spinner } from "../ui";

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  setCommentData: (commentData: CommentDataWithUserCommentSyles) => void;
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
      }
    }
    setIsCommentLoading(false);
  };

  if (commentData.comments.length >= commentData.total) return null;

  return (
    <div className="py-12">
      {isCommentLoading ? (
        <div className="h-[32px] w-[32px] mb-8">
          <Spinner
            styles={{
              backgroundColor: commentData.userCommentStyles.primary.color,
            }}
          />{" "}
        </div>
      ) : (
        <button
          style={commentData.userCommentStyles.accent}
          className="text-sm font-semibold py-2 px-5 block rounded-lg hover:opacity-75"
          onClick={handleFetchNextComments}
        >
          More comments
        </button>
      )}
    </div>
  );
}
