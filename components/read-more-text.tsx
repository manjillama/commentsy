import { useState } from "react";

export default function ReadMoreText({
  text,
  minCount = 1500,
}: {
  text: string;
  minCount?: number;
}) {
  const [showFullText, setShowFullText] = useState(false);
  const count = text.length;

  function handleReadMore() {
    setShowFullText(!showFullText);
  }

  if (count > minCount && !showFullText) {
    return (
      <div>
        <div>{`${text.substring(0, minCount)}...`}</div>
        <button
          className="text-neutral-500 mt-1 font-medium hover:underline"
          onClick={handleReadMore}
        >
          Read more
        </button>
      </div>
    );
  }
  return (
    <div>
      <div>{text}</div>
      {count > minCount && (
        <button
          className="text-neutral-500 mt-1 font-medium hover:underline"
          onClick={handleReadMore}
        >
          Show less
        </button>
      )}
    </div>
  );
}
