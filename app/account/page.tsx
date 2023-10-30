import { SITE_DATA } from "@/constants";
import { withSiteLayout } from "@/hoc";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Account | ${SITE_DATA.title}`,
};

function AccountPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="border-b py-12">
        <div className="max-w-screen-lg mx-auto px-[15px]">
          <h1 className="text-4xl my-3">Account settings</h1>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto px-[15px] py-12">@Todo</div>
    </div>
  );
}

export default withSiteLayout(AccountPage);
