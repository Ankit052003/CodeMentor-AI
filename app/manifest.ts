import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodeMentor AI",
    short_name: "CodeMentor",
    description: "AI-powered code review learning platform for beginner programmers.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f0f4fe",
    theme_color: "#4f46e5",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
