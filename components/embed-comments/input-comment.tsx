import { Session } from "next-auth";
import Avatar from "../ui/avatar";
import { useState } from "react";
import styles from "./EmbedComments.module.css";
import api from "@/utils/api";
import { CommentData } from ".";
import { Spinner } from "../ui";
import { IComment } from "@/interfaces/IComment";
import { IUser } from "@/interfaces/IUser";

export type ParentSiteData = {
  title: string;
  url: string;
} | null;
export default function InputComment({
  user,
  commentData,
  setCommentData,
  parentCommentId,
  parentSiteData,
}: {
  commentData: CommentData;
  setCommentData: (commentData: CommentData) => void;
  parentCommentId?: string;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const data = await api.post<IComment & { user: IUser }>("/api/comments", {
      appCode: commentData.appCode,
      identifier: commentData.identifier,
      comment,
      parentCommentId,
      pageTitle: parentSiteData?.title,
      pageUrl: parentSiteData?.url,
    });
    setSubmitting(false);
    if (data.status === "success") {
      data.data.user = user as IUser;
      const newComments = [...commentData.comments];
      newComments.unshift(data.data);
      setCommentData({
        ...commentData,
        comments: newComments,
      });
    }
  };

  const redirectToLoginIfUserNotLoggedIn = () => {
    // if (user || !parentSiteData) return;
    // setIsInputFocused(true);
    // if (window.top)
    //   window.top.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/signin?callbackUrl=${parentSiteData.url}`;
  };

  if (submitting)
    return (
      <div className="h-[32px] w-[32px] mb-8">
        <Spinner theme="dark" />
      </div>
    );

  return (
    <div className="flex space-x-3 mb-8">
      <div className="shrink-0">
        <Avatar user={user} />
      </div>
      <div className="w-full">
        <div className={styles.growWrap}>
          <textarea
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder="Add a comment..."
            onInput={(e) => {
              if (e.currentTarget.parentNode)
                (e.currentTarget.parentNode as any).dataset.replicatedValue =
                  e.currentTarget.value;
            }}
            onFocus={() => {
              setIsInputFocused(true);
              redirectToLoginIfUserNotLoggedIn();
            }}
            className={`w-full border border-neutral-300 rounded-lg p-3`}
          />
        </div>
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
