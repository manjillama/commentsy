import React from "react";
import { getProviders } from "next-auth/react";
import SignInWrapper from "./signin-wrapper";

export default async function SignIn() {
  const providers = await getProviders();
  return <SignInWrapper providers={providers} />;
}
