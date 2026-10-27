export default function CommentLength({ length }: { length: number }) {
  if (length < 4500) return null;
  return <p className="text-xs opacity-60 text-right mt-1" role="status" aria-live="polite">{length.toLocaleString("en-US")} / 5,000 characters</p>;
}
