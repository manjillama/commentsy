import { signIn } from "next-auth/react";
import { fetchEmbedUser } from "@/utils/embedSession";

export async function credentialsLogin(email: string, password: string, callbackUrl: string) {
  const result = await signIn("credentials", { redirect: false, email, password, callbackUrl });
  if (result?.error === "EmailNotVerified")
    return `/verify-email#email=${encodeURIComponent(email.trim().toLowerCase())}`;
  if (!result?.ok || result.error) throw new Error(result?.error || "CredentialsUnavailable");
  // A successful callback alone does not prove that the browser kept the cookie.
  const user = await fetchEmbedUser();
  if (!user) throw new Error("SessionCookieBlocked");
  return result.url ?? "/dashboard";
}
