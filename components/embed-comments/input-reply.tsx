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
  const [formProps, setFormProps] = useState<{
    comment: string;
    anonUser: null | {};
  }>({
    comment: "",
    anonUser: null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const data = await api.post<IComment & { user: IUser }>("/api/comments", {
      appCode: commentData.appCode,
      identifier: commentData.identifier,
      comment: formProps.comment,
      parentCommentId: parentCommentId,
      pageTitle: parentSiteData?.title,
      pageUrl: parentSiteData?.url,
    });
    if (data.status === "success") {
      if (user) {
        data.data.user = user as IUser;
        handleSubmittedData(data.data);
        setShowReplyInput(false);
      } else {
        // Show toast for pending message
        console.log("Success, your comment will be visible once it's approved");
      }
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
      <div className="h-[32px] w-[32px] my-4">
        <Spinner color="dark" size="sm" />
      </div>
    );

  return (
    <div className="flex space-x-3 my-4">
      <div className="shrink-0">
        <Avatar user={user} size="sm" />
      </div>
      <form onSubmit={handleSubmit} className="w-full">
        <div className={styles.growWrap}>
          <textarea
            autoFocus
            onChange={(e) =>
              setFormProps({ ...formProps, comment: e.target.value })
            }
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
        <div className="mt-4">
          {!user && (
            <div className="max-w-xs space-y-4 mb-4">
              <input
                placeholder="Name"
                className="border border-neutral-300 w-full rounded-lg p-2"
                name="name"
                type="text"
                onChange={handleAnonUserInput}
                required
              />
              <input
                placeholder="Email"
                className="border border-neutral-300 w-full rounded-lg p-2"
                name="email"
                type="email"
                onChange={handleAnonUserInput}
                required
              />
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowReplyInput(false);
              }}
              className="text-sm py-2 px-3 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button className="text-sm py-2 px-5 block bg-black text-white rounded-lg hover:opacity-75">
              Reply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
