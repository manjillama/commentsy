import type { Metadata } from "next";
import { withSiteLayout } from "@/hoc";
import PasswordRecoveryForm from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Reset Password | Commentsy", robots: { index: false, follow: false }, referrer: "no-referrer" };
function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return <PasswordRecoveryForm token={typeof searchParams.token === "string" ? searchParams.token : ""} />;
}
export default withSiteLayout(ResetPasswordPage);
