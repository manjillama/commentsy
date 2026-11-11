import type { CommentDataWithUserCommentSyles } from "@/components/embed-comments";
import type { IComment } from "@/interfaces/IComment";

export function removeDeletedComment(
  data: CommentDataWithUserCommentSyles,
  comment: IComment,
  count: number,
): CommentDataWithUserCommentSyles {
  const parentId = comment.parent ? String(comment.parent) : undefined;
  const isReply = Boolean(parentId);
  const hasReplies = comment.repliesCount > 0;

  // Removing the last reply also removes its already-deleted parent thread.
  const removesEmptyThread =
    isReply &&
    data.comments.some(
      (item) =>
        item._id === parentId &&
        item.status === "deleted" &&
        item.repliesCount === 1,
    );

  const updatedComments = data.comments.map((item) => {
    if (item._id === comment._id) {
      // Keep a placeholder while replies still belong to this comment.
      return {
        ...item,
        status: "deleted" as const,
        comment: "",
        gif: undefined,
        user: undefined,
        anonUser: undefined,
        commentUser: {
          name: "Deleted comment",
          email: "",
          avatarBackgroundColor: "#fed0bb" as const,
        },
      };
    }

    if (isReply && item._id === parentId) {
      return { ...item, repliesCount: Math.max(0, item.repliesCount - 1) };
    }

    return item;
  });

  const remainingComments = updatedComments.filter((item) => {
    const isEmptyDeletedThread =
      item.status === "deleted" && item.repliesCount === 0;
    return !isEmptyDeletedThread;
  });

  // `total` counts top-level threads, not individual replies.
  const removesTopLevelComment = !isReply && !hasReplies;
  const removedThreadsCount =
    removesEmptyThread || removesTopLevelComment ? 1 : 0;

  return {
    ...data,
    comments: remainingComments,
    total: Math.max(0, data.total - removedThreadsCount),
    totalCommentsAndReplies: Math.max(0, data.totalCommentsAndReplies - count),
    commentsCount: Math.max(0, data.commentsCount - count),
  };
}
