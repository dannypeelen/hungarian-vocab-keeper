import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Szókincs — Hungarian Vocab Keeper",
  description: "A minimalist flashcard app for advanced Hungarian vocabulary",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
