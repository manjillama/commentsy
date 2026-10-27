export default function FormFeedback({ message, error = false }: { message: string; error?: boolean }) {
  return <p role={error ? "alert" : "status"} aria-live={error ? "assertive" : "polite"}
    className={message ? `text-sm mt-2 ${error ? "text-red-700" : "opacity-70"}` : "sr-only"}>{message}</p>;
}
