"use client";
import { Alert, Spinner } from "@/components/ui";
import api from "@/utils/api";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignUpForm() {
  const [formProps, setFormProps] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [created, setCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { name, type, checked } = event.currentTarget;
    let { value } = event.currentTarget;
    if (type === "checkbox") value = checked as any;

    setFormProps({
      ...formProps,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = await api.post<{ message: string }>("/api/signup", formProps);
    if (data.status === "success") {
      setConfirmationMessage(data.data.message);
      setCreated(true);
    } else setErrors(data.errors);

    setIsSubmitting(false);
  };

  if (created) return <div className="my-6 space-y-4 text-sm leading-6"><p>{confirmationMessage}</p><p><Link className="underline" href="/verify-email">Resend confirmation email</Link> · <Link className="underline" href="/signin">Back to sign in</Link></p></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-4 w-full">
      {errors.length ? (
        <Alert variant="error">
          <ul
            style={
              errors.length > 1
                ? { listStyleType: "disc", paddingLeft: "1rem" }
                : {}
            }
          >
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          {errors.some(error => typeof error === "string" && error.startsWith("An account with this email already exists.")) && (
            <nav aria-label="Account access options" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm underline underline-offset-4">
              <Link href="/signin">Sign in</Link>
              <Link href="/forgot-password">Reset password</Link>
              <Link href="/verify-email">Resend confirmation</Link>
            </nav>
          )}
        </Alert>
      ) : null}
      <div>
        <label className="space-y-2">
          <span>Your full name</span>
          <input
            className="border border-neutral-300 w-full rounded-lg p-3"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formProps.name}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Email</span>
          <input
            className="border border-neutral-300 w-full rounded-lg p-3"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formProps.email}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Password</span>
          <input
            className="border border-neutral-300 w-full rounded-lg p-3"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formProps.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>
      </div>

      <button
        disabled={isSubmitting}
        className="bg-black h-14 text-white w-full rounded-lg p-3 relative hover:opacity-75 disabled:opacity-60"
        type="submit"
      >
        {isSubmitting && (
          <div className="h-[26px] w-[26px] absolute text-left top-[10px]">
            <Spinner color="light" />
          </div>
        )}
        <span>{isSubmitting ? "Creating your account…" : "Create account"}</span>
      </button>
    </form>
  );
}
