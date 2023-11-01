import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IComment } from "@/interfaces/IComment";
import { useState } from "react";
import {
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Spinner } from "../ui";
import CommentItemStatusActions from "./comment-item-status-actions";
import CommentItemSpamAction from "./comment-item-spam-action";

export default function CommentItemActions({
  comment,
  setComment,
}: {
  comment: IComment;
  setComment: (comment: IComment | null) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [commentStatusLoader, setCommentStatusLoader] = useState(false);

  if (commentStatusLoader)
    return (
      <div className="h-[18px] w-[18px]">
        <Spinner color="dark" size="sm" />
      </div>
    );

  return (
    <DropdownMenu.Root open={isDropdownOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="outline-none block h-[28px] w-[28px] rounded-md hover:bg-neutral-200"
          aria-label="Account options"
          onClick={() => setIsDropdownOpen(true)}
        >
          <DotsHorizontalIcon className="mx-auto" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onInteractOutside={() => setIsDropdownOpen(false)}
          align="end"
          sideOffset={5}
          className="w-[250px] bg-white border border-neutral-200 py-2 rounded-lg"
        >
          <CommentItemStatusActions
            comment={comment}
            setIsDropdownOpen={setIsDropdownOpen}
            setComment={setComment}
            setCommentStatusLoader={setCommentStatusLoader}
          />
          <DropdownMenu.Separator className="border-t" />
          <CommentItemSpamAction
            comment={comment}
            setIsDropdownOpen={setIsDropdownOpen}
            setComment={setComment}
            setCommentStatusLoader={setCommentStatusLoader}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
