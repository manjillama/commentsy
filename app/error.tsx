"use client";
import AppError from "@/utils/appError";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string } & AppError;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return (
    <div>
      <h2>{error.isOperational ? error.message : "Something went wrong!"}</h2>
    </div>
  );
}
