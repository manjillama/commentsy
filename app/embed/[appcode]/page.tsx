import { options } from "@/app/api/auth/[...nextauth]/options";
import EmbedComments from "@/components/embed-comments/page";
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

  return (
    <div>
      <h1>{session?.user.name ?? "stranger"}</h1>
      <EmbedComments data={data.data} />
    </div>
  );
}

async function getCommentsData(
  appCode: string,
  groupIdentifier: string,
  searchParams?: any
): Promise<ClientGroupCommentsReturnType> {
  const headersList = headers();
  const referer = headersList.get("referer");

  if (!referer)
    return {
      status: "fail",
      message: "Unauthorized, this page could not be found.",
    };

  await dbConnect();

  const data = await publicCommentService.getAllGroupComments({
    appCode,
    groupIdentifier,
    refererUrl: referer,
    searchParams,
  });

  return JSON.parse(JSON.stringify(data));
}