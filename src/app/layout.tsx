import type { Metadata } from "next";
import { Geist_Mono, Roboto } from "next/font/google";

import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manutenção Escolar",
  description: "Sistema de Manutenção Escolar",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-[family:var(--font-roboto)]">
        {children}
      </body>
    </html>
  );
}
