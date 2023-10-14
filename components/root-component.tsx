import AuthProvider from "@/context/auth-provider";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import ReduxProvider from "@/context/redux-provider";
import { preloadedState } from "@/store";
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import appService from "@/services/appService";

export default async function RootComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(options);

  if (session) {
    preloadedState.apps.apps = await getUserApps();
  }

  return (
    <ReduxProvider preloadedState={preloadedState}>
      <AuthProvider session={session}>{children}</AuthProvider>
    </ReduxProvider>
  );
}

async function getUserApps() {
  await dbConnect();
  const session = await getServerSession(options);
  return appService.getAppsByUserId(session?.user.id as string);
}
