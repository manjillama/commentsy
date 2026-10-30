import type { Metadata } from "next";
import { withSiteLayout } from "@/hoc";
import PasswordRecoveryForm from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Forgot Password | Commentsy", robots: { index: false, follow: false } };
function ForgotPasswordPage() { return <PasswordRecoveryForm />; }
export default withSiteLayout(ForgotPasswordPage);
