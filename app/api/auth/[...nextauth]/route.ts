import NextAuth from "next-auth";
import { options } from "./options";
import catchAsync from "@/utils/errorHandler";

const handler = catchAsync(NextAuth(options));

export { handler as GET, handler as POST };
