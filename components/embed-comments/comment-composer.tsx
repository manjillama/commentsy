"use client";

import { FormEvent, useRef, useState } from "react";
import { Session } from "next-auth";
import { IComment } from "@/interfaces/IComment";
import { IUser } from "@/interfaces/IUser";
import { CommentGif } from "@/utils/gif";
import { requestParentPageData } from "@/utils/parentPageData";
import { registerGifShare } from "@/lib/klipy";
import api from "@/utils/api";
import { CommentDataWithUserCommentSyles } from ".";
import Avatar from "../ui/avatar";
import FormFeedback from "../ui/form-feedback";
import { Spinner } from "../ui";
import CommentLength from "./comment-length";
import GifPicker from "./gif-picker";
import styles from "./Comment.module.css";

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  user?: Session["user"];
  parentCommentId?: string;
  onPosted: (comment: IComment) => void;
  onCancel?: () => void;
};

export default function CommentComposer({ commentData, user, parentCommentId, onPosted, onCancel }: Props) {
  const isReply = Boolean(parentCommentId);
  const noun = isReply ? "reply" : "comment";
  const palette = commentData.userCommentStyles;
  const [text, setText] = useState("");
  const [gif, setGif] = useState<CommentGif>();
  const [guest, setGuest] = useState({ name: "", email: "" });
  const [expanded, setExpanded] = useState(isReply);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const posting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (posting.current) return;
    if (!text.trim() && !gif) { setError("Add a comment or choose a GIF."); return; }
    posting.current = true;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      // Read metadata at submission time, including after host-page navigation.
      const page = await requestParentPageData();
      const response = await api.post<IComment>("/api/comments", {
        appCode: commentData.appCode,
        identifier: commentData.identifier,
        comment: text,
        gif,
        parentCommentId,
        pageTitle: page.title,
        pageUrl: page.url,
        anonUser: user ? undefined : guest,
      });
      if (response.status !== "success") {
        setError(response.errors.join(" ") || response.message);
        return;
      }
      if (gif) void registerGifShare(gif);
      const posted = { ...response.data, commentUser: (user as IUser) ?? response.data.anonUser };
      setText("");
      setGif(undefined);
      if (!isReply) setExpanded(false);
      if (posted.status === "pending") setMessage(`Your ${noun} was submitted for approval.`);
      else onPosted(posted);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to post. Please try again.");
    } finally {
      posting.current = false;
      setSubmitting(false);
    }
  }

  if (submitting) return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 my-4">
      <div className="h-[24px] w-[24px] shrink-0">
        <Spinner styles={{ backgroundColor: palette.primary.color }} size="sm" />
      </div>
      <span className="text-sm opacity-70">Posting {noun}…</span>
    </div>
  );

  return (
    <div className={`flex space-x-3 ${isReply ? "my-4" : "mb-6"}`}>
      <div className="shrink-0"><Avatar user={user} size={isReply ? "sm" : undefined} /></div>
      <form onSubmit={handleSubmit} className="w-full">
        <FormFeedback message={error || message} error={Boolean(error)} />
        <div className={styles.growWrap} data-replicated-value={text}>
          <textarea aria-label={isReply ? "Reply" : "Comment"}
            value={text} maxLength={5000} style={palette.primary} name="comment" autoFocus={isReply}
            onChange={event => setText(event.target.value)} onFocus={() => setExpanded(true)}
            placeholder={isReply ? "Add a reply..." : "Add a comment..."}
            className="w-full border border-neutral-300 rounded-lg p-3" />
        </div>
        <CommentLength length={text.length} />
        {expanded && <div className="mt-4">
          <GifPicker value={gif} onChange={setGif} palette={palette} />
          {!user && <div className="max-w-xs space-y-4 mb-4">
            <input aria-label="Name" placeholder="Name" style={palette.primary}
              className="border border-neutral-300 w-full rounded-lg p-2" name="name" type="text"
              value={guest.name} onChange={event => setGuest({ ...guest, name: event.target.value })} required />
            <input aria-label="Email" placeholder="Email" style={palette.primary}
              className="border border-neutral-300 w-full rounded-lg p-2" name="email" type="email"
              value={guest.email} onChange={event => setGuest({ ...guest, email: event.target.value })} required />
          </div>}
          <div className="flex space-x-2">
            <button type="submit" style={palette.accent} className="text-sm py-2 px-5 block rounded-lg hover:opacity-75">
              {isReply ? "Reply" : "Comment"}
            </button>
            <button type="button" style={isReply ? undefined : palette.primary}
              className="text-sm py-2 px-3 block rounded-lg hover:opacity-60"
              onClick={() => { setExpanded(false); onCancel?.(); }}>Cancel</button>
          </div>
        </div>}
      </form>
    </div>
  );
}
