import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryresumegpt.vercel.app"),
  title: "ResumeGPT - AI-Powered Resume Builder",
  description:
    "Create perfect resumes with AI. Type naturally, watch your resume build in real-time.",
  keywords: [
    "resume builder",
    "AI resume",
    "resume optimization",
    "ATS optimization",
    "job application",
    "career tools",
  ],
  authors: [{ name: "ResumeGPT" }],
  creator: "ResumeGPT",
  publisher: "ResumeGPT",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "ResumeGPT - AI-Powered Resume Builder",
    description:
      "Create perfect resumes with AI. Type naturally, watch your resume build in real-time.",
    url: "https://tryresumegpt.vercel.app",
    siteName: "ResumeGPT",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeGPT - AI Resume Builder",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeGPT - AI-Powered Resume Builder",
    description:
      "Create perfect resumes with AI. Type naturally, watch your resume build in real-time.",
    images: ["/twitter-image.png"],
    creator: "@resumegpt",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
