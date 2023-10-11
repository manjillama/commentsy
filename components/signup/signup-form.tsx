"use client";
import { Alert, Spinner } from "@/components/ui";
import { post } from "@/utils/api";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { NEXT_AUTH_ERRORS } from "../signin/signin-form";

export default function SignUpForm() {
  const router = useRouter();
  const [formProps, setFormProps] = useState({
    name: "",
    email: "",
    password: "",
  });
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

    const data = await post("/api/signup", formProps);
    if (data.status === "success") {
      const res = await signIn("credentials", {
        redirect: false,
        ...formProps,
      });
      if (res) {
        if (!res.error) {
          const queryParams = new URLSearchParams(
            res.url ? res.url.split("?")[1] : ""
          );
          router.push(queryParams.get("callbackUrl") ?? "/dashboard");
        } else {
          setErrors([
            (NEXT_AUTH_ERRORS as any)[res.error] ?? "Something went wrong.",
          ]);
        }
      } else setErrors(["Something went wrong."]);
    } else setErrors(data.errors);

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-4">
      {errors.length ? (
        <Alert>
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
        </Alert>
      ) : null}
      <div>
        <label className="space-y-2">
          <span>Your full name</span>
          <input
            className="border border-neutral-300 w-full rounded-lg p-3"
            name="name"
            type="text"
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
            value={formProps.password}
            onChange={handleChange}
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
          <div className="text-left absolute">
            <Spinner />
          </div>
        )}
        Sign up
      </button>
    </form>
  );
}
