import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const airstream = localFont({
  src: "./fonts/airstream.ttf",
  variable: "--font-airstream",
  display: "swap",
});

const dymaxion = localFont({
  src: "./fonts/dymaxion.ttf",
  variable: "--font-dymaxion",
  display: "swap",
});

const sometype = localFont({
  src: "./fonts/sometype-mono.ttf",
  variable: "--font-sometype",
  display: "swap",
});

// const astronomus = localFont({
//   src: "./fonts/astronomus.ttf",
//   variable: "--font-astronomus",
//   display: "swap",
// });

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${airstream.variable} ${dymaxion.variable} ${sometype.variable} font-sometype antialiased`}
      >
        {children}
      </body>
    </html>
  );
}