import GifPicker from "./gif-picker";
import { CommentGif } from "@/utils/gif";
import { registerGifShare } from "@/lib/klipy";
import { Session } from "next-auth";
import Avatar from "../ui/avatar";
import { useState } from "react";
import styles from "./Comment.module.css";
import api from "@/utils/api";
import { CommentDataWithUserCommentSyles } from ".";
import { Spinner } from "../ui";
import { IComment } from "@/interfaces/IComment";
import { IUser } from "@/interfaces/IUser";

export type ParentSiteData = {
  title: string;
  url: string;
} | null;

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  setCommentData: (commentData: CommentDataWithUserCommentSyles) => void;
  user?: Session["user"];
  parentSiteData: ParentSiteData;
};

export default function InputComment({
  commentData,
  parentSiteData,
  setCommentData,
  user,
}: Props) {
  const [gif, setGif] = useState<CommentGif>();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formProps, setFormProps] = useState<{
    comment: string;
    anonUser: null | { name?: string; email?: string };
  }>({
    comment: "",
    anonUser: null,
  });
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formProps.comment.trim() && !gif) {
      setError("Add a comment or choose a GIF.");
      return;
    }
    setError("");
    setSubmitting(true);
    const data = await api.post<IComment & { user: IUser }>("/api/comments", {
      appCode: commentData.appCode,
      identifier: commentData.identifier,
      comment: formProps.comment,
      gif,
      pageTitle: parentSiteData?.title,
      pageUrl: parentSiteData?.url,
      anonUser: formProps.anonUser,
    });
    if (data.status !== "success") {
      setError(data.errors.join(" ") || data.message || "Unable to post. Please try again.");
      setSubmitting(false);
      return;
    }
    if (data.status === "success") {
      if (gif) void registerGifShare(gif);
      setGif(undefined);
      data.data.commentUser = (user as IUser) ?? data.data.anonUser;
      const newComments = [...commentData.comments];
      newComments.unshift(data.data);
      setCommentData({
        ...commentData,
        comments: newComments,
      });
      setIsInputFocused(false);
    }
    setFormProps({ ...formProps, comment: "" });
    setSubmitting(false);
  };

  const handleAnonUserInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormProps({
      ...formProps,
      anonUser: { ...formProps.anonUser, [name]: value },
    });
  };

  const redirectToLoginIfUserNotLoggedIn = () => {
    // if (user || !parentSiteData) return;
    // setIsInputFocused(true);
    // if (window.top)
    //   window.top.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/signin?callbackUrl=${parentSiteData.url}`;
  };

  if (submitting)
    return (
      <div className="h-[32px] w-[32px] mb-6">
        <Spinner
          styles={{
            backgroundColor: commentData.userCommentStyles.primary.color,
          }}
        />
      </div>
    );

  return (
    <div className="flex space-x-3 mb-6">
      <div className="shrink-0">
        <Avatar user={user} />
      </div>
      <form onSubmit={handleSubmit} className="w-full">
        {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
        <div className={styles.growWrap}>
          <textarea
            value={formProps.comment}
            maxLength={5000}
            style={commentData.userCommentStyles.primary}
            name="comment"
            onChange={(e) =>
              setFormProps({ ...formProps, comment: e.target.value })
            }
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
          <div className="mt-4">
            <GifPicker value={gif} onChange={setGif} palette={commentData.userCommentStyles} />
            {!user && (
              <div className="max-w-xs space-y-4 mb-4">
                <input
                  style={commentData.userCommentStyles.primary}
                  placeholder="Name"
                  className="border border-neutral-300 w-full rounded-lg p-2"
                  name="name"
                  value={formProps.anonUser?.name ?? ""}
                  type="text"
                  onChange={handleAnonUserInput}
                  required
                />
                <input
                  style={commentData.userCommentStyles.primary}
                  placeholder="Email"
                  className="border border-neutral-300 w-full rounded-lg p-2"
                  name="email"
                  value={formProps.anonUser?.email ?? ""}
                  type="email"
                  onChange={handleAnonUserInput}
                  required
                />
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsInputFocused(false);
                }}
                style={commentData.userCommentStyles.primary}
                className="text-sm py-2 px-4 block rounded-lg hover:opacity-60"
              >
                Cancel
              </button>
              <button
                style={commentData.userCommentStyles.accent}
                className="text-sm py-2 px-5 block rounded-lg hover:opacity-75"
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
