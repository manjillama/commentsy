import type { CommentDataWithUserCommentSyles } from "@/components/embed-comments";
import type { IComment } from "@/interfaces/IComment";

export function removeDeletedComment(data: CommentDataWithUserCommentSyles, comment: IComment, count: number): CommentDataWithUserCommentSyles {
  const removesEmptyThread = comment.parent && data.comments.some(item => item._id === String(comment.parent) && item.status === "deleted" && item.repliesCount === 1);
  return {
    ...data,
    comments: data.comments.map(item =>
      item._id === comment._id ? { ...item, status: "deleted" as const, comment: "", gif: undefined, user: undefined, anonUser: undefined, commentUser: { name: "Deleted comment", email: "", avatarBackgroundColor: "#fed0bb" as const } } :
      comment.parent && item._id === String(comment.parent) ? { ...item, repliesCount: Math.max(0, item.repliesCount - 1) } : item
    ).filter(item => !(item.status === "deleted" && item.repliesCount === 0)),
    total: Math.max(0, data.total - (removesEmptyThread ? 1 : comment.parent || comment.repliesCount > 0 ? 0 : 1)),
    totalCommentsAndReplies: Math.max(0, data.totalCommentsAndReplies - count),
    commentsCount: Math.max(0, data.commentsCount - count),
  };
}
