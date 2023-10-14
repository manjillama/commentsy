import { getServerSession } from "next-auth";
import Link from "next/link";
import { options } from "../api/auth/[...nextauth]/options";
import NewAppDialog from "@/components/new-app-dialog";
import { withNavbar } from "@/hoc";
import dbConnect from "@/lib/dbConnect";
import appService from "@/services/appService";
import UserApps from "@/components/user-apps";

async function DashboardPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-[15px] py-10">
      <div className="flex items-center">
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

export default withNavbar(DashboardPage);
