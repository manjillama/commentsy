import NewAppDialog from "@/components/app-form/new-app-dialog";
import { withSiteLayout } from "@/hoc";
import UserApps from "@/components/user-apps";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";

export const metadata: Metadata = {
  title: `Dashboard | ${SITE_DATA.title}`,
};

async function DashboardPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-[15px] py-10">
      <div className="flex items-end">
        <div className="grow">
          <h2 className="text-xl">Commentsy apps</h2>
        </div>
        <div>
          <NewAppDialog />
        </div>
      </div>
      <hr className="border-neutral-200 my-4" />
      <UserApps />
    </div>
  );
}

export default withSiteLayout(DashboardPage);
