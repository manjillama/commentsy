import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");
  return (
    <main className="px-[15px] py-4">
      <h1 className="text-5xl font-bold">👋 Hello there</h1>
    </main>
  );
}
