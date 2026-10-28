"use client";
import React, { useState } from "react";
import SignUpForm from "./signup-form";
import OAuthProviders from "../oauth-providers";
import AuthLayout from "../auth/auth-layout";
import styles from "../auth/auth.module.css";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
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
    <AuthLayout signup>
      {!showSignInUsingCredentials ? (
        <>
          <OAuthProviders providers={providers} />
          <div className={styles.divider}>or use your email</div>
          <button
            onClick={() => setShowSignInUsingCredentials(true)}
            className={styles.emailButton}
          >
            <EnvelopeClosedIcon /> Continue with email
          </button>
        </>
      ) : (
        <>
          <SignUpForm />
          <button
            onClick={() => setShowSignInUsingCredentials(false)}
            className={styles.otherOptions}
          >
            Other sign up options
          </button>
        </>
      )}
    </AuthLayout>
  );
}
