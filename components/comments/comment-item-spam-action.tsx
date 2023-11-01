import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Dialog } from "../ui";
import api from "@/utils/api";
import { IComment } from "@/interfaces/IComment";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function CommentItemSpamAction({
  comment,
  setCommentStatusLoader,
  setComment,
  setIsDropdownOpen,
}: {
  comment: IComment;
  setCommentStatusLoader: (loading: boolean) => void;
  setComment: (comment: IComment | null) => void;
  setIsDropdownOpen: (open: boolean) => void;
}) {
  const [openDialog, isOpenDialog] = useState(false);

  const handleMarkCommentAsSpam = async () => {
    setIsDropdownOpen(false);
    isOpenDialog(false);
    setCommentStatusLoader(true);
    const data = await api.patch(
      `/api/apps/${comment.app}/comments/${comment._id}/mark-as-spam`,
      {}
    );
    if (data.status === "success") setComment(null);
    setCommentStatusLoader(false);
  };

  return (
    <DropdownMenu.Item className="outline-none">
      <Dialog
        open={openDialog}
        openChange={(_open) => {
          if (!_open) setIsDropdownOpen(_open);
          isOpenDialog(_open);
        }}
        triggerNode={
          <>
            <ExclamationTriangleIcon className="inline mr-1" /> Mark as spam
          </>
        }
        triggerClass="text-sm block w-full text-left outline-none px-4 py-2 hover:bg-neutral-100"
      >
        <div className="mb-6">
          <h3 className="font-semibold text-lg">Are you absolutely sure?</h3>
          <p className="text-neutral-500">
            This action cannot be undone. Marking a comment as a spam will
            remove it from comments and all its replies will be deleted.
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
            onClick={() => handleMarkCommentAsSpam()}
            className="py-2 px-4 block bg-red-200 text-red-600 rounded-lg hover:bg-red-300"
          >
            Yes, I&apos;m sure
          </button>
        </div>
      </Dialog>
    </DropdownMenu.Item>
  );
}
