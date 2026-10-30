import type { Dispatch, SetStateAction } from "react";
import { commentCursor } from "@/utils/commentCursor";
import { IComment } from "@/interfaces/IComment";
import api from "@/utils/api";
import { CommentDataWithUserCommentSyles, PageParams } from ".";
import { useRef, useState } from "react";
import { Spinner } from "../ui";
import FormFeedback from "../ui/form-feedback";

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  setCommentData: Dispatch<SetStateAction<CommentDataWithUserCommentSyles>>;
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
  const [error, setError] = useState("");
  const [exhausted, setExhausted] = useState(false);
  const loading = useRef(false);

  const handleFetchNextComments = async () => {
    if (loading.current) return;
    loading.current = true;
    setIsCommentLoading(true);
    setError("");
    try {
      const last = commentData.comments[commentData.comments.length - 1];
      const after = last ? `&after=${encodeURIComponent(commentCursor(last))}` : "";
      const data = await api.get<{
        comments: IComment[];
        total: number;
        size: number;
      }>(
        `/api/comments?appCode=${encodeURIComponent(commentData.appCode)}&identifier=${encodeURIComponent(commentData.identifier)}&page=1&limit=${commentData.size}&sort=${params.sort}${after}`
      );

      if (data.status === "success") {
        const newComments = data.data.comments;
        setExhausted(newComments.length < data.data.size);
        setCommentData(current => ({
          ...current,
          comments: Array.from(new Map([...current.comments, ...newComments].map(comment => [comment._id, comment])).values()),
          total: data.data.total,
        }));
        setParams({ ...params, currentPage: params.currentPage + 1 });
      } else setError(data.message || "Unable to load comments. Please try again.");
    } catch { setError("Unable to load comments. Please try again."); }
    finally {
      loading.current = false;
      setIsCommentLoading(false);
    }
  };

  if (exhausted || commentData.comments.length >= commentData.total) return null;

  return (
    <div className="pt-12">
      <FormFeedback message={error} error={Boolean(error)} />
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
