import { getRelativeTimeString } from "@/utils";
import Avatar from "../ui/avatar";
import { IComment } from "@/interfaces/IComment";
import { useState } from "react";
import { Dialog } from "../ui";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import ReadMoreText from "../read-more-text";
import CommentItemActions from "./comment-item-actions";

export default function CommentItem({
  comment: commentProps,
}: {
  comment: IComment;
}) {
  const [comment, setComment] = useState(commentProps);

  return (
    <div className="flex md:items-center md:flex-row flex-col w-full text-left border-t p-4 first:border-t-0 md:space-x-20">
      <CommentItemDialog comment={comment} />
      <div className="space-x-1">
        {statusBadge(comment.status)}
        <span
          style={{ backgroundColor: comment.parent ? "#fca5a5" : "#fcd34d" }}
          className="text-black rounded-full px-2 py-1 text-[0.6rem] capitalize"
        >
          {comment.parent ? "Reply" : "Comment"}
        </span>
      </div>
      <div className="flex items-center justify-between md:w-auto w-full space-x-4">
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1 text-neutral-500 text-sm">
            <span suppressHydrationWarning>
              {getRelativeTimeString(new Date(comment.createdAt))}
            </span>
            <span className="max-w-[120px] overflow-ellipsis overflow-hidden whitespace-nowrap">
              by {(comment.commentUser as any).name}
            </span>
          </div>
          <div>
            <Avatar user={comment.commentUser as any} size="sm" />
          </div>
        </div>
        <div>
          <CommentItemActions comment={comment} setComment={setComment} />
        </div>
      </div>
    </div>
  );
}

const CommentItemDialog = ({ comment }: { comment: IComment }) => {
  const [open, setOpen] = useState(false);

  const triggerNode = () => (
    <div>
      <div className="font-semibold">{comment.pageTitle}</div>
      <div className="whitespace-nowrap overflow-ellipsis overflow-hidden text-neutral-500">
        {comment.comment}
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      openChange={setOpen}
      triggerNode={triggerNode()}
      triggerClass="w-full block flex-1 overflow-hidden w-full text-left"
      maxWidth="md"
    >
      <h3 className="text-2xl font-semibold">
        <a
          href={comment.pageUrl}
          className="flex items-center"
          rel="noreferrer"
          target="_blank"
        >
          {comment.pageTitle}&nbsp;{" "}
          <ExternalLinkIcon className="text-blue-600" />
        </a>
      </h3>
      <div className="space-x-1 mb-6">
        {statusBadge(comment.status)}
        <span
          style={{ backgroundColor: comment.parent ? "#fca5a5" : "#fcd34d" }}
          className="text-black rounded-full px-2 py-1 text-[0.6rem] capitalize"
        >
          {comment.parent ? "Reply" : "Comment"}
        </span>
      </div>
      <div className="flex space-x-2 mb-4">
        <Avatar user={comment.commentUser as any} />
        <div>
          <div className="space-x-2">
            <span className="font-semibold">
              {(comment.commentUser as any).name}
            </span>
            <span className="text-sm text-neutral-500" suppressHydrationWarning>
              {getRelativeTimeString(new Date(comment.createdAt))}
            </span>
          </div>
          <div className="text-sm text-neutral-500">
            {comment.repliesCount}{" "}
            {comment.repliesCount > 1 ? "replies" : "reply"}
          </div>
        </div>
      </div>

      <div className="whitespace-pre-wrap">
        <ReadMoreText text={comment.comment} />
      </div>
      <div className="flex justify-end">
        <button
          className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

const statusBadge = (status: "pending" | "approved" | "deleted" | "spam") => {
  let color = "";
  if (status === "pending") color = "#fb923c";
  else if (status === "approved") color = "#16a34a";
  else if (status === "deleted") color = "#dc2626";
  else color = "#171717";
  return (
    <span
      style={{ backgroundColor: color }}
      className="text-white rounded-full px-2 py-1 text-[0.6rem] capitalize"
    >
      {status}
    </span>
  );
};
