import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const airstream = localFont({
  src: [
    {
      path: './fonts/airstream.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
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

const astronomus = localFont({
  src: "./fonts/astronomus.ttf",
  variable: "--font-astronomus",
  display: "swap",
});

import { TaskProvider } from "@/lib/TaskContext";
import TaskOverlay from "@/components/TaskOverlay";

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
        <TaskProvider>
            {children}
            <TaskOverlay />
        </TaskProvider>
      </body>
    </html>
  );
}