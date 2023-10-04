"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const [formProps, setFormProps] = useState({ email: "", password: "" });

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
    const res = await signIn("credentials", { redirect: false, ...formProps });
    console.log("Signin response", res);
    if (res && !res?.error) {
      const queryParams = new URLSearchParams(
        res.url ? res.url.split("?")[1] : ""
      );
      router.push(queryParams.get("callbackUrl") ?? "/");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          name="email"
          type="email"
          value={formProps.email}
          onChange={handleChange}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          value={formProps.password}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}
