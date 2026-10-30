"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export default function FieldHelp({ label, children, alignToField = false }: { label: string; children: ReactNode; alignToField?: boolean }) {
  const id = useId();
  const container = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <span ref={container} className={`${alignToField ? "" : "relative"} inline-flex shrink-0`}
      onPointerEnter={event => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={() => { if (!container.current?.contains(document.activeElement)) setOpen(false); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={event => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
      }}>
      <button type="button" aria-label={label} aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-neutral-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)}>
        <QuestionMarkCircledIcon width={16} height={16} aria-hidden="true" />
      </button>
      {open && <span id={id} role="tooltip"
        className={`absolute ${alignToField ? "left-0" : "right-0"} top-full z-50 w-72 max-w-[calc(100vw-4rem)] rounded-lg border border-neutral-200 bg-white p-4 text-left text-sm font-normal leading-5 text-neutral-700 shadow-lg`}>
        {children}
      </span>}
    </span>
  );
}
