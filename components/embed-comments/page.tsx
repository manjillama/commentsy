"use client";
import { config } from "@/config";
import { IComment } from "@/interfaces/IComment";
import api from "@/utils/api";
import { Session } from "next-auth";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  user?: Session["user"];
  data: {
    identifier: string;
    likesCount: number;
    commentsCount: number;
    comments: IComment[];
    total: number;
    size: number;
  };
};
export default function EmbedComments({ data, user }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [commentData, setCommentData] = useState(data);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [parentSiteData, setParentSiteData] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const ref = useRef(null);

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
    window.parent.postMessage(
      { type: "commentsyResize", height: ref.current?.["offsetHeight"] },
      "*"
    );
  }, [commentData]);

  const { total, size } = commentData;

  const totalPage = Math.ceil(total / size);

  /** @todo Loader */
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

  const redirectToLoginIfUserNotLoggedIn = () => {
    if (!parentSiteData || !user) return;
    if (window.top)
      window.top.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/signin?callbackUrl=${parentSiteData.url}`;
  };

  return (
    <div ref={ref} className="bg-white">
      <h2 className="font-semibold mb-6">203 comments</h2>
      <div className="space-y-6">
        <div className="flex space-x-3">
          <div className="shrink-0">
            <Avatar user={user} />
          </div>
          <div
            onFocus={redirectToLoginIfUserNotLoggedIn}
            contentEditable
            className="border border-neutral-300 w-full rounded-lg p-3"
          />
        </div>
        <div className="flex space-x-3">
          <div className="shrink-0">
            <Avatar user={user} />
          </div>
          <div className="whitespace-pre-wrap">
            <div className="space-x-1">
              <span className="font-semibold">Marina Tamang</span>
              <span className="text-sm text-neutral-500">4 days ago</span>
            </div>
            <p>
              {`Ooh! Perfect timing!
This weekend I seen The Creator on cinema, and I loooooooove this music by Radiohead. 
I recommand to see the movie`}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="shrink-0">
            <Avatar user={user} />
          </div>
          <div className="whitespace-pre-wrap">
            <div className="space-x-1">
              <span className="font-semibold">Marina Tamang</span>
              <span className="text-sm text-neutral-500">16 days ago</span>
            </div>
            <p>
              {`OOoo nice! 🙌
When I saw the pink Spotify window following the Oppenheimer suggestion, I automatically expected it to be Barbie, haha. Media has conditioned me to pair the two together I reckon. 😅
Now, I gotta tune into that Oppenheimer soundtrack. Ludwig Göransson is freaking awesome... I love this little short that shows him scoring The Mandalorian:`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Avatar = ({ user }: { user?: Session["user"] }) => {
  return (
    <div
      className="rounded-full h-[32px] w-[32px] flex items-center"
      style={
        user
          ? { backgroundColor: user.avatarBackgroundColor }
          : { backgroundColor: "#000" }
      }
    >
      {user ? (
        user.name?.split("")[0]
      ) : (
        <Image
          height={18}
          width={18}
          src="/commentsy-white.svg"
          alt="User"
          className="mx-auto"
        />
      )}
    </div>
  );
};

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
