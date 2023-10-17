import { Session } from "next-auth";
import Avatar from "../ui/avatar";
import { useEffect, useState } from "react";
import styles from "./EmbedComments.module.css";
import api from "@/utils/api";
import { CommentData } from ".";

export type ParentSiteData = {
  title: string;
  url: string;
} | null;
export default function InputComment({
  user,
  commentData,
  parentCommentId,
  parentSiteData,
  triggerCalcEmbedContentHeight,
  setTriggetCalcEmbedContentHeight,
}: {
  commentData: CommentData;
  parentCommentId?: string;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
  triggerCalcEmbedContentHeight: number;
  setTriggetCalcEmbedContentHeight: (count: number) => void;
}) {
  const [comment, setComment] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const redirectToLoginIfUserNotLoggedIn = () => {
    if (user || !parentSiteData) return;
    setIsInputFocused(true);
    if (window.top)
      window.top.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/signin?callbackUrl=${parentSiteData.url}`;
  };

  useEffect(() => {
    setTriggetCalcEmbedContentHeight(triggerCalcEmbedContentHeight + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInputFocused]);

  const handleSubmit = async () => {
    console.log("parentSiteData", parentSiteData);

    await api.post("/api/comments", {
      appCode: commentData.appCode,
      identifier: commentData.identifier,
      comment,
      parentCommentId,
      pageTitle: parentSiteData?.title,
      pageUrl: parentSiteData?.url,
    });
  };

  return (
    <div className="flex space-x-3 mb-8">
      <div className="shrink-0">
        <Avatar user={user} />
      </div>
      <div className="w-full">
        <div
          onInput={(e) => setComment(e.currentTarget.innerHTML)}
          placeholder="Add a comment..."
          onFocus={() => {
            setIsInputFocused(true);
            redirectToLoginIfUserNotLoggedIn();
          }}
          contentEditable
          className={`${styles.commentInput} border border-neutral-300 rounded-lg p-3`}
        />
        {isInputFocused && (
          <div className="flex mt-4">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setComment("");
                  setIsInputFocused(false);
                }}
                className="text-sm py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="text-sm py-2 px-4 block bg-black text-white rounded-lg hover:opacity-75"
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
