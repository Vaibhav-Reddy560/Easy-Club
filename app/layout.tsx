import { localAirstream, localAstronomus, localDymaxion, localDestrubia } from "@/lib/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TaskProvider } from "@/lib/TaskContext";

export const metadata = {
  title: "Easy Club",
  description: "Easy Club - Collaborative Management Workspace",
  icons: {
    icon: "/Logo.png",
  },
};
// Security: CSP is now managed via next.config.ts for better control over 'unsafe-eval'



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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PremiumBackground />
          <TaskProvider>
            {children}
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
