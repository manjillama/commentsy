import SignUpForm from "@/components/signup";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getServerSession(options);
  if (session) redirect("/");

  return <SignUpForm />;
}
