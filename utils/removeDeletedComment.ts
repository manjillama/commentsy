import type { CommentDataWithUserCommentSyles } from "@/components/embed-comments";
import type { IComment } from "@/interfaces/IComment";

export function removeDeletedComment(data: CommentDataWithUserCommentSyles, comment: IComment, count: number): CommentDataWithUserCommentSyles {
  return {
    ...data,
    comments: data.comments.filter(item => item._id !== comment._id).map(item =>
      comment.parent && item._id === String(comment.parent) ? { ...item, repliesCount: Math.max(0, item.repliesCount - 1) } : item
    ),
    total: Math.max(0, data.total - (comment.parent ? 0 : 1)),
    totalCommentsAndReplies: Math.max(0, data.totalCommentsAndReplies - count),
    commentsCount: Math.max(0, data.commentsCount - count),
  };
}
