import { IComment } from "@/interfaces/IComment";
import Avatar from "../ui/avatar";
import { getRelativeTimeString } from "@/utils";
import { ParentSiteData } from "./input-comment";
import { CommentDataWithUserCommentSyles } from ".";
import { Session } from "next-auth";
import CommentReplies from "./comment-replies";
import ReadMoreText from "../read-more-text";

type Props = {
  comment: IComment;
  commentData: CommentDataWithUserCommentSyles;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
};
export default function CommentItem({
  comment,
  commentData,
  user,
  parentSiteData,
}: Props) {
  return (
    <div className="flex space-x-3">
      <div className="shrink-0">
        <Avatar user={comment.commentUser as any} />
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
        <div className="whitespace-pre-wrap">
          <ReadMoreText text={comment.comment} />
        </div>
        <CommentReplies
          comment={comment}
          commentData={commentData}
          user={user}
          parentSiteData={parentSiteData}
        />
      </div>
    </div>
  );
}
