import type { Metadata } from 'next';
import { withSiteLayout } from '@/hoc';
import VerifyEmailForm from '@/components/verify-email-form';
export const metadata: Metadata = { title: 'Confirm Email | Commentsy', robots: { index: false, follow: false }, referrer: 'no-referrer' };
function VerifyEmailPage() { return <VerifyEmailForm />; }
export default withSiteLayout(VerifyEmailPage);
