import dbConnect from "@/lib/dbConnect";
import App from "@/models/App";
import { headers } from "next/headers";

type Props = {
  params: {
    appcode: string;
  };
  searchParams: {
    identifier: string;
  };
};
export default async function Comments({
  params: { appcode },
  searchParams: { identifier },
}: any) {
  const commentsData = await getCommentsData(appcode, identifier);
  if (!commentsData) return null;

  return <h1>Success Ya all </h1>;
}

async function getCommentsData(appCode: string, commentIdentifier: string) {
  const headersList = headers();
  const referer = headersList.get("referer");

  if (!referer) return null;

  await dbConnect();

  const app = await App.findOne({ code: appCode });

  if (!app) return null;

  const parsedUrl = new URL(referer);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  if (app.authorizedOrigins.includes(baseUrl)) {
    return {
      app,
      commentIdentifier,
      comments: [],
    };
  }

  return null;
}
