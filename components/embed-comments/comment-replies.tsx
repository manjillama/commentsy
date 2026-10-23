import { IComment } from "@/interfaces/IComment";
import { CommentDataWithUserCommentSyles } from ".";
import { Session } from "next-auth";
import { ParentSiteData } from "./input-comment";
import { useState } from "react";
import InputReply from "./input-reply";
import Avatar from "../ui/avatar";
import { getRelativeTimeString } from "@/utils";
import { Spinner } from "../ui";
import api from "@/utils/api";

type Props = {
  comment: IComment;
  commentData: CommentDataWithUserCommentSyles;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
};
export default function CommentReplies({
  comment,
  commentData,
  user,
  parentSiteData,
}: Props) {
  const [totalRepliesCount, setTotalRepliesCount] = useState(
    comment.repliesCount
  );
  const [isCommentFetching, setIsCommentFetching] = useState(false);
  const [commentReplies, setCommentReplies] = useState<IComment[]>([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [params, setParams] = useState({
    currentPage: 1,
    sort: "createdAt",
  });
  const [newSubmittComments, setNewSubmittiedComments] = useState<IComment[]>(
    []
  );

  const handleFetchReplies = async () => {
    setIsCommentFetching(true);
    setNewSubmittiedComments([]);
    const data = await api.get<{
      comments: IComment[];
      total: number;
      size: number;
    }>(
      `/api/comments/${comment._id}/replies?page=${params.currentPage}&sort=${params.sort}`
    );

    if (data.status === "success") {
      const newComments = data.data.comments;
      if (newComments.length > 0) {
        setCommentReplies([...commentReplies, ...newComments]);
        setParams({
          ...params,
          currentPage: params.currentPage + 1,
        });
      }
    }
    setIsCommentFetching(false);
  };

  const handleSubmittedData = (newComment: IComment): void => {
    setNewSubmittiedComments([...newSubmittComments, newComment]);
    setTotalRepliesCount(totalRepliesCount + 1);
  };

  return (
    <div>
      {showReplyInput ? (
        <div className="pr-8">
          <InputReply
            handleSubmittedData={handleSubmittedData}
            parentCommentId={comment._id}
            commentReplies={commentReplies}
            setCommentReplies={setCommentReplies}
            setShowReplyInput={setShowReplyInput}
            commentData={commentData}
            user={user}
            parentSiteData={parentSiteData}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowReplyInput(true)}
          className="opacity-50 text-sm font-semibold py-2"
        >
          Reply
        </button>
      )}
      {commentReplies.length > 0 && (
        <div>
          <div className="flex items-center space-x-4">
            <div style={{ borderTop: "1px solid #ccc" }} className="w-[25px]" />
            <button
              className="opacity-50 text-sm font-semibold"
              onClick={() => {
                setParams({ ...params, currentPage: 1 });
                setCommentReplies([]);
              }}
            >
              Hide all replies
            </button>
          </div>
        </div>
      )}

      {commentReplies.map((comment) => (
        <CommentReplyItem key={comment._id} comment={comment} />
      ))}
      {newSubmittComments.map((comment) => (
        <CommentReplyItem key={comment._id} comment={comment} />
      ))}

      {totalRepliesCount > 0 &&
        commentReplies.length + newSubmittComments.length <
          totalRepliesCount && (
          <div className="flex items-center space-x-4">
            <div style={{ borderTop: "1px solid #ccc" }} className="w-[25px]" />
            {isCommentFetching ? (
              <div className="h-[18px] w-[18px]">
                <Spinner
                  styles={{
                    backgroundColor:
                      commentData.userCommentStyles.primary.color,
                  }}
                  size="sm"
                />
              </div>
            ) : (
              <button
                className="opacity-50 text-sm font-semibold"
                onClick={handleFetchReplies}
              >
                View{" "}
                {Math.abs(
                  totalRepliesCount -
                    commentReplies.length -
                    newSubmittComments.length
                )}{" "}
                {totalRepliesCount -
                  commentReplies.length -
                  newSubmittComments.length >
                1
                  ? "replies"
                  : "reply"}
              </button>
            )}
          </div>
        )}
    </div>
  );
}

function CommentReplyItem({ comment }: { comment: IComment }) {
  return (
    <div key={comment._id} className="flex space-x-3 my-4">
      <div className="shrink-0">
        <Avatar user={comment.commentUser as any} size="sm" />
      </div>
      <div className="w-full">
        <div className="space-x-1">
          <span className="font-semibold">
            {(comment.commentUser as any).name}
          </span>
          <span className="text-sm text-neutral-500" suppressHydrationWarning>
            {getRelativeTimeString(new Date(comment.createdAt))}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{comment.comment}</div>
      </div>
    </div>
  );
}
