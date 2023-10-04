import { getProviders } from "next-auth/react";
import React from "react";
import OAuthProvider from "./oauth-provider";

export default async function OAuthProviders() {
  const providers = await getProviders();

  return (
    <>
      {Object.values(providers as any).map((provider: any) =>
        provider.name === "Credentials" ? null : (
          <OAuthProvider key={provider.id} provider={provider} />
        )
      )}
    </>
  );
}
