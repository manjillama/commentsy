"use client";
import { CommentMutationsContext, DeletedComment } from "./comment-mutations";
import { removeDeletedComment } from "@/utils/removeDeletedComment";
import LoginHint from "./login-hint";
import { Session } from "next-auth";
import { useState } from "react";
import InputComment, { ParentSiteData } from "./input-comment";
import CommentList from "./comment-list";
import FetchMoreComments from "./fetch-more-comments";
import { CommentDataWithUserCommentSyles } from ".";

type Props = {
  user?: Session["user"];
  data: CommentDataWithUserCommentSyles;
  parentSiteData: ParentSiteData;
};
export type PageParams = {
  currentPage: number;
  sort: "-createdAt";
};
export default function CommentsContainer({
  data,
  user,
  parentSiteData,
}: Props) {
  const [params, setParams] = useState<PageParams>({
    currentPage: 1,
    sort: "-createdAt",
  });
  const [deleted, setDeleted] = useState<DeletedComment[]>([]);
  const [commentData, setCommentData] = useState(data);

  return (
    <CommentMutationsContext.Provider value={{ deleted, onReplyCreated: parentId => {
      setCommentData(current => ({
        ...current,
        commentsCount: current.commentsCount + 1,
        totalCommentsAndReplies: current.totalCommentsAndReplies + 1,
        comments: current.comments.map(comment => comment._id === parentId ? { ...comment, repliesCount: comment.repliesCount + 1 } : comment),
      }));
    }, onDeleted: (comment, count) => {
      setCommentData(current => removeDeletedComment(current, comment, count));
      setDeleted(current => [...current, { id: comment._id, parent: comment.parent ? String(comment.parent) : undefined, count }]);
    } }}>
    <div style={{ lineHeight: "20px", fontSize: "14px", padding: "1rem 0" }}>
      {totalCommentsCount(commentData.totalCommentsAndReplies)}
      {!user && <LoginHint parentSiteData={parentSiteData} palette={commentData.userCommentStyles} />}
      <InputComment
        setCommentData={setCommentData}
        commentData={commentData}
        user={user}
      />
      <CommentList
        user={user}
        comments={commentData.comments}
        commentData={commentData}
      />
      <FetchMoreComments
        commentData={commentData}
        params={params}
        setParams={setParams}
        setCommentData={setCommentData}
      />
    </div>
    </CommentMutationsContext.Provider>
  );
}

function totalCommentsCount(commentCount: number) {
  let countMessage = "";
  if (commentCount <= 0) countMessage = "No comments";

  if (commentCount === 1) countMessage = "1 comment";
  else countMessage = `${commentCount} comments`;

  return <h2 className="font-semibold mb-6">{countMessage}</h2>;
}
