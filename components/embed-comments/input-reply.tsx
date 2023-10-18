import { Session } from "next-auth";
import Avatar from "../ui/avatar";
import { useState } from "react";
import styles from "./Comment.module.css";
import api from "@/utils/api";
import { CommentData } from ".";
import { Spinner } from "../ui";
import { IComment } from "@/interfaces/IComment";
import { IUser } from "@/interfaces/IUser";
import { ParentSiteData } from "./input-comment";

type Props = {
  commentData: CommentData;
  parentCommentId: string;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
  setShowReplyInput: (show: boolean) => void;
  commentReplies: IComment[];
  setCommentReplies: (comments: IComment[]) => void;
  handleSubmittedData: (newComment: IComment) => void;
};

export default function InputReply({
  commentData,
  parentSiteData,
  parentCommentId,
  user,
  setShowReplyInput,
  handleSubmittedData,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    const data = await api.post<IComment & { user: IUser }>("/api/comments", {
      appCode: commentData.appCode,
      identifier: commentData.identifier,
      comment,
      parentCommentId: parentCommentId,
      pageTitle: parentSiteData?.title,
      pageUrl: parentSiteData?.url,
    });
    if (data.status === "success") {
      data.data.user = user as IUser;
      handleSubmittedData(data.data);
      setShowReplyInput(false);
    }
    setSubmitting(false);
  };

  const redirectToLoginIfUserNotLoggedIn = () => {
    // if (user || !parentSiteData) return;
    // setIsInputFocused(true);
    // if (window.top)
    //   window.top.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/signin?callbackUrl=${parentSiteData.url}`;
  };

  if (submitting)
    return (
      <div className="h-[32px] w-[32px] my-4">
        <Spinner color="dark" size="sm" />
      </div>
    );

  return (
    <div className="flex space-x-3 my-4">
      <div className="shrink-0">
        <Avatar user={user} size="sm" />
      </div>
      <div className="w-full">
        <div className={styles.growWrap}>
          <textarea
            autoFocus
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder="Add a reply..."
            onInput={(e) => {
              if (e.currentTarget.parentNode)
                (e.currentTarget.parentNode as any).dataset.replicatedValue =
                  e.currentTarget.value;
            }}
            onFocus={redirectToLoginIfUserNotLoggedIn}
            className={`w-full border border-neutral-300 rounded-lg p-3`}
          />
        </div>
        <div className="flex mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setComment("");
                setShowReplyInput(false);
              }}
              className="text-sm py-2 px-3 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-sm py-2 px-5 block bg-black text-white rounded-lg hover:opacity-75"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
