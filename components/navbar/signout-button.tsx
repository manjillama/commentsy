"use client";
import { clearUserApps } from "@/slices/userAppsSlice";
import { AppDispatch } from "@/store";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";

const SignoutButton = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const handleSignout = () => {
    signOut({ redirect: false }).then(() => {
      dispatch(clearUserApps());
      router.push("/");
    });
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
