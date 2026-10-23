import React from "react";
import { getProviders } from "next-auth/react";
import SignUpWrapper from "./signup-wrapper";

export default async function SignIn() {
  const providers = await getProviders();
  return <SignUpWrapper providers={providers} />;
}
