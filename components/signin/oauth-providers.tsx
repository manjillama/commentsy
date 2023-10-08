import {
  ClientSafeProvider,
  LiteralUnion,
  getProviders,
  signIn,
} from "next-auth/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BuiltInProviderType } from "next-auth/providers/index";

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null;
};
export default function OAuthProviders({ providers }: Props) {
  if (!providers) return null;
  return (
    <div className="space-y-4 mt-4">
      {Object.values(providers).map((provider) =>
        provider.name === "Credentials" ? null : (
          <OAuthProvider key={provider.id} provider={provider} />
        )
      )}
    </div>
  );
}

function OAuthProvider({ provider }: { provider: ClientSafeProvider }) {
  return (
    <button
      onClick={() => signIn(provider.id)}
      className="flex items-center space-x-4 p-3 justify-center border border-neutral-300 w-full rounded-lg hover:bg-neutral-100"
    >
      <Image
        src={`/images/${provider.name.toLowerCase()}-logo.svg`}
        alt="me"
        width={30}
        height={30}
      />
      <span> Continue with {provider.name}</span>
    </button>
  );
}
