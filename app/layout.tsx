import { localAirstream, localAstronomus, localDymaxion, localSometypeMono } from "@/lib/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TaskProvider } from "@/lib/TaskContext";

export const metadata = {
  title: "Easy Club",
  description: "BMSCE IEEE CS Management Hub",
};

import { CursorGlow } from "@/components/CursorGlow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={localSometypeMono.variable}>
      <body
        className={`${localAirstream.variable} ${localAstronomus.variable} ${localDymaxion.variable} ${localSometypeMono.variable} antialiased selection:bg-gold-500/30 overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CursorGlow />
          <TaskProvider>
            {children}
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
