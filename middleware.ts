// Ref: https://stackoverflow.com/questions/67560587/how-to-protect-routes-in-next-js-next-auth
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const anonymousRoutes = [
  "/",
  "/signin",
  "/signup",
  "/contact",
  "/docs",
  "/legal",
];
const publicFileRegex = /\.(.*)$/;

export default withAuth(
  async function middleware(req) {
    const response = NextResponse.next();
    return response;
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        const { pathname } = req.nextUrl;
        return Boolean(
          req.cookies.get("next-auth.session-token") ||
            pathname.startsWith("/_next") || // exclude Next.js internals
            pathname.startsWith("/api") || //  exclude all API routes
            pathname.startsWith("/static") || // exclude static files
            pathname.startsWith("/embed") || // exclude embed route
            publicFileRegex.test(pathname) || // exclude all files in the public folder
            anonymousRoutes.some((path) => pathname.startsWith(path))
        );
      },
    },
    pages: { signIn: "/signin", error: "/signin" },
  }
);

// const embedMiddleware = async (req: NextRequestWithAuth) => {
//   const { pathname } = req.nextUrl;
//   const referer = req.headers.get("referer");

//   if (!pathname.startsWith("/embed")) return null;
//   if (!referer) return null;

//   const baseReferer = new URL(referer).host;
//   const host = req.headers.get("host");

//   const { searchParams } = new URL(req.url);
//   const identifier = searchParams.get("identifier");
//   const appCode = (pathname.match(/\/embed\/(.+)/) ?? [])[1];
//   console.log("Identifier", identifier);
//   console.log("App code", appCode);

//   await dbConnect();

//   if (baseReferer !== host)
//     return Response.json(
//       {
//         status: "fail",
//         message: "Embedding not allowed from this domain.",
//       },
//       { status: 401 }
//     );

//   return null;
// };
