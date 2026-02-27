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
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Taxi Stockholm — Premium Tesla Taxi Service",
  description:
    "Stockholm's Premier Tesla-Only Taxi Fleet. Experience luxury transportation with Tesla Model S 2024, zero emissions, and fixed pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-w-0 overflow-x-hidden antialiased w-full`}>{children}</body>
    </html>
  );
}
