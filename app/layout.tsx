import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const airstream = localFont({
  src: "../public/fonts/airstream.ttf",
  variable: "--font-airstream",
});

const dymaxion = localFont({
  src: "../public/fonts/dymaxion.ttf",
  variable: "--font-dymaxion",
});

const sometype = localFont({
  src: "../public/fonts/sometype-mono.ttf",
  variable: "--font-sometype",
});

const astronomus = localFont({
  src: "../public/fonts/astronomus.ttf",
  variable: "--font-astronomus",
});

export const metadata: Metadata = {
  title: "Easy Club",
  description: "BMSCE IEEE CS Management Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${airstream.variable} ${dymaxion.variable} ${sometype.variable} ${astronomus.variable}`}>
      <body className={`${inter.className} font-sometype antialiased`}>
        {children}
      </body>
    </html>
  );
}