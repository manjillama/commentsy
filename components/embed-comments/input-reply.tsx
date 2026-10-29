import { Session } from "next-auth";
import { IComment } from "@/interfaces/IComment";
import { CommentDataWithUserCommentSyles } from ".";
import CommentComposer from "./comment-composer";

type Props = {
  commentData: CommentDataWithUserCommentSyles;
  parentCommentId: string;
  user?: Session["user"];
  setShowReplyInput: (show: boolean) => void;
  handleSubmittedData: (comment: IComment) => void;
};

export default function InputReply({ commentData, parentCommentId, user, setShowReplyInput, handleSubmittedData }: Props) {
  return <CommentComposer commentData={commentData} parentCommentId={parentCommentId} user={user}
    onCancel={() => setShowReplyInput(false)}
    onPosted={comment => { handleSubmittedData(comment); setShowReplyInput(false); }} />;
}
