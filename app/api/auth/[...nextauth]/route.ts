import dbConnect from "@/lib/dbConnect";
import { enforceRateLimit, requestClientKey } from "@/utils/rateLimit";
import NextAuth from "next-auth";
import { options } from "./options";
import catchAsync from "@/utils/errorHandler";

const authHandler = NextAuth(options);
const handler = catchAsync(async (req, context) => {
  if (req.method === "POST" && new URL(req.url).pathname.endsWith("/callback/credentials")) {
    await dbConnect();
    await enforceRateLimit(`login:${requestClientKey(req)}`, 20);
  }
  return authHandler(req, context);
});

export { handler as GET, handler as POST };
