import { useCommentMutations } from "./comment-mutations";
import FormFeedback from "../ui/form-feedback";
import CommentContent from "./comment-content";
import { IComment } from "@/interfaces/IComment";
import { CommentDataWithUserCommentSyles } from ".";
import { Session } from "next-auth";
import { ParentSiteData } from "./input-comment";
import { useEffect, useState } from "react";
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
  const mutations = useCommentMutations();
  const removedReplies = mutations?.deleted.filter(item => item.parent === comment._id) ?? [];
  const removedIds = new Set(removedReplies.map(item => item.id));
  const repliesClosed = comment.status === "deleted" || comment.isSpam || Boolean(mutations?.deleted.some(item => item.id === comment._id));
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

  const visibleReplies = commentReplies.filter(item => !removedIds.has(item._id));
  const visibleNewReplies = newSubmittComments.filter(item => !removedIds.has(item._id));
  const remainingRepliesCount = Math.max(0, totalRepliesCount - removedReplies.length);

  const [nextPage, setNextPage] = useState(1);
  const [fetchError, setFetchError] = useState("");
  useEffect(() => {
    if (comment.repliesCount > 0) void handleFetchReplies();
    // Fetch the first three replies once when this thread mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment._id]);

  const handleFetchReplies = async () => {
    setIsCommentFetching(true);
    setFetchError("");
    try {
      const data = await api.get<{
        comments: IComment[];
        total: number;
        size: number;
      }>(
        `/api/comments/${comment._id}/replies?page=${nextPage}&limit=3&sort=${params.sort}`
      );

      if (data.status === "success") {
        const newComments = data.data.comments;
        if (newComments.length > 0) {
          setCommentReplies(current => Array.from(new Map([...current, ...newComments].map(item => [item._id, item])).values()));
          setNewSubmittiedComments(current => current.filter(item => !newComments.some(fetched => fetched._id === item._id)));
          setNextPage(nextPage + 1);
          setTotalRepliesCount(data.data.total + removedReplies.length);
          setParams({
            ...params,
            currentPage: params.currentPage + 1,
          });
        }
      } else setFetchError("Unable to load replies. Please try again.");
    } catch { setFetchError("Unable to load replies. Please try again."); }
    finally { setIsCommentFetching(false); }
  };

  const handleSubmittedData = (newComment: IComment): void => {
    setNewSubmittiedComments([...newSubmittComments, newComment]);
    setTotalRepliesCount(count => count + 1);
    mutations?.onReplyCreated(comment._id);
  };

  return (
    <div>
      <FormFeedback message={fetchError} error={Boolean(fetchError)} />
      {!repliesClosed && (showReplyInput ? (
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
      ))}
      {visibleReplies.length > 3 && (
        <div>
          <div className="flex items-center space-x-4">
            <div style={{ borderTop: "1px solid #ccc" }} className="w-[25px]" />
            <button
              className="opacity-50 text-sm font-semibold"
              onClick={() => {
                setParams({ ...params, currentPage: 1 });
                setCommentReplies(current => current.slice(0, 3));
                setNextPage(2);
              }}
            >
              Show fewer replies
            </button>
          </div>
        </div>
      )}

      {visibleReplies.map((comment) => (
        <CommentReplyItem key={comment._id} comment={comment} user={user} commentData={commentData} />
      ))}
      {visibleNewReplies.map((comment) => (
        <CommentReplyItem key={comment._id} comment={comment} user={user} commentData={commentData} />
      ))}

      {remainingRepliesCount > 0 &&
        visibleReplies.length + visibleNewReplies.length <
          remainingRepliesCount && (
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
                  remainingRepliesCount -
                    visibleReplies.length -
                    visibleNewReplies.length
                )}{" "}
                {remainingRepliesCount -
                  visibleReplies.length -
                  visibleNewReplies.length >
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

function CommentReplyItem({ comment, user, commentData }: { comment: IComment; user?: Session["user"]; commentData: CommentDataWithUserCommentSyles }) {
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
        <CommentContent comment={comment} user={user} palette={commentData.userCommentStyles} />
      </div>
    </div>
  );
}
