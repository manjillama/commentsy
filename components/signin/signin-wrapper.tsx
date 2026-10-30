"use client";
import React, { useState } from "react";
import SignInForm from "./signin-form";
import OAuthProviders from "../oauth-providers";
import AuthLayout from "../auth/auth-layout";
import styles from "../auth/auth.module.css";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

type Props = {
  emailConfirmed?: boolean;
  providers: Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null;
};
export default function SignInWrapper({ providers, emailConfirmed = false }: Props) {
  const hasOAuthProviders = Object.values(providers ?? {}).some(provider => provider.type === "oauth");
  const [showSignInUsingCredentials, setShowSignInUsingCredentials] = useState(emailConfirmed || !hasOAuthProviders);

  return (
    <AuthLayout>
      {emailConfirmed && <p role="status" className="my-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">Email confirmed. Log in with your email and password to continue.</p>}
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
          <SignInForm />
          {hasOAuthProviders && <button
            type="button"
            onClick={() => setShowSignInUsingCredentials(false)}
            className={styles.otherOptions}
          >
            Other login options
          </button>}
        </>
      )}
    </AuthLayout>
  );
}
