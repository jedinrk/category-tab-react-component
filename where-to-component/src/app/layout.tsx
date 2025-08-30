import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
