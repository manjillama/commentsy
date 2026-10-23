"use client";

export default function NotAProductionAlert() {
  return (
    <div className="p-3 text-black bg-amber-300">
      Please note that this is still a pilot project and is not yet in
      production. Hence, it is recommended to{" "}
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
      this project to prevent any potential data losses.
    </div>
  );
}
