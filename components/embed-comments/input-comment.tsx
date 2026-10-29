import type { Dispatch, SetStateAction } from "react";
import { Session } from "next-auth";
import { CommentDataWithUserCommentSyles } from ".";
import CommentComposer from "./comment-composer";

export type ParentSiteData = { title: string; url: string } | null;

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  setCommentData: Dispatch<SetStateAction<CommentDataWithUserCommentSyles>>;
  user?: Session["user"];
};

export default function InputComment({ commentData, setCommentData, user }: Props) {
  return <CommentComposer commentData={commentData} user={user}
    onPosted={comment => setCommentData(current => ({
      ...current,
      comments: [comment, ...current.comments],
      total: current.total + 1,
      commentsCount: current.commentsCount + 1,
      totalCommentsAndReplies: current.totalCommentsAndReplies + 1,
    }))} />;
}
