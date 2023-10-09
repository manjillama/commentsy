import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");
  return (
    <main className="container mx-auto px-[15px] py-4">
      <div>
        <h1 className="text-4xl font-bold">👋 Hello Stranger!</h1>
      </div>
    </main>
  );
}
