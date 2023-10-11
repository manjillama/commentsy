import SignUpForm from "@/components/signup";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { withNavbar } from "@/hoc";

async function SignUpPage() {
  const session = await getServerSession(options);
  if (session) redirect("/");

  return <SignUpForm />;
}

export default withNavbar(SignUpPage);
