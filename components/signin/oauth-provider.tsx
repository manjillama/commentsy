"use client";
import { signIn } from "next-auth/react";
import React from "react";

export default function OAuthProvider({ provider }: any) {
  return (
    <div>
      <button onClick={() => signIn(provider.id)}>
        Sign in with {provider.name}
      </button>
    </div>
  );
}
