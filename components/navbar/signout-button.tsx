"use client";
import { signOut } from "next-auth/react";
import React from "react";

const SignoutButton = () => {
  const handleSignout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <button
      className="text-neutral-500 w-full text-left px-4 py-2 hover:bg-neutral-100"
      onClick={handleSignout}
    >
      Sign out
    </button>
  );
};

export default SignoutButton;
