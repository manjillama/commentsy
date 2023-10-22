import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IComment } from "@/interfaces/IComment";
import { COMMENT_STATUS } from "@/interfaces/IGroup";
import api from "@/utils/api";
import { useState } from "react";
import {
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Dialog, Spinner } from "../ui";

export default function CommentItemActions({
  comment,
  setComment,
}: {
  comment: IComment;
  setComment: (comment: IComment) => void;
}) {
  const [open, isOpen] = useState(false);
  const [openDialog, isOpenDialog] = useState(false);
  const [commentStatusLoader, setCommentStatusLoader] = useState(false);

  const handleCommentStatusUpdate = async (
    status: COMMENT_STATUS.approved | COMMENT_STATUS.deleted
  ) => {
    isOpen(false);
    isOpenDialog(false);
    setCommentStatusLoader(true);
    const data = await api.patch(
      `/api/apps/${comment.app}/comments/${comment._id}/status`,
      {
        status,
      }
    );
    if (data.status === "success") setComment({ ...comment, status });
    setCommentStatusLoader(false);
  };

  if (commentStatusLoader)
    return (
      <div className="h-[18px] w-[18px]">
        <Spinner color="dark" size="sm" />
      </div>
    );

  return (
    <DropdownMenu.Root open={open}>
      <DropdownMenu.Trigger asChild>
        <button
          className="outline-none block h-[28px] w-[28px] rounded-md hover:bg-neutral-200"
          aria-label="Account options"
          onClick={() => isOpen(true)}
        >
          <DotsHorizontalIcon className="mx-auto" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onInteractOutside={() => isOpen(false)}
          align="end"
          sideOffset={5}
          className="w-[250px] bg-white border border-neutral-200 py-2 rounded-lg"
        >
          <DropdownMenu.Item className="outline-none">
            <button
              disabled={
                comment.status === "approved" || comment.status === "deleted"
              }
              onClick={() => handleCommentStatusUpdate(COMMENT_STATUS.approved)}
              className="disabled:opacity-40 text-sm block w-full text-left outline-none px-4 py-2 hover:bg-neutral-100"
            >
              Approve
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="outline-none">
            <Dialog
              open={openDialog}
              openChange={(_open) => {
                if (!_open) isOpen(_open);
                isOpenDialog(_open);
              }}
              triggerNode={"Delete"}
              triggerProps={{
                disabled: comment.status === COMMENT_STATUS.deleted,
              }}
              triggerClass="disabled:opacity-40 text-sm block w-full text-left outline-none px-4 py-2 hover:bg-neutral-100"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  Are you absolutely sure?
                </h3>
                <p className="text-neutral-500">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    isOpen(false);
                    isOpenDialog(false);
                  }}
                  className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleCommentStatusUpdate(COMMENT_STATUS.deleted)
                  }
                  className="py-2 px-4 block bg-red-200 text-red-600 rounded-lg hover:bg-red-300"
                >
                  Yes, I&apos;m sure
                </button>
              </div>
            </Dialog>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="border-t" />
          <DropdownMenu.Item className="outline-none">
            <button
              disabled={comment.isSpam}
              className="disabled:opacity-40 text-sm block w-full text-left outline-none px-4 py-2 hover:bg-neutral-100"
            >
              <ExclamationTriangleIcon className="inline mr-1" />{" "}
              {comment.isSpam ? "Marked as spam" : "Mark as spam"}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
