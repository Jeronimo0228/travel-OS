import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body-custom",
  subsets: ["latin"],
});

const headlineFont = Plus_Jakarta_Sans({
  variable: "--font-headline",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelOS AI",
  description: "S.O. de Agencia — TravelOS AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${bodyFont.variable} ${headlineFont.variable} font-body-custom antialiased bg-surface text-on-surface`}
      >
        {children}
      </body>
    </html>
  );
}
