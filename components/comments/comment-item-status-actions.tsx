import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Dialog } from "../ui";
import { COMMENT_STATUS } from "@/interfaces/IGroup";
import api from "@/utils/api";
import { IComment } from "@/interfaces/IComment";

export default function CommentItemStatusActions({
  comment,
  setCommentStatusLoader,
  setComment,
  setIsDropdownOpen,
}: {
  comment: IComment;
  setCommentStatusLoader: (loading: boolean) => void;
  setComment: (comment: IComment) => void;
  setIsDropdownOpen: (open: boolean) => void;
}) {
  const [openDialog, isOpenDialog] = useState(false);

  const handleCommentStatusUpdate = async (
    status: COMMENT_STATUS.approved | COMMENT_STATUS.deleted
  ) => {
    setIsDropdownOpen(false);
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

  return (
    <>
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
            if (!_open) setIsDropdownOpen(_open);
            isOpenDialog(_open);
          }}
          triggerNode={"Delete"}
          triggerProps={{
            disabled: comment.status === COMMENT_STATUS.deleted,
          }}
          triggerClass="disabled:opacity-40 text-sm block w-full text-left outline-none px-4 py-2 hover:bg-neutral-100"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Are you sure to delete?</h3>
            <p className="text-neutral-500">
              This action cannot be undone. Deleting a comment will also delete
              all its replies.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                isOpenDialog(false);
              }}
              className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCommentStatusUpdate(COMMENT_STATUS.deleted)}
              className="py-2 px-4 block bg-red-200 text-red-600 rounded-lg hover:bg-red-300"
            >
              Yes, delete
            </button>
          </div>
        </Dialog>
      </DropdownMenu.Item>
    </>
  );
}
