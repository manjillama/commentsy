import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import SignIn from "@/components/signin";
import { redirect } from "next/navigation";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";

export const metadata: Metadata = {
  title: `Login | ${SITE_DATA.title}`,
};

async function SignInPage() {
  const session = await getServerSession(options);
  if (session) redirect("/dashboard");

  return <SignIn />;
}

export default withSiteLayout(SignInPage);
