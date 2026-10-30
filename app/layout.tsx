import { Inter } from "next/font/google";
import RootComponent from "@/components/root-component";
import "./globals.css";
import { Metadata } from "next";
import { SITE_DATA } from "@/constants";
import { siteUrl } from "@/utils/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_DATA.title,
  description: SITE_DATA.description,
  // Public marketing pages explicitly opt in to indexing.
  robots: { index: false, follow: false },
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
