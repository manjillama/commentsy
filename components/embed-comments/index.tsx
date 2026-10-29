"use client";
import { EmbedSessionContext, useEmbedSession } from "./embed-session";
import { parseParentPageData } from "@/utils/parentPageData";
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
  const session = useEmbedSession(user);
  const [parentSiteData, setParentSiteData] = useState<ParentSiteData>(null);
  const [userCommentStyles, setUserCommentStyles] = useState<
    CommentStyles["light"] | null
  >(null);

  const embedRef = useRef<HTMLDivElement>(null);

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
    function receive(event: MessageEvent) {
      if (event.source !== window.parent) return;
      const data = parseParentPageData(event.data);
      if (data) setParentSiteData(data);
    }
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "pingCommentsyParent" }, "*");
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    const element = embedRef.current;
    if (!element) return;
    let lastHeight = 0;
    const reportHeight = () => {
      const height = element.offsetHeight;
      if (height === lastHeight) return;
      lastHeight = height;
      window.parent.postMessage({ type: "commentsyResize", height }, "*");
    };
    const observer = new ResizeObserver(reportHeight);
    observer.observe(element);
    reportHeight();
    return () => observer.disconnect();
  }, [userCommentStyles]);

  if (!userCommentStyles) return null;

  return (
    <div ref={embedRef} style={userCommentStyles.primary}>
      <div className="fixed inset-0 z-0" style={userCommentStyles.primary} />
      <div className="relative z-10 pb-4">
        <EmbedSessionContext.Provider value={session.controls}>
        <CommentsContainer
          data={{ ...commentData, userCommentStyles }}
          parentSiteData={parentSiteData}
          user={session.user}
        />
        </EmbedSessionContext.Provider>
        <div className="font-semibold text-right">
          <a href={process.env.NEXT_PUBLIC_SITE_URL} target="_blank">
            Powered by commentsy
          </a>
        </div>
      </div>
    </div>
  );
}
