import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoBuddy",
  description: "Graphify maps the repo, Gemma 4 tells you where to start contributing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
