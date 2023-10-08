"use client";
import React, { useState } from "react";
import SignInForm from "./signin-form";
import OAuthProviders from "./oauth-providers";
import { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null;
};
export default function SignInWrapper({ providers }: Props) {
  const [showSignInUsingCredentials, setShowSignInUsingCredentials] =
    useState(false);

  return (
    <div className="container max-w-xs mx-auto mt-[10%]">
      <h1 className="text-3xl font-bold">Log in</h1>
      {!showSignInUsingCredentials ? (
        <>
          <OAuthProviders providers={providers} />
          <hr className="my-4" />
          <button
            onClick={() => setShowSignInUsingCredentials(true)}
            className="w-full text-sky-600 hover:underline"
          >
            Continue with credentials
          </button>
        </>
      ) : (
        <>
          <SignInForm />
          <button
            onClick={() => setShowSignInUsingCredentials(false)}
            className="w-full text-sky-600 hover:underline"
          >
            Other login options
          </button>
        </>
      )}
    </div>
  );
}
