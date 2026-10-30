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
  const hasOAuthProviders = Object.values(providers ?? {}).some(provider => provider.type === "oauth");
  const [showSignInUsingCredentials, setShowSignInUsingCredentials] = useState(!hasOAuthProviders);

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
          {hasOAuthProviders && <button
            type="button"
            onClick={() => setShowSignInUsingCredentials(false)}
            className={styles.otherOptions}
          >
            Other sign up options
          </button>}
        </>
      )}
    </AuthLayout>
  );
}
