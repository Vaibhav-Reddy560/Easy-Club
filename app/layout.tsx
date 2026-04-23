import { localAirstream, localAstronomus, localDymaxion, localSometypeMono } from "@/lib/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Easy Club",
  description: "Manage your club memberships and sponsorships with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${localAirstream.variable} ${localAstronomus.variable} ${localDymaxion.variable} ${localSometypeMono.variable} font-mono antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
