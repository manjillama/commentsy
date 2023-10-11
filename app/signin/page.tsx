import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import SignIn from "@/components/signin";
import { redirect } from "next/navigation";
import { withNavbar } from "@/hoc";

async function SignInPage() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");

  return <SignIn />;
}

export default withNavbar(SignInPage);
