import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({ pages: { signIn: "/signin" } });

export const config = {
  matcher: ["/signin", "/dashboard", "/app", "/profile"],
};
