"use client";
import React, { useState } from "react";
import SignInForm from "./signin-form";
import OAuthProviders from "../oauth-providers";
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
    <div className="container max-w-xs mx-auto flex  flex-col justify-center absolute inset-0">
      <h1 className="text-3xl font-bold text-center mb-8">
        Log in to Commentsy
      </h1>
      {!showSignInUsingCredentials ? (
        <>
          <OAuthProviders providers={providers} />
          <hr className="my-4" />
          <button
            onClick={() => setShowSignInUsingCredentials(true)}
            className="w-full text-blue-600 hover:underline"
          >
            Continue with credentials
          </button>
        </>
      ) : (
        <>
          <SignInForm />
          <button
            onClick={() => setShowSignInUsingCredentials(false)}
            className="w-full text-blue-600 hover:underline"
          >
            Other login options
          </button>
        </>
      )}
    </div>
  );
}
