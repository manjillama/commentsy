"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  session,
  children,
}: {
  session?: Session | null;
  children: React.ReactNode;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

/**
const appsState = useSelector((state: RootState) => state.apps);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    (async function () {
      if (!session) return;
      if (!appsState.isFetched) {
        const data = await get<{ data: IApp[] }>("/api/apps");
        if (data.status === "success") dispatch(setUserApps(data.data));
      }
    })();
  });
 */
