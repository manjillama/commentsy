import { Session } from "next-auth";
import { CommentDataWithUserCommentSyles } from ".";
import CommentItem from "./comment-item";
import { ParentSiteData } from "./input-comment";
import { IComment } from "@/interfaces/IComment";

type Props = {
  comments: CommentDataWithUserCommentSyles["comments"];
  commentData: CommentDataWithUserCommentSyles;
  parentSiteData: ParentSiteData;
  user?: Session["user"];
};
export default function CommentList({
  comments,
  commentData,
  parentSiteData,
  user,
}: Props) {
  const transformToObject: { [key: string]: IComment } = comments.reduce(
    (accumulator, value) => ({ ...accumulator, [value._id]: value }),
    {}
  );
  if (comments.length <= 0)
    return (
      <p className="ml-12 text-neutral-500">
        No comments yet. Be the first one to comment.
      </p>
    );
  return (
    <div className="space-y-6">
      {Object.values(transformToObject).map((comment) => (
        <CommentItem
          key={comment._id}
          user={user}
          comment={comment}
          commentData={commentData}
          parentSiteData={parentSiteData}
        />
      ))}
    </div>
  );
}
