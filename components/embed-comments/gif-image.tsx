/* eslint-disable @next/next/no-img-element -- KLIPY media must load directly without optimization. */
import { CommentGif, isCommentGif } from "@/utils/gif";

export default function GifImage({ gif }: { gif?: CommentGif }) {
  if (!isCommentGif(gif)) return null;
  return (
    <figure className="my-3">
      <img src={gif.url} alt={gif.title || "GIF"} loading="lazy" className="max-w-full max-h-64 rounded-lg object-contain" />
      <figcaption className="text-xs opacity-60 mt-1">Powered by KLIPY</figcaption>
    </figure>
  );
}
