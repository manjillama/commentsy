"use client";

export default function NotAProductionAlert() {
  return (
    <div className="p-3 text-black bg-amber-300">
      Commentsy is a pilot project. For your own deployment,{" "}
      <a
        href="https://github.com/manjillama/commentsy/fork"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        fork
      </a>{" "}
      and{" "}
      <a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        self-host
      </a>{" "}
      Commentsy.
    </div>
  );
}
