import AuthProvider from "@/context/auth-provider";
import { getServerSession } from "next-auth";
import ReduxProvider from "@/context/redux-provider";
import { RootState } from "@/store";
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import appService from "@/services/appService";
import ToastProvider from "@/context/toast-provider";

export default async function RootComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(options);

  const preloadedState: RootState = { apps: { apps: [] } };
  if (session?.user.id) {
    await dbConnect();
    preloadedState.apps.apps = await appService.getAppsByUserId(session.user.id);
  }

  return (
    <ReduxProvider preloadedState={preloadedState}>
      <AuthProvider session={session}>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
