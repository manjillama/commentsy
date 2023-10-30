import { Inter } from "next/font/google";
import RootComponent from "@/components/root-component";
import "./globals.css";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: SITE_DATA.title,
  description: SITE_DATA.description,
  openGraph: {
    images: `${process.env.NEXT_PUBLIC_SITE_URL}/thumbnail.jpg`,
  },
};

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
