"use client";
import { credentialsLogin } from "@/utils/credentialsLogin";
import { FormEvent, useState } from "react";
import { Alert, Spinner } from "../ui";

export default function SignInForm() {
  const [formProps, setFormProps] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    // Read the actual form: browser/password-manager autofill can leave React
    // state out of sync with the visible inputs.
    const form = e.currentTarget;
    const values = new FormData(form);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    if (!email || !password) { setError(NEXT_AUTH_ERRORS.CredentialsSigninMissing); return; }
    if (!(form.elements.namedItem("email") as HTMLInputElement).validity.valid) {
      setError("Please enter a valid email address."); return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") ?? "/dashboard";
      const destination = await credentialsLogin(email, password, callbackUrl);
      window.location.assign(destination);
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "";
      setError((NEXT_AUTH_ERRORS as Record<string, string>)[code] ?? "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 my-4 w-full">
      {error && <div role="alert" aria-live="assertive"><Alert variant="error">{error}</Alert></div>}
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
            autoComplete="current-password"
            required
            value={formProps.password}
            onChange={handleChange}
          />
        </label>
      </div>

      <button
        disabled={isSubmitting}
        style={{
          opacity: isSubmitting ? 0.6 : 1,
        }}
        className="bg-black h-14 text-white w-full rounded-lg p-3 relative"
        type="submit"
      >
        {isSubmitting && (
          <div className="h-[26px] w-[26px] absolute text-left top-[10px]">
            <Spinner color="light" />
          </div>
        )}
        {isSubmitting ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

export const NEXT_AUTH_ERRORS = {
  SessionCookieBlocked: "Your login was accepted, but this browser did not retain the session. Open Commentsy in a regular tab and try again. For local development, use the same localhost address configured in NEXTAUTH_URL and restart the dev server.",
  CredentialsUnavailable: "The login service is unavailable. Please try again.",
  CredentialsSignin: "Incorrect email or password",
  CredentialsSigninMissing: "Please provide both email and password",
  OAuthAccountNotLinked:
    "You signed up using another option. Please use same login option that you used before",
};
