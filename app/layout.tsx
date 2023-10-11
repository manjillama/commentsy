import AuthProvider from "@/context/auth-provider";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import Provider from "@/context/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(options);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <Provider>{children} </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
