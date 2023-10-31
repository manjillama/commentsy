"use client";

export default function NotAProductionAlert() {
  return (
    <div className="p-3 text-black bg-amber-300">
      Please note that this is not a real project. It is highly recommended to{" "}
      <a
        href="https://github.com/manjillama/commentsy/fork"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        fork
      </a>{" "}
      this project and{" "}
      <a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        self-host
      </a>{" "}
      it to prevent any potential data losses.
    </div>
  );
}
