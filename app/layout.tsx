import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#15202b",
};

export const metadata: Metadata = {
  title: "X Post Preview — See How Your Tweet Will Look",
  description:
    "Preview your X/Twitter posts before publishing. Customize text, media, profile info and see an exact replica of how your post will appear in the feed.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "X Post Preview",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-(--font-inter) overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
