"use client";
import { createContext, useContext } from "react";
import type { IComment } from "@/interfaces/IComment";

export type DeletedComment = { id: string; parent?: string; count: number };
export const CommentMutationsContext = createContext<{
  deleted: DeletedComment[];
  onDeleted: (comment: IComment, count: number) => void;
  onReplyCreated: (parentId: string) => void;
} | null>(null);
export const useCommentMutations = () => useContext(CommentMutationsContext);
