import { localAirstream, localAstronomus, localDymaxion, localDestrubia } from "@/lib/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TaskProvider } from "@/lib/TaskContext";

export const metadata = {
  title: "Easy Club",
  description: "BMSCE IEEE CS Management Hub",
};

import { CursorGlow } from "@/components/CursorGlow";
import { PremiumBackground } from "@/components/ui/PremiumBackground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${localAirstream.variable} ${localAstronomus.variable} ${localDymaxion.variable} ${localDestrubia.variable} font-destrubia antialiased selection:bg-gold-500/30 overflow-x-hidden`}
      >
        <PremiumBackground />
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
