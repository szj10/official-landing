import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import { I18nProvider } from "@/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huavoi - AI-Powered Video Creation from Script to Screen",
  description:
    "Transform ideas into professional videos in minutes. End-to-end AI solution for scriptwriting, voice synthesis, and video generation. One platform, complete video production.",
  icons: {
    icon: [
      { url: "/icons8/icons8-voice-color-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons8/icons8-voice-color-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons8/icons8-voice-color-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/icons8/icons8-voice-color-96.png", sizes: "96x96", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950">
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
