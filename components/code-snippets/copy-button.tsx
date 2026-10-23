"use client";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <button
      type="button"
      className="absolute top-4 right-4"
      onClick={() => {
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }}
      disabled={isCopied}
    >
      {isCopied ? (
        <CheckIcon width={20} height={20} />
      ) : (
        <CopyIcon width={18} height={18} />
      )}
    </button>
  );
}
