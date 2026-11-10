import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
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
  metadataBase: new URL("https://travel-os.pdpcomunica.com"),
  title: { default: "Travel OS", template: "%s · Travel OS" },
  description:
    "Software para agencias de viajes y mayoristas: CRM, cotizador con IA, itinerarios, portal del viajero y tablero gerencial.",
  applicationName: "Travel OS",
  manifest: "/manifest.webmanifest",
  // Las pantallas internas requieren sesión: fuera del índice salvo que la página diga lo contrario.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b1530" };

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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
