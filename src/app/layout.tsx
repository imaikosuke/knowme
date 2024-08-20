import type { Metadata } from "next";
import "./global.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "KnowMe?",
  description: "KnowMe? is a web app game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}
        style={{ backgroundImage: "url('/paper-background.png')" }}
      >
        {children}
      </body>
    </html>
  );
}
