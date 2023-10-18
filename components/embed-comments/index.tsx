"use client";
import { IComment } from "@/interfaces/IComment";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { ParentSiteData } from "./input-comment";
import CommentsContainer from "./comments-container";

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
  commentData: CommentData;
};
export type PageParams = {
  currentPage: number;
  sort: "-createdAt";
};
export default function EmbedComments({ commentData, user }: Props) {
  const [parentSiteData, setParentSiteData] = useState<ParentSiteData>(null);
  const embedRef = useRef(null);

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "commentsyParentSiteData") {
        if (new URL(event.data.url) && event.data.title)
          setParentSiteData(event.data);
      }
    });
    window.parent.postMessage({ type: "pingCommentsyParent" }, "*");
  }, []);

  useEffect(() => {
    function resizeParentEmbedWindow() {
      window.parent.postMessage(
        { type: "commentsyResize", height: embedRef.current?.["offsetHeight"] },
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
    <div ref={embedRef}>
      <CommentsContainer
        data={commentData}
        parentSiteData={parentSiteData}
        user={user}
      />
    </div>
  );
}
