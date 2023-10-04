import React from "react";
import SignInForm from "./signin-form";
import OAuthProviders from "./oauth-providers";

export default function SignIn() {
  return (
    <div>
      <OAuthProviders />
      <SignInForm />
    </div>
  );
}
