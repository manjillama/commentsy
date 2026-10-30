import React from "react";
import { getProviders } from "next-auth/react";
import SignInWrapper from "./signin-wrapper";

export default async function SignIn({ emailConfirmed = false }: { emailConfirmed?: boolean }) {
  const providers = await getProviders();
  return <SignInWrapper providers={providers} emailConfirmed={emailConfirmed} />;
}
