import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import accountService from "@/services/accountService";
import AccountSettings from "@/components/account/settings";

export const metadata: Metadata = { title: `Account | ${SITE_DATA.title}` };

async function AccountPage() {
  const session = await getServerSession(options);
  if (!session?.user.id) redirect("/signin?callbackUrl=/account");
  await dbConnect();
  const account = await accountService.getAccount(session.user.id);
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      <header className="border-b bg-white py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Your Commentsy</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3">Account settings</h1>
          <p className="text-neutral-600 mt-3">Make your profile yours and manage how you sign in.</p>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] pt-10"><AccountSettings account={account} /></div>
    </div>
  );
}

export default withSiteLayout(AccountPage);
