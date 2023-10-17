import { IComment } from "@/interfaces/IComment";
import Avatar from "../ui/avatar";
import api from "@/utils/api";
import { CommentData } from ".";

type Props = {
  isCommentLoading: boolean;
  setIsCommentLoading: (loading: boolean) => void;
  commentData: CommentData;
  setCommentData: (commentData: CommentData) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};
export default function FetchMoreComments({
  isCommentLoading,
  setIsCommentLoading,
  commentData,
  setCommentData,
  currentPage,
  setCurrentPage,
}: Props) {
  const handleFetchNextComments = async () => {
    setIsCommentLoading(true);
    const data = await api.get<{
      comments: IComment[];
      total: number;
      size: number;
    }>(
      `/api/comments?identifier=${commentData.identifier}&page=${
        currentPage + 1
      }`
    );

    if (data.status === "success") {
      setCommentData({
        ...commentData,
        comments: [...commentData.comments, ...data.data.comments],
      });
      setCurrentPage(currentPage + 1);
    }
    setIsCommentLoading(false);
  };

  return <div>{isCommentLoading && <span>Loading...</span>}</div>;
}
