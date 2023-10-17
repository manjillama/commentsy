import { options } from "@/app/api/auth/[...nextauth]/options";
import EmbedComments from "@/components/embed-comments";
import dbConnect from "@/lib/dbConnect";
import publicCommentService, {
  ClientGroupCommentsReturnType,
} from "@/services/publicCommentService";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

type Props = {
  params: {
    appcode: string;
  };
  searchParams: {
    identifier: string;
    page_url: string;
  };
};
export default async function Comments({
  params: { appcode },
  searchParams: { identifier, ...searchParams },
}: Props) {
  const session = await getServerSession(options);

  const data = await getCommentsData(appcode, identifier, searchParams);

  if (data.status === "fail") return data.message;

  return <EmbedComments data={data.data} user={session?.user} />;
}

async function getCommentsData(
  appCode: string,
  groupIdentifier: string,
  searchParams?: any
): Promise<ClientGroupCommentsReturnType> {
  const headersList = headers();
  const referer = headersList.get("referer") ?? "http://localhost:3000";

  if (!referer)
    return {
      status: "fail",
      message: "Unauthorized, this page could not be found.",
    };

  await dbConnect();

  const data = await publicCommentService.getAllGroupCommentsInitData({
    appCode,
    groupIdentifier,
    refererUrl: referer,
    searchParams,
  });

  return JSON.parse(JSON.stringify(data));
}
