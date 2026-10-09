import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ForCondom", template: "%s · ForCondom" },
  description: "A economia do seu condomínio, organizada.",
  appleWebApp: { capable: true, title: "ForCondom", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} min-h-dvh antialiased`}>{children}</body>
    </html>
  );
}
