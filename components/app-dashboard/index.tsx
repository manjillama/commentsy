"use client";
import React from "react";
import { useSession } from "next-auth/react";

export default function AppDashboard() {
  const { data: session } = useSession();

  console.log("App dashboard (Client)", session);

  return <div>App dashboard</div>;
}
