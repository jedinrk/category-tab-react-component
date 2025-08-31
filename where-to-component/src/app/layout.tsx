import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bradfordLLWeb = localFont({
  src: "../../public/fonts/BradfordLLWeb-Medium.woff2",
  variable: "--font-bradford-ll-web",
  display: "swap",
  preload: true,
});

const theinhardtMedium = localFont({
  src: "../../public/fonts/Theinhardt-Medium.fc38eab.woff2",
  variable: "--font-theinhardt-medium",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "WHERE TO Component - 53 West 53",
  description: "A pixel-perfect implementation of the WHERE TO component from 53 West 53 neighborhood page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bradfordLLWeb.variable} ${theinhardtMedium.variable}`}>{children}</body>
    </html>
  );
}
