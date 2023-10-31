"use client";

export default function NotAProductionAlert() {
  return (
    <div className="p-3 text-black bg-amber-300">
      Please note that this is not a real project. Hence it is recommended to
      rather{" "}
      <a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        self host
      </a>{" "}
      this project on your own and then use it to prevent any potential data
      losses.
    </div>
  );
}
