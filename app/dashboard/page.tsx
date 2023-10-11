import { getServerSession } from "next-auth";
import Link from "next/link";
import { options } from "../api/auth/[...nextauth]/options";
import NewAppDialog from "@/components/new-app-dialog";
import { withNavbar } from "@/hoc";
import dbConnect from "@/lib/dbConnect";
import appService from "@/services/appService";
import UserApps from "@/components/user-apps";

async function DashboardPage() {
  const userApps = await getUserApps();

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
      {userApps.length > 0 ? (
        <UserApps userApps={userApps} />
      ) : (
        <div>
          <p>
            Want to build something that integrates with your website or mobile
            app and allows your users to add comments? Create a new Commentsy
            App to get started, follow our integration guide and start engaging
            with your audiences in just few minutes. You can also read more
            about it in our{" "}
            <Link className="text-blue-600 hover:underline" href="/docs">
              developer documentation
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

async function getUserApps() {
  await dbConnect();
  const session = await getServerSession(options);
  return appService.getAppsByUserId(session?.user.id as string);
}

export default withNavbar(DashboardPage);
