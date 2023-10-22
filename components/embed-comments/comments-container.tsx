"use client";
import { IComment } from "@/interfaces/IComment";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import InputComment, { ParentSiteData } from "./input-comment";
import CommentList from "./comment-list";
import FetchMoreComments from "./fetch-more-comments";
import { commentStyles } from ".";

export type CommentData = {
  appCode: string;
  identifier: string;
  likesCount: number;
  commentsCount: number;
  comments: IComment[];
  total: number;
  totalCommentsAndReplies: number;
  size: number;
};
type Props = {
  user?: Session["user"];
  data: CommentData;
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
  const [commentData, setCommentData] = useState(data);

  let [isThirdPartyCookieEnabled, setIsThirdPartyCookieEnabled] =
    useState(false);

  useEffect(() => {
    setIsThirdPartyCookieEnabled(window.navigator.cookieEnabled);
  }, []);

  return (
    <div style={{ lineHeight: "20px", fontSize: "14px", padding: "1rem 0" }}>
      <span suppressHydrationWarning>
        {isThirdPartyCookieEnabled ? "Yes" : "No"}
      </span>
      {totalCommentsCount(commentData.totalCommentsAndReplies)}
      <InputComment
        setCommentData={setCommentData}
        commentData={commentData}
        user={user}
        parentSiteData={parentSiteData}
      />
      <CommentList
        user={user}
        comments={commentData.comments}
        commentData={commentData}
        parentSiteData={parentSiteData}
      />
      <FetchMoreComments
        commentData={commentData}
        params={params}
        setParams={setParams}
        setCommentData={setCommentData}
      />
    </div>
  );
}

function totalCommentsCount(commentCount: number) {
  let countMessage = "";
  if (commentCount <= 0) countMessage = "No comments";

  if (commentCount === 1) countMessage = "1 comment";
  else countMessage = `${commentCount} comments`;

  return <h2 className="font-semibold mb-6">{countMessage}</h2>;
}
