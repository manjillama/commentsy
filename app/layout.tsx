import { Inter } from "next/font/google";
import RootComponent from "@/components/root-component";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootComponent>{children}</RootComponent>
      </body>
    </html>
  );
}
