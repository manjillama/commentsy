import { Session } from "next-auth";
import { CommentData } from ".";
import CommentItem from "./comment-item";
import { ParentSiteData } from "./input-comment";
import { IComment } from "@/interfaces/IComment";

type Props = {
  comments: CommentData["comments"];
  commentData: CommentData;
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
