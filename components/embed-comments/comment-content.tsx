"use client";
import { useCommentMutations } from "./comment-mutations";
import FormFeedback from "../ui/form-feedback";
import CommentLength from "./comment-length";
import { useState } from "react";
import { Session } from "next-auth";
import { IComment } from "@/interfaces/IComment";
import { CommentStyles } from "@/interfaces/IApp";
import { CommentGif } from "@/utils/gif";
import api from "@/utils/api";
import ReadMoreText from "../read-more-text";
import GifImage from "./gif-image";
import GifPicker from "./gif-picker";
import { registerGifShare } from "@/lib/klipy";

export default function CommentContent({ comment, user, palette }: {
  comment: IComment; user?: Session["user"]; palette: CommentStyles["light"];
}) {
  const mutations = useCommentMutations();
  const [text, setText] = useState(comment.comment);
  const [gif, setGif] = useState<CommentGif | undefined>(comment.gif);
  const [saved, setSaved] = useState({ text: comment.comment, gif: comment.gif });
  const [editedAt, setEditedAt] = useState(comment.editedAt);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owner = typeof comment.user === "object" && "_id" in comment.user ? String(comment.user._id) : String(comment.user ?? "");
  const own = Boolean(user?.id && owner === user.id);

  async function save() {
    if (!text.trim() && !gif) { setError("Add a comment or choose a GIF."); return; }
    setBusy(true); setError(""); setMessage("");
    const response = await api.patch<IComment>(`/api/comments/${comment._id}`, { comment: text, gif: gif ?? null });
    setBusy(false);
    if (response.status !== "success") { setError(response.errors.join(" ") || response.message); return; }
    if (gif && gif.url !== saved.gif?.url) void registerGifShare(gif);
    setSaved({ text: response.data.comment, gif: response.data.gif });
    setEditedAt(response.data.editedAt);
    setMessage("Comment updated.");
    setEditing(false);
  }

  async function remove() {
    setBusy(true); setError(""); setMessage("");
    const response = await api.delete<{ deletedCount: number }>(`/api/comments/${comment._id}`);
    if (response.status !== "success") {
      setError(response.errors.join(" ") || response.message);
      setBusy(false);
      return;
    }
    if (mutations) mutations.onDeleted(comment, response.data.deletedCount);
    else window.location.reload();

  }

  if (comment.status === "deleted" || comment.isSpam || mutations?.deleted.some(item => item.id === comment._id))
    return <p className="italic opacity-60 py-2">This comment was deleted or removed for violating site rules.</p>;

  return <div>
    {editing ? <div className="mt-3">
      <label className="block">
        <span className="block text-sm font-semibold mb-2">Edit comment</span>
        <textarea
          placeholder={gif ? "Add a message to your GIF (optional)..." : "Write your comment..."}
          value={text}
          maxLength={5000}
          rows={3}
          style={palette.primary}
          className="border rounded-lg p-3 w-full resize-y"
          onChange={event => setText(event.target.value)}
          disabled={busy}
        />
      </label>
      <CommentLength length={text.length} />
      <GifPicker value={gif} onChange={setGif} palette={palette} />
      <div className="flex gap-3">
        <button type="button" disabled={busy} style={palette.accent} className="rounded-lg px-4 py-2" onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
        <button type="button" disabled={busy} onClick={() => { setText(saved.text); setGif(saved.gif); setEditing(false); setError(""); }}>Cancel</button>
      </div>
    </div> : <div className="whitespace-pre-wrap"><ReadMoreText text={saved.text} /><GifImage gif={saved.gif} /></div>}
    {!editing && editedAt && <p className="text-xs opacity-50 mt-1">Edited</p>}
    {own && !editing && <div className="flex gap-3 text-xs mt-2">
      <button type="button" disabled={busy} onClick={() => { setEditing(true); setConfirming(false); setError(""); setMessage(""); }}>Edit</button>
      <button type="button" disabled={busy} onClick={() => setConfirming(true)}>Delete</button>
    </div>}
    {confirming && <div className="border rounded-lg p-3 mt-3 text-sm" style={palette.primary}>
      <p>Delete this comment? Existing replies will remain visible, but new replies will be closed.</p>
      <div className="flex gap-3 mt-2"><button type="button" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete"}</button><button type="button" disabled={busy} onClick={() => setConfirming(false)}>Cancel</button></div>
    </div>}
    <FormFeedback message={error || message} error={Boolean(error)} />
  </div>;
}
