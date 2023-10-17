"use client";
import { IComment } from "@/interfaces/IComment";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import InputComment, { ParentSiteData } from "./input-comment";
import CommentList from "./comment-list";
import FetchMoreComments from "./fetch-more-comments";

export type CommentData = {
  appCode: string;
  identifier: string;
  likesCount: number;
  commentsCount: number;
  comments: IComment[];
  total: number;
  size: number;
};
type Props = {
  user?: Session["user"];
  data: CommentData;
};
export type PageParams = {
  currentPage: number;
  sort: "-createdAt";
};
export default function EmbedComments({ data, user }: Props) {
  const [params, setParams] = useState<PageParams>({
    currentPage: 1,
    sort: "-createdAt",
  });
  const [commentData, setCommentData] = useState(data);
  const [parentSiteData, setParentSiteData] = useState<ParentSiteData>(null);
  const ref = useRef(null);

  let [isThirdPartyCookieEnabled, setIsThirdPartyCookieEnabled] =
    useState(false);

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "commentsyParentSiteData") {
        if (new URL(event.data.url) && event.data.title)
          setParentSiteData(event.data);
      }
    });
    window.parent.postMessage({ type: "pingCommentsyParent" }, "*");

    if (typeof window !== "undefined")
      setIsThirdPartyCookieEnabled(window.navigator.cookieEnabled);
  }, []);

  useEffect(() => {
    function resizeParentEmbedWindow() {
      window.parent.postMessage(
        { type: "commentsyResize", height: ref.current?.["offsetHeight"] },
        "*"
      );
    }
    resizeParentEmbedWindow();
    const interval = setInterval(() => {
      resizeParentEmbedWindow();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="bg-white">
      <span suppressHydrationWarning>
        {isThirdPartyCookieEnabled ? "Yes" : "No"}
      </span>
      {totalCommentsCount(commentData.total)}
      <InputComment
        setCommentData={setCommentData}
        commentData={commentData}
        user={user}
        parentSiteData={parentSiteData}
      />
      <CommentList comments={commentData.comments} />
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
