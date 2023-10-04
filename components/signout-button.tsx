"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const SignoutButton = () => {
  const router = useRouter();

  const handleSignout = () => {
    signOut({ redirect: false }).then(() => router.push("/"));
  };

  return <button onClick={handleSignout}>Sign out</button>;
};

export default SignoutButton;
