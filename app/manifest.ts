import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResumeGPT Pro - AI-Powered Resume Intelligence",
    short_name: "ResumeGPT Pro",
    description:
      "Advanced GenAI resume builder with context-aware analysis, ATS optimization, and AI-powered insights. Features semantic matching, keyword intelligence, and real-time feedback.",
    start_url: "/",
    display: "standalone",
    background_color: "#2563eb", // blue-600
    theme_color: "#2563eb", // blue-600
    icons: [
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
    ],
  };
}
