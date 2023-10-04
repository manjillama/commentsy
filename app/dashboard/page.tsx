import { getServerSession } from "next-auth";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import SignoutButton from "@/components/signout-button";
import AppDashboard from "@/components/app-dashboard";
import Link from "next/link";

const Dashboard = async () => {
  const session = await getServerSession(options);
  console.log("Current session dashboard", session);

  return (
    <div>
      <Link href="/">Home</Link>
      <div>{session?.user?.name}</div>
      <SignoutButton />
      <AppDashboard />
    </div>
  );
};

export default Dashboard;
