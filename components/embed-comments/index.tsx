"use client";
import { IComment } from "@/interfaces/IComment";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { ParentSiteData } from "./input-comment";
import CommentsContainer from "./comments-container";
import { CommentStyles } from "@/interfaces/IApp";

export type CommentData = {
  appCode: string;
  identifier: string;
  likesCount: number;
  commentsCount: number;
  comments: IComment[];
  commentStyles: CommentStyles;
  total: number;
  totalCommentsAndReplies: number;
  size: number;
};
export type CommentDataWithUserCommentSyles = CommentData & {
  userCommentStyles: CommentStyles["light"];
};
type Props = {
  user?: Session["user"];
  commentData: CommentData;
  theme?: "light" | "dark";
};
export type PageParams = {
  currentPage: number;
  sort: "-createdAt";
};

export default function EmbedComments({ commentData, user, theme }: Props) {
  const [parentSiteData, setParentSiteData] = useState<ParentSiteData>(null);
  const [userCommentStyles, setUserCommentStyles] = useState<
    CommentStyles["light"] | null
  >(null);

  const embedRef = useRef(null);

  useEffect(() => {
    const { commentStyles } = commentData;
    if (!theme || (theme !== "light" && theme !== "dark")) {
      const isDarkTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      isDarkTheme
        ? setUserCommentStyles(commentStyles["dark"])
        : setUserCommentStyles(commentStyles["light"]);
    } else setUserCommentStyles(commentStyles[theme]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!userCommentStyles) return null;

  return (
    <div ref={embedRef} style={userCommentStyles.primary}>
      <div className="fixed inset-0 z-0" style={userCommentStyles.primary} />
      <div className="relative z-10">
        <CommentsContainer
          data={{ ...commentData, userCommentStyles }}
          parentSiteData={parentSiteData}
          user={user}
        />
      </div>
    </div>
  );
}
