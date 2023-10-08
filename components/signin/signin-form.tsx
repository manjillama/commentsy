import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Alert, Spinner } from "../ui";

export default function SignInForm() {
  const router = useRouter();
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
    setIsSubmitting(true);
    setError("");
    const res = await signIn("credentials", { redirect: false, ...formProps });
    console.log("Signin response", res);

    setIsSubmitting(false);
    if (res) {
      if (!res.error) {
        const queryParams = new URLSearchParams(
          res.url ? res.url.split("?")[1] : ""
        );
        router.push(queryParams.get("callbackUrl") ?? "/");
      } else {
        setError(
          (NEXT_AUTH_ERRORS as any)[res.error] ?? "Something went wrong."
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-4">
      {error && <Alert message={error} />}
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
          <span>Pasword</span>
          <input
            className="border border-neutral-300 w-full rounded-lg p-3"
            name="password"
            type="password"
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
          <div className="text-left absolute">
            <Spinner />
          </div>
        )}
        Log in
      </button>
    </form>
  );
}

const NEXT_AUTH_ERRORS = {
  CredentialsSignin: "Incorrect email or password.",
  CredentialsSigninMissing: "Please provide both email and password",
  OAuthAccountNotLinked:
    "You signed up using another option. Please use same login option that you used before.",
};
