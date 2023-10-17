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
export default function EmbedComments({ data, user }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [commentData, setCommentData] = useState(data);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [parentSiteData, setParentSiteData] = useState<ParentSiteData>(null);
  const [triggerCalcEmbedContentHeight, setTriggetCalcEmbedContentHeight] =
    useState(0);
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
    window.parent.postMessage(
      { type: "commentsyResize", height: ref.current?.["offsetHeight"] },
      "*"
    );
  }, [triggerCalcEmbedContentHeight, commentData]);

  const { total, size } = commentData;

  const totalPage = Math.ceil(total / size);

  return (
    <div ref={ref} className="bg-white">
      <span suppressHydrationWarning>
        {isThirdPartyCookieEnabled ? "Yes" : "No"}
      </span>
      <h2 className="font-semibold mb-6">203 comments</h2>
      <InputComment
        commentData={commentData}
        user={user}
        parentSiteData={parentSiteData}
        setTriggetCalcEmbedContentHeight={setTriggetCalcEmbedContentHeight}
        triggerCalcEmbedContentHeight={triggerCalcEmbedContentHeight}
      />
      <CommentList comments={commentData.comments} />
      <FetchMoreComments
        isCommentLoading={isCommentLoading}
        commentData={commentData}
        currentPage={currentPage}
        setCommentData={setCommentData}
        setCurrentPage={setCurrentPage}
        setIsCommentLoading={setIsCommentLoading}
      />
    </div>
  );
}

/**
<div ref={ref}>
      <div>
        {isCommentLoading && <span>Loading...</span>}
        <hr />
        <button onClick={handleCommentPost}>Add a comment</button>
        <p>Current page: {currentPage}</p>
        <button
          onClick={() => handleFetchNextComments()}
          disabled={currentPage >= totalPage}
        >
          Next page
        </button>
        <hr />
        <pre>{JSON.stringify(commentData, null, 2)}</pre>
      </div>
    </div>
 */
