import { getServerSession } from "next-auth";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(options);
  console.log("From dashboard: (Server session)", session);

  return (
    <div className="container mx-auto px-[15px] py-4">
      <h1 className="text-4xl font-bold">
        👋 Welcome {session?.user?.name?.split(" ")[0]}!
      </h1>
    </div>
  );
}
