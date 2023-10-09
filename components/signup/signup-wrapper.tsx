"use client";
import React, { useState } from "react";
import SignUpForm from "./signup-form";
import OAuthProviders from "../oauth-providers";
import { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null;
};
export default function SignUpWrapper({ providers }: Props) {
  const [showSignInUsingCredentials, setShowSignInUsingCredentials] =
    useState(false);

  return (
    <div className="container max-w-xs mx-auto mt-20">
      <h1 className="text-3xl font-bold text-center mb-8">
        Create your Commentsy account
      </h1>
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
          <SignUpForm />
          <button
            onClick={() => setShowSignInUsingCredentials(false)}
            className="w-full text-sky-600 hover:underline"
          >
            Other sign up options
          </button>
        </>
      )}
    </div>
  );
}
