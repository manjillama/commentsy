import SignUpForm from "@/components/signup";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";

export const metadata: Metadata = {
  title: `Sign Up | ${SITE_DATA.title}`,
};

async function SignUpPage() {
  const session = await getServerSession(options);
  if (session) redirect("/");

  return <SignUpForm />;
}

export default withSiteLayout(SignUpPage);
